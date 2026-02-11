import { User } from "src/users/entity/user.entity";
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./cart-item.entity";

@Entity("carts")
export class Cart{
    @PrimaryGeneratedColumn({type:"int"})
    id! : number;

    @OneToOne(()=> User, (user)=> user.cart, {onDelete : 'CASCADE'})
    @JoinColumn()
    user! : User;

    @OneToMany(()=> CartItem, (item)=>item.cart, {cascade: true})
    item! : CartItem[];

}