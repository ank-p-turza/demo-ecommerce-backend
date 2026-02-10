import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './interface/user-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly userService : UsersService,
        private readonly jwtService : JwtService
    ){}

    async userSignUp(registerDto : RegisterDto){
        return await this.userService.createUser(registerDto);
    }

    async validateUser(loginDto : LoginDto){
        const {email, password } = loginDto;
        const user = await this.userService.getUserbyEmail(email);
        if(!user){
            throw new UnauthorizedException("User not found.");
        }
        
        if(user && await bcrypt.compare(password, user.password)){
            const {password, ...all} = user;
            return all;
        }
        throw new UnauthorizedException("Invalid credentials.");
    }

    async signIn(userPayload : UserPayload){
        const token = this.jwtService.sign(userPayload);
        return {
            token,
            token_expires : 3600,
            user : userPayload
        }
    }
}
