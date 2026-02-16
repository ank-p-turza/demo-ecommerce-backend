import { Order } from "src/order/entity/order.entity";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TransactionStatus } from "../enum/transaction-status.enum";

@Entity('transactions')
@Index(['transactionId'])
@Index(['validationId'])
export class Transaction{
    @PrimaryGeneratedColumn({type : 'int'})
    id!: number;

    @Column({unique : true})
    transactionId !: string;

    @Column({unique : true, nullable: true})
    validationId?: string;
    
    @ManyToOne(()=> Order, (order)=> order.transactions, {onDelete: "CASCADE"})
    order! : Order;

    @Column({type : 'decimal', precision: 10, scale : 2})
    amount! : string;

    @Column({default : 'BDT'})
    currency!: string;

    @Column({
        type : 'enum',
        enum : TransactionStatus,
        default : TransactionStatus.UNATTEMPTED
    })
    status ! : TransactionStatus;

    @Column({nullable : true})
    paymentMethod? : string;

    @Column({type : 'jsonb', nullable: true})
    gatewayResponse? : any;

    @CreateDateColumn()
    createdAt!: Date;

    @CreateDateColumn()
    updatedAt!: Date;

}
