import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Product } from 'src/product/entity/product.entity';
import { AddproductToCartDto } from './dto/add-product-to-cart.dto';

@Injectable()
export class CartService {
    constructor(@InjectRepository(Cart) private readonly cartRepo : Repository<Cart>,
                @InjectRepository(CartItem) private readonly cartItemRepo : Repository<CartItem>,
                @InjectRepository(Product) private readonly productRepo : Repository<Product>){}

    async addItem(userId : number, addProductToCartDto : AddproductToCartDto){
        const {productId, quantity} = addProductToCartDto;
        if(quantity <= 0) {
            throw new BadRequestException('Quantity must be >=1');
        }

        let cart = await this.cartRepo.findOne({
            where : {user : {id: userId}},
            relations : ['item', 'item.product']
        });

        if(!cart){
            cart = this.cartRepo.create({ user : {id : userId}});
            await this.cartRepo.save(cart);
        }

        const product = await this.productRepo.findOne({where : {id : productId}})
        if(!product){
            throw new NotFoundException('Product nor found.');
        }

        if(product.quantity < quantity){
            throw new BadRequestException("Insufficient product quantity.");
        }

        const existingItem = cart.item?.find(item => item.product.id === productId);

        if(existingItem){
            throw new BadRequestException('Product already in cart. Use update endpoint to modify quantity');
        }

        const cartItem = this.cartItemRepo.create({
            cart : {id : cart.id},
            product : {id : productId}
        });
         
        await this.cartItemRepo.save(cartItem);
        return this.cartRepo.findOne({
            where : {id : cart.id},
            relations : ['item', 'item.product']
        });

    }

    
}
