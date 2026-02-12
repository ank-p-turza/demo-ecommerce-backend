import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UserVerificationDto{
    @IsNumber()
    @IsNotEmpty()
    id! : number;

    @IsNotEmpty()
    @IsString()
    otp! : string;
}