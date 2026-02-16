import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Product } from 'src/product/entity/product.entity';
import { User } from 'src/users/entity/user.entity';
import { EmailapiModule } from 'src/common/emailapi/emailapi.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    EmailapiModule
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService]
})
export class OrderModule {}
