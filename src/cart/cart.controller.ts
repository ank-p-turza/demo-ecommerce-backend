import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddproductToCartDto } from './dto/add-product-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
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
    @UseGuards(JwtAuthGuard)
    @Patch('/items/:cartItemId')
    async changeCartItemQuantity(
        @Request() req, 
        @Param('cartItemId', ParseIntPipe) cartItemId: number,
        @Body() updateCartItemDto: UpdateCartItemDto
    ){
        return await this.cartService.updateCartItemQuantity(req.user.id, cartItemId, updateCartItemDto.quantity);
    }

    // Removes a specific product from the cart.
    @UseGuards(JwtAuthGuard)
    @Delete('/items/:cartItemId')
    async deleteItemFromCart(
        @Request() req,
        @Param('cartItemId', ParseIntPipe) cartItemId: number
    ){
        return await this.cartService.removeItemFromCart(req.user.id, cartItemId);
    }

    // Clears the entire cart 
    @UseGuards(JwtAuthGuard)
    @Delete()
    async deleteAll(@Request() req){
        return await this.cartService.clearCart(req.user.id);
    }
}

