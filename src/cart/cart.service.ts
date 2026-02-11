import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { AddproductToCartDto } from './dto/add-product-to-cart.dto';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CartService {
    constructor(@InjectRepository(Cart) private readonly cartRepo : Repository<Cart>,
                @InjectRepository(CartItem) private readonly cartItemRepo : Repository<CartItem>,
                private readonly productService : ProductService){}

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

        const product = await this.productService.getProductById(productId);
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
            product : {id : productId},
            quantity : quantity
        });
         
        await this.cartItemRepo.save(cartItem);
        return this.cartRepo.findOne({
            where : {id : cart.id},
            relations : ['item', 'item.product']
        });
    }

    async getUserCart(userId : number){
        const cart = await this.cartRepo.findOne({
            where : {user : {id : userId}},
            relations : ['item' , 'item.product']
        });
        if(!cart) throw new NotFoundException("Nothing found in the cart");
        return cart;
    }


    async getCartItemByItemId(userId : number, cartItemId : number){
        const cartItem = await this.cartItemRepo.findOne({
            where : {id : cartItemId},
            relations : ['cart', 'cart.user', 'product']
        });

        if(!cartItem){
            throw new NotFoundException('Cart item not found.');
        }
        if(cartItem.cart.user.id !== userId){
            throw new UnauthorizedException("This item does not belong to your cart.");
        }
        return cartItem;
    }

    async updateCartItemQuantity(userId : number, cartItemId : number, quantity : number){
        if(quantity < 0){
            throw new BadRequestException('Quantity must be >= 0');
        }

        const cartItem = await this.getCartItemByItemId(userId, cartItemId);

        if(quantity === 0){
            return await this.removeItemFromCart(userId, cartItemId);
        }

        const product = await this.productService.getProductById(cartItem.product.id);
        if(product.quantity < quantity){
            throw new BadRequestException('Insufficient product quantity.');
        }

        cartItem.quantity = quantity;
        await this.cartItemRepo.save(cartItem);

        return this.getUserCart(userId);
    }

    async removeItemFromCart(userId : number, cartItemId : number){
        await this.getCartItemByItemId(userId, cartItemId);
        await this.cartItemRepo.delete(cartItemId);
        return this.getUserCart(userId);
    }

    async clearCart(userId : number){
        const cart = await this.cartRepo.findOne({
            where : {user : {id : userId}},
            relations : ['item']
        });

        if(!cart){
            throw new NotFoundException('Cart not found.');
        }

        if(cart.item && cart.item.length > 0){
            await this.cartItemRepo.delete(cart.item.map(item => item.id));
        }

        return {message : 'Cart cleared successfully'};
    }
}
