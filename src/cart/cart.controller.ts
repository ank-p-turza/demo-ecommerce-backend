import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddproductToCartDto } from './dto/add-product-to-cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
    constructor (private readonly cartService : CartService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getCart(@Request() req){
        return this.cartService.getUserCart(req.user.id);
    }
    

    //add products to the cart
    //@Roles(RoleEnum.CUSTOMER)
    @UseGuards(JwtAuthGuard)
    @Post('/items')
    async addProdcuts(@Request() req, @Body() addProductToCartDto : AddproductToCartDto){
        return await this.cartService.addItem(req.user.id, addProductToCartDto);
    }

    // Updates the quantity of a specific item (e.g., changing 1 shirt to 2).
    @Put('/items/:cartItemId')
    async changeCartItemQuantity(){
        return
    }

    // Removes a specific product from the cart.
    @Delete('/items/:cartItemId')
    async deleteItemFromCart(){
        return
    }

    // Clears the entire cart 
    @Delete()
    async deleteAll(){
        return
    }
}

