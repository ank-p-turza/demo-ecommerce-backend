import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './interface/user-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { EmailapiService } from 'src/common/emailapi/emailapi.service';
import { SendEmailDto } from 'src/common/emailapi/dto/send-email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly emailapiService: EmailapiService,
        @InjectRepository(User) private readonly userRepo: Repository<User>
    ){}

    generateOTP(length: number): string {
        let otp = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456780';
        for(let i = 0; i < length; i++){
            otp += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return otp;
    }

    async userSignUp(registerDto: RegisterDto){
        return await this.userService.createUser(registerDto);
    }

    async validateUser(loginDto: LoginDto){
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

    async signIn(userPayload: UserPayload){
        const token = this.jwtService.sign(userPayload);
        return {
            token,
            token_expires: 3600,
            user: userPayload
        }
    }

    async verifyEmail(id: number, otp: string): Promise<{message: string}> {
        const user = await this.userRepo.findOne({
            where: { id }
        });

        if (!user) {
            throw new ConflictException("User not found");
        }

        if (user.is_verified) {
            throw new ConflictException("User already verified");
        }

        const currentTime = new Date();
        if (currentTime > user.otp_expires_at) {
            throw new ConflictException("OTP has expired. Please request a new one");
        }

        if (user.otp !== otp) {
            throw new ConflictException("Invalid OTP");
        }

        user.is_verified = true;
        user.otp = '0';
        await this.userRepo.save(user);

        return { message: "Email verified successfully" };
    }

    async resendOTP(id: number): Promise<{message: string}> {
        const user = await this.userRepo.findOne({
            where: { id }
        });

        if (!user) {
            throw new ConflictException("User not found");
        }

        if (user.is_verified) {
            throw new ConflictException("User already verified");
        }

        const otp: string = this.generateOTP(8);
        const message = `Hello, ${user.name}, \nYour new One Time Password (OTP) is : ${otp}. Do not share this code with anyone.`;
        const sendEmailDto: SendEmailDto = {
            name: user.name,
            to_email: user.email,
            subject: "Demo Ecommerce - OTP Resend",
            message
        };

        await this.emailapiService.sendMail(sendEmailDto);

        user.otp = otp;
        const now = new Date();
        user.otp_expires_at = new Date(now.getTime() + 5 * 60 * 1000);
        await this.userRepo.save(user);

        return { message: "OTP resent successfully" };
    }
}
