import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RoleEnum } from 'src/common/enum/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserVerificationDto } from 'src/users/dto/user-verification.dto';
import { ResendOtpDto } from 'src/users/dto/resend-otp.dto';



@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('/signup')
    @UsePipes(new ValidationPipe())
    async userSignup(@Body() registerDto: RegisterDto): Promise<any>{
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

    @Post('/verify-email')
    @UsePipes(new ValidationPipe())
    async verifyEmail(@Body() userVerificationDto: UserVerificationDto){
        return await this.authService.verifyEmail(
            userVerificationDto.id,
            userVerificationDto.otp
        );
    }

    @Post('/resend-otp')
    @UsePipes(new ValidationPipe())
    async resendOTP(@Body() resendOtpDto: ResendOtpDto){
        return await this.authService.resendOTP(resendOtpDto.id);
    }
}
