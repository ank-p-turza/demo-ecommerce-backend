import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SendEmailDto{
    @IsString()
    @IsNotEmpty()
    name! : string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsNotEmpty()
    to_email! : string;
    
    @IsNotEmpty()
    @IsString()
    subject!: string;
    
    @IsNotEmpty()
    @IsString()   
    message! : string;
}