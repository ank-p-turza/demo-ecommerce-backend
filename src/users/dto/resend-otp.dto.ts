import { IsNotEmpty, IsNumber } from "class-validator";

export class ResendOtpDto{
    @IsNumber()
    @IsNotEmpty()
    id! : number;
}
