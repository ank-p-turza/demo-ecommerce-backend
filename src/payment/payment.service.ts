import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/enum/order-status.enum';
import { Order } from 'src/order/entity/order.entity';
import { User } from 'src/users/entity/user.entity';
import { DataSource, Repository } from 'typeorm';
import { TransactionStatus } from './enum/transaction-status.enum';
import { Transaction } from 'src/payment/entity/transaction.entity';
import { IpnBodyDto } from './dto/ipn-body.dto';

const SSLCommerzPayment = require('sslcommerz-lts');

@Injectable()
export class PaymentService {
    private sslcommerz: any;
    private readonly storeId: string;
    private readonly storePassword: string;
    private readonly isLive: boolean;

    constructor(
        @InjectRepository(Transaction) private readonly transctionRepo: Repository<Transaction>,
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource 
    ) {
        this.storeId = process.env.SSLC_STORE_ID || "";
        this.storePassword = process.env.SSLC_STORE_PASSWORD || "";
        this.isLive = process.env.SSLC_IS_LIVE == 'true' || false;

        this.sslcommerz = new SSLCommerzPayment(
            this.storeId,
            this.storePassword,
            this.isLive
        );
    }

    async initiatePayment(userId: number, orderId : number){
        const order = await this.orderRepo.findOne({
            where : {id : orderId, user: {id : userId}},
            relations : ['user', 'items', 'items.product']
        });

        if(!order){
            throw new NotFoundException('Order not found.');
        }

        if(order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAYMENT_PENDING){
            throw new BadRequestException('Order can not be completed.'+order.status);
        }

        const existingTransaction = await this.transctionRepo.findOne({
            where : {
                order : {id : orderId},
                status : TransactionStatus.VALID
            }
        })

        if(existingTransaction){
            throw new BadRequestException("Payment already completed for this order");
        }

        const transactionId = `TXN-${orderId}-${Date.now()}`;

        const transaction = this.transctionRepo.create({
            transactionId,
            order : {id : orderId},
            amount : order.totalAmount,
            currency : 'BDT',
            status : TransactionStatus.UNATTEMPTED
        });
        await this.transctionRepo.save(transaction);

        const data = {
            total_amount : Number.parseFloat(order.totalAmount),
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${process.env.BACKEND_URL}/payment/success`,
            fail_url: `${process.env.BACKEND_URL}/payment/fail`,
            cancel_url: `${process.env.BACKEND_URL}/payment/cancel`,
            ipn_url: `${process.env.BACKEND_URL}/payment/ipn`,
            shipping_method: 'NO',
            product_name: `Order #${orderId}`,
            product_category: 'E-commerce',
            product_profile: 'general',
            cus_name: order.user.name,
            cus_email: order.user.email,
            cus_add1: order.shippingAddress || 'N/A',
            cus_city: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01700000000',
            ship_name: order.user.name,
            ship_add1: order.shippingAddress || 'N/A',
            ship_city: 'Dhaka',
            ship_postcode: '1000',
            ship_country: 'Bangladesh',
        }

        try {
            const apiResponse = await this.sslcommerz.init(data);

            if(apiResponse.status === 'SUCCESS'){
                order.status = OrderStatus.PAYMENT_PENDING;
                await this.orderRepo.save(order);

                return {
                    paymentUrl : apiResponse.GatewayPageURL,
                    transactionId,
                    amount : order.totalAmount
                };
            }
            else{
                throw new InternalServerErrorException('Failed to initiate payment');
            }
        }
        catch(error){
            console.log('SSLCommerz initialization error:', error);
            throw new InternalServerErrorException("Payment Gateway error ");
        }

    }

    async handlePaymentSuccess(body : any, token : string){
        // implement later
        return;
    }

    async handlePaymentCancel(){
        // implement later
        return;
    }

        async handleIPN(body: IpnBodyDto) {
        const { tran_id, val_id } = body;
        
        if (!val_id) {
            throw new BadRequestException('Validation ID is required');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const transaction = await queryRunner.manager.findOne(Transaction, {
                where: { transactionId: tran_id },
                relations: ['order', 'order.user'],
                lock: { mode: 'pessimistic_write' }
            });

            if (!transaction) {
                throw new NotFoundException('Transaction not found.');
            }

            if (transaction.status === TransactionStatus.VALID) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                console.log(`IPN received for already processed transaction: ${tran_id}`);
                return {
                    message: 'Payment already processed',
                    transactionId: tran_id,
                    status: 'success'
                };
            }

            const isValid = await this.validatePayment(body, transaction);

            if (isValid) {
                transaction.validationId = val_id;
                transaction.status = TransactionStatus.VALID;
                transaction.gatewayResponse = body;
                transaction.paymentMethod = body.card_type || 'Unknown';

                transaction.order.status = OrderStatus.PAID;

                await queryRunner.manager.save(Transaction, transaction);
                await queryRunner.manager.save(Order, transaction.order);

                await queryRunner.commitTransaction();
                
                await queryRunner.release();

                console.log(`Payment processed successfully for transaction: ${tran_id}`);

                return {
                    message: 'Payment processed successfully',
                    transactionId: tran_id,
                    orderId: transaction.order.id,
                    status: 'success'
                };
            } else {
                throw new InternalServerErrorException('Payment validation failed');
            }

        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`IPN processing failed for transaction ${tran_id}:`, error);

            if (error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof InternalServerErrorException) {
                throw error;
            }

            throw new InternalServerErrorException('Unexpected error during payment processing');

        } finally {
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }
        }
    }

    private validatePaymentDetails(body: IpnBodyDto, valResponse: any): boolean {
        const bodyAmount = Number.parseFloat(body.amount || '0');
        const valAmount = Number.parseFloat(valResponse.amount || '0');
        
        const isValid =
            body.tran_id === valResponse.tran_id &&
            body.val_id === valResponse.val_id &&
            Math.abs(bodyAmount - valAmount) < 0.01 &&
            body.card_no === valResponse.card_no &&
            body.card_type === valResponse.card_type &&
            body.card_issuer === valResponse.card_issuer &&
            body.card_brand === valResponse.card_brand &&
            body.card_issuer_country_code === valResponse.card_issuer_country_code &&
            body.currency_amount === valResponse.currency_amount;

        if (!isValid) {
            console.error('Payment validation mismatch:', {
                bodyFields: {
                    tran_id: body.tran_id,
                    val_id: body.val_id,
                    amount: body.amount,
                    card_no: body.card_no,
                },
                validationFields: {
                    tran_id: valResponse.tran_id,
                    val_id: valResponse.val_id,
                    amount: valResponse.amount,
                    card_no: valResponse.card_no,
                }
            });
        }

        return isValid;
    }

    async validatePayment(body: IpnBodyDto, transaction: Transaction): Promise<boolean> {
        const { val_id } = body;

        try {
            const valResponse = await this.sslcommerz.validate({
                val_id: val_id
            });

            console.log('SSLCommerz validation response:', {
                tran_id: valResponse.tran_id,
                status: valResponse.status,
                amount: valResponse.amount
            });

            const gatewayStatus = valResponse.status?.toUpperCase();

            if (gatewayStatus !== 'VALID' && gatewayStatus !== 'VALIDATED') {
                const mappedStatus = this.mapGatewayStatusToEnum(gatewayStatus);
                transaction.status = mappedStatus;
                transaction.gatewayResponse = {
                    validation: valResponse,
                    ipn: body,
                    timestamp: new Date().toISOString()
                };
                await this.transctionRepo.save(transaction);
                throw new BadRequestException(`Payment validation failed with status: ${gatewayStatus}`);
            }

            const matched = this.validatePaymentDetails(body, valResponse);

            if (!matched) {
                transaction.status = TransactionStatus.FAILED;
                transaction.gatewayResponse = {
                    validation: valResponse,
                    ipn: body,
                    reason: 'Payment details mismatch between IPN and validation',
                    timestamp: new Date().toISOString()
                };
                await this.transctionRepo.save(transaction);
                throw new BadRequestException('Payment details do not match');
            }

            return true;

        } catch (error) {
            console.error('Payment validation error:', error);

            if (error instanceof BadRequestException) {
                throw error;
            }

            transaction.status = TransactionStatus.FAILED;
            transaction.gatewayResponse = {
                ipn: body,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            };
            await this.transctionRepo.save(transaction);
            throw new InternalServerErrorException('Payment validation error occurred');
        }
    }

    private mapGatewayStatusToEnum(status: string): TransactionStatus {
        const normalizedStatus = status?.toUpperCase();
        
        const statusMap: { [key: string]: TransactionStatus } = {
            'VALID': TransactionStatus.VALID,
            'VALIDATED': TransactionStatus.VALID,
            'FAILED': TransactionStatus.FAILED,
            'CANCELLED': TransactionStatus.CANCELLED,
            'EXPIRED': TransactionStatus.EXPIRED,
        };

        return statusMap[normalizedStatus] || TransactionStatus.FAILED;
    }
}
