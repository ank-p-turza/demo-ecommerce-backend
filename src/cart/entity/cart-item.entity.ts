import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "src/product/entity/product.entity";

@Entity('cartitems')
export class CartItem{
    
    @PrimaryGeneratedColumn({type : 'int'})
    id!: number; 

    @Column({type : 'int', default : 1})
    quantity! : number;

    @ManyToOne(()=>Cart, (cart)=> cart.item, { onDelete : 'CASCADE'})
    cart !: Cart;

    @ManyToOne(()=> Product, (product)=> product.cartItems, {eager: true})
    product! : Product;

}