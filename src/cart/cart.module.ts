import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports : [TypeOrmModule.forFeature([Cart, CartItem]), ProductModule],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
