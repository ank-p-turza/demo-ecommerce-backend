import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "src/product/entity/product.entity";

@Entity('orderitems')
export class OrderItem {
    @PrimaryGeneratedColumn({type: 'int'})
    id!: number;

    @ManyToOne(() => Order, (order) => order.items, {onDelete: 'CASCADE'})
    order!: Order;

    @ManyToOne(() => Product, (product) => product.orderItems)
    product!: Product;

    @Column({type: 'int'})
    quantity!: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    priceAtPurchase!: string;

    @Column({type: 'decimal', precision: 10, scale: 2})
    subtotal!: string;
}
