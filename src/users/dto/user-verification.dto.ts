import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserVerificationDto{
    @ApiProperty({ description: 'User ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id! : number;

    @ApiProperty({ description: 'OTP code sent to user email', example: '123456' })
    @IsNotEmpty()
    @IsString()
    otp! : string;
}