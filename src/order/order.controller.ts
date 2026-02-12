import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enum/order-status.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return await this.orderService.createOrder(req.user.id, createOrderDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserOrders(@Request() req) {
        return await this.orderService.getUserOrders(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':orderId')
    async getOrderById(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
        return await this.orderService.getOrderById(req.user.id, orderId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':orderId/cancel')
    async cancelOrder(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
        return await this.orderService.cancelOrder(req.user.id, orderId);
    }

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
