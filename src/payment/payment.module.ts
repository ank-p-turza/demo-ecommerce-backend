import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Transaction } from './entity/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entity/order.entity';
import { User } from 'src/users/entity/user.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Transaction, Order, User])
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports : [PaymentService]
})
export class PaymentModule {}
