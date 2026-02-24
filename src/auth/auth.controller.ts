import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RoleEnum } from 'src/common/enum/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserVerificationDto } from 'src/users/dto/user-verification.dto';
import { ResendOtpDto } from 'src/users/dto/resend-otp.dto';
import { LoginDto } from './dto/login.dto';



@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post('/signup')
    @UsePipes(new ValidationPipe())
    async userSignup(@Body() registerDto: RegisterDto): Promise<any>{
        return await this.authService.userSignUp(registerDto);
    }

    @ApiOperation({ summary: 'Sign in with email and password' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'User successfully signed in' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @HttpCode(HttpStatus.OK)
    @Post('/signin')
    @UsePipes(new ValidationPipe())
    @UseGuards(LocalAuthGuard)
    async userSignIn(@Request() req){
        return await this.authService.signIn(req.user);
    }

    @ApiOperation({ summary: 'Test endpoint for admin role' })
    @ApiResponse({ status: 200, description: 'Returns current user info' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiBearerAuth('JWT-auth')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('/test')
    async test(@Request() req){
        console.log(req.user);
        return req.user;
    }

    @ApiOperation({ summary: 'Verify user email with OTP' })
    @ApiResponse({ status: 200, description: 'Email successfully verified' })
    @ApiResponse({ status: 400, description: 'Invalid OTP or user not found' })
    @Post('/verify-email')
    @UsePipes(new ValidationPipe())
    async verifyEmail(@Body() userVerificationDto: UserVerificationDto){
        return await this.authService.verifyEmail(
            userVerificationDto.id,
            userVerificationDto.otp
        );
    }

    @ApiOperation({ summary: 'Resend OTP to user email' })
    @ApiResponse({ status: 200, description: 'OTP successfully resent' })
    @ApiResponse({ status: 400, description: 'User not found' })
    @Post('/resend-otp')
    @UsePipes(new ValidationPipe())
    async resendOTP(@Body() resendOtpDto: ResendOtpDto){
        return await this.authService.resendOTP(resendOtpDto.id);
    }
}
