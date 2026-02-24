import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddproductToCartDto } from './dto/add-product-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
    constructor (private readonly cartService : CartService){}

    @ApiOperation({ summary: 'Get user shopping cart' })
    @ApiResponse({ status: 200, description: 'Returns user cart with items' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get()
    async getCart(@Request() req){
        return this.cartService.getUserCart(req.user.id);
    }
    

    //add products to the cart
    //@Roles(RoleEnum.CUSTOMER)
    @ApiOperation({ summary: 'Add product to cart' })
    @ApiResponse({ status: 201, description: 'Product added to cart' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('/items')
    async addProdcuts(@Request() req, @Body() addProductToCartDto : AddproductToCartDto){
        return await this.cartService.addItem(req.user.id, addProductToCartDto);
    }

    // Updates the quantity of a specific item (e.g., changing 1 shirt to 2).
    @ApiOperation({ summary: 'Update cart item quantity' })
    @ApiParam({ name: 'cartItemId', description: 'Cart Item ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Cart item quantity updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    @ApiBearerAuth('JWT-auth')
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
    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiParam({ name: 'cartItemId', description: 'Cart Item ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Item removed from cart' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Delete('/items/:cartItemId')
    async deleteItemFromCart(
        @Request() req,
        @Param('cartItemId', ParseIntPipe) cartItemId: number
    ){
        return await this.cartService.removeItemFromCart(req.user.id, cartItemId);
    }

    // Clears the entire cart 
    @ApiOperation({ summary: 'Clear entire cart' })
    @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Delete()
    async deleteAll(@Request() req){
        return await this.cartService.clearCart(req.user.id);
    }
}

