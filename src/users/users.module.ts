import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { EmailapiModule } from 'src/common/emailapi/emailapi.module';

@Module({
  imports :  [TypeOrmModule.forFeature([User]), EmailapiModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports : [UsersService]
})
export class UsersModule {}
