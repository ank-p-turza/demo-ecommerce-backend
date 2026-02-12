import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStratrgy } from './strategies/local.stratrgy';
import { PassportModule } from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailapiModule } from 'src/common/emailapi/emailapi.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';

@Module({
  imports: [
    UsersModule,
    EmailapiModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStratrgy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
