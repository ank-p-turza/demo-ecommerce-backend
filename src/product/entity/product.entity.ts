import { CartItem } from "src/cart/entity/cart-item.entity";
import { OrderItem } from "src/order/entity/order-item.entity";
import { User } from "src/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product{
    @PrimaryGeneratedColumn({type : 'int'})
    id! : number;

    @Column({type : 'text', nullable: false})
    name!: string;

    @Column({type : 'text', nullable: false})
    description! : string;

    @Column({type : 'numeric', precision: 14, scale: 2, nullable: false})
    price!: string;

    @Column({type : 'int' })
    quantity! : number;


    @ManyToOne(()=> User, (user)=> user.products,{
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({name : 'owner_id'})
    owner!: User;

    @Column({name : "owner_id"})
    owner_id! : number;

    @OneToMany(()=> CartItem, (item)=> item.product)
    cartItems! : CartItem[];

    @OneToMany(()=> OrderItem, (item)=> item.product)
    orderItems!: OrderItem[];

}