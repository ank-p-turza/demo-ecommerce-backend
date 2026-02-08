import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly userService : UsersService){}

    async userSignUp(registerDto : RegisterDto){
        return await this.userService.createUser(registerDto);
    }
}
