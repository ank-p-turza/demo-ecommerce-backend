import { CartItem } from "src/cart/entity/cart-item.entity";
import { User } from "src/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @ManyToOne(()=> CartItem, (item)=> item.product)
    cartItems! : CartItem[];

}