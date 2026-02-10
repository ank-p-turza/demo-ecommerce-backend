import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from 'src/common/enum/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';



@Controller('auth')
export class AuthController {
    constructor(private readonly authService :AuthService){}

    @Post('/signup')
    @UsePipes(new ValidationPipe())
    async userSignup(@Body() registerDto: RegisterDto) : Promise<any>{
        return await this.authService.userSignUp(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/signin')
    @UsePipes(new ValidationPipe())
    @UseGuards(LocalAuthGuard)
    async userSignIn(@Request() req){
        return await this.authService.signIn(req.user);
    }

    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('/test')
    async test(@Request() req){
        console.log(req.user);
        return req.user;
    }
}
