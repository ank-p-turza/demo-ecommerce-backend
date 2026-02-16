import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Product } from 'src/product/entity/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enum/order-status.enum';
import Decimal from 'decimal.js';
import { EmailapiService } from 'src/common/emailapi/emailapi.service';
import { SendEmailDto } from 'src/common/emailapi/dto/send-email.dto';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly emailapiService: EmailapiService
    ) {}

    async createOrder(userId: number, createOrderDto: CreateOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate all products and check stock availability
            const orderItems: {product: Product, quantity: number}[] = [];
            let totalAmount = new Decimal(0);

            for (const item of createOrderDto.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: item.productId },
                    lock: { mode: 'pessimistic_write' } // Lock row to prevent concurrent modifications
                });

                if (!product) {
                    throw new NotFoundException(`Product with ID ${item.productId} not found.`);
                }

                if (product.quantity < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for product "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`
                    );
                }

                if (product.quantity - item.quantity < 0) {
                    throw new BadRequestException(
                        `Cannot process order. This would result in negative inventory for "${product.name}".`
                    );
                }

                orderItems.push({ product, quantity: item.quantity });
                
                // Calculate subtotal for this item
                const itemSubtotal = new Decimal(product.price).times(item.quantity);
                totalAmount = totalAmount.plus(itemSubtotal);
            }

            // Create order
            const order = queryRunner.manager.create(Order, {
                user: { id: userId },
                totalAmount: totalAmount.toFixed(2),
                status: OrderStatus.PENDING,
                shippingAddress: createOrderDto.shippingAddress,
                notes: createOrderDto.notes
            });

            await queryRunner.manager.save(order);

            // Create order items and deduct stock
            for (const { product, quantity } of orderItems) {
                const subtotal = new Decimal(product.price).times(quantity);

                const orderItem = queryRunner.manager.create(OrderItem, {
                    order: { id: order.id },
                    product: { id: product.id },
                    quantity,
                    priceAtPurchase: product.price,
                    subtotal: subtotal.toFixed(2)
                });

                await queryRunner.manager.save(orderItem);

                product.quantity -= quantity;
                await queryRunner.manager.save(product);
            }

            await queryRunner.commitTransaction();

            const completeOrder = await this.orderRepo.findOne({
                where: { id: order.id },
                relations: ['items', 'items.product', 'user']
            });

            if (!completeOrder) {
                throw new InternalServerErrorException('Order details can not be shown now.');
            }

            try {
                const user = await this.userRepo.findOne({ where: { id: userId } });
                if (user?.email) {
                    const itemsList = completeOrder.items
                        .map(item => `- ${item.product.name} x ${item.quantity} = $${item.subtotal}`)
                        .join('\n');

                    const message = `Hello ${user.name},\n\nYour order #${completeOrder.id} has been successfully created!\n\nOrder Details:\n${itemsList}\n\nTotal Amount: $${completeOrder.totalAmount}\nShipping Address: ${completeOrder.shippingAddress}\nStatus: ${completeOrder.status}\n\nThank you for shopping with us!`;

                    const sendEmailDto: SendEmailDto = {
                        name: user.name,
                        to_email: user.email,
                        subject: `Order Confirmation - Order #${completeOrder.id}`,
                        message
                    };

                    await this.emailapiService.sendMail(sendEmailDto);
                }
            } catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
            }

            return completeOrder;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            console.error('Order creation error:', error);
            throw new InternalServerErrorException('Failed to create order. Please try again.');
        } finally {
            await queryRunner.release();
        }
    }

    async getUserOrders(userId: number) {
        const orders = await this.orderRepo.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' }
        });

        return orders;
    }

    async getOrderById(userId: number, orderId: number) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId, user: { id: userId } },
            relations: ['items', 'items.product']
        });

        if (!order) {
            throw new NotFoundException('Order not found.');
        }

        return order;
    }

    async updateOrderStatus(orderId: number, status: OrderStatus) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });

        if (!order) {
            throw new NotFoundException('Order not found.');
        }

        order.status = status;
        await this.orderRepo.save(order);

        return order;
    }

    async cancelOrder(userId: number, orderId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager.findOne(Order, {
                where: { id: orderId, user: { id: userId } },
                relations: ['items', 'items.product']
            });

            if (!order) {
                throw new NotFoundException('Order not found.');
            }

            if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAYMENT_PENDING) {
                throw new BadRequestException('Only pending orders can be cancelled.');
            }


            for (const item of order.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: item.product.id },
                    lock: { mode: 'pessimistic_write' }
                });

                if (product) {
                    product.quantity += item.quantity;
                    await queryRunner.manager.save(product);
                }
            }

            order.status = OrderStatus.CANCELLED;
            await queryRunner.manager.save(order);

            await queryRunner.commitTransaction();

            try {
                const user = await this.userRepo.findOne({ where: { id: userId } });
                if (user?.email) {
                    const itemsList = order.items
                        .map(item => `- ${item.product.name} x ${item.quantity} = $${item.subtotal}`)
                        .join('\n');

                    const message = `Hello ${user.name},\n\nYour order #${order.id} has been cancelled.\n\nOrder Details:\n${itemsList}\n\nTotal Amount: $${order.totalAmount}\n\nThe items have been returned to stock. If you have any questions, please contact our support team.`;

                    const sendEmailDto: SendEmailDto = {
                        name: user.name,
                        to_email: user.email,
                        subject: `Order Cancelled - Order #${order.id}`,
                        message
                    };

                    await this.emailapiService.sendMail(sendEmailDto);
                }
            } catch (emailError) {
                console.error('Failed to send order cancellation email:', emailError);
            }

            return order;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            console.error('Order cancellation error:', error);
            throw new InternalServerErrorException('Failed to cancel order.');
        } finally {
            await queryRunner.release();
        }
    }
}
