import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStratrgy } from './strategies/local.stratrgy';
import { PassportModule } from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';

@Module({
  imports : [UsersModule, PassportModule.register({defaultStrategy : 'jwt'}),
    JwtModule.register({
      secret: String(process.env.JWT_SECRET_KEY),
      signOptions:{
        expiresIn : 3600,
      }
    })
  ],
  providers: [AuthService, LocalStratrgy],
  controllers: [AuthController]
})
export class AuthModule {}
