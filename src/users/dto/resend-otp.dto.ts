import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResendOtpDto{
    @ApiProperty({ description: 'User ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id! : number;
}
