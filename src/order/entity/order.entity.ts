import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/users/entity/user.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "src/common/enum/order-status.enum";
import { Transaction } from 'src/payment/entity/transaction.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn({type: 'int'})
    id!: number;

    @ManyToOne(() => User, (user) => user.orders, {onDelete: 'CASCADE'})
    user!: User;

    @Column({type: 'decimal', precision: 10, scale: 2})
    totalAmount!: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status!: OrderStatus;

    @Column({type: 'text', nullable: true})
    shippingAddress?: string;

    @Column({type: 'text', nullable: true})
    notes?: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {cascade: true, eager: true})
    items!: OrderItem[];

    @OneToMany(()=> Transaction, (transaction)=> transaction.order, {cascade : true})
    transactions!: Transaction[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
