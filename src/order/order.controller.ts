import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enum/order-status.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return await this.orderService.createOrder(req.user.id, createOrderDto);
    }

    @ApiOperation({ summary: 'Get all orders for current user' })
    @ApiResponse({ status: 200, description: 'Returns user orders' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserOrders(@Request() req) {
        return await this.orderService.getUserOrders(req.user.id);
    }

    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'orderId', description: 'Order ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns order details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get(':orderId')
    async getOrderById(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
        return await this.orderService.getOrderById(req.user.id, orderId);
    }

    @ApiOperation({ summary: 'Cancel an order' })
    @ApiParam({ name: 'orderId', description: 'Order ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Patch(':orderId/cancel')
    async cancelOrder(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
        return await this.orderService.cancelOrder(req.user.id, orderId);
    }

    @ApiOperation({ summary: 'Update order status (Admin only)' })
    @ApiParam({ name: 'orderId', description: 'Order ID', example: 1 })
    @ApiBody({ 
        schema: { 
            type: 'object', 
            properties: { 
                status: { 
                    type: 'string', 
                    enum: Object.values(OrderStatus),
                    example: OrderStatus.SHIPPED 
                } 
            } 
        } 
    })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':orderId/status')
    async updateOrderStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('status') status: OrderStatus
    ) {
        return await this.orderService.updateOrderStatus(orderId, status);
    }
}
