import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService :AuthService){}
    @Post('/signup')
    @UsePipes(new ValidationPipe())
    async userSignup(@Body() registerDto: RegisterDto) : Promise<any>{
        return await this.authService.userSignUp(registerDto);
    }

}
