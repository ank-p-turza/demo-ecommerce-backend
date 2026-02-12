import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Product } from 'src/product/entity/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enum/order-status.enum';
import Decimal from 'decimal.js';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        private readonly dataSource: DataSource
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

                // Deduct stock
                product.quantity -= quantity;
                await queryRunner.manager.save(product);
            }

            await queryRunner.commitTransaction();

            // Fetch and return complete order with relations
            return await this.orderRepo.findOne({
                where: { id: order.id },
                relations: ['items', 'items.product']
            });

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

            // Restore stock for all items
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
