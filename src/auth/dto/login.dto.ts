import { IsNotEmpty, IsString, IsEmail} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class LoginDto{
    @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email! : string;

    @ApiProperty({ description: 'User password', example: 'Password123!' })
    @IsNotEmpty()
    @IsString()
    password! : string;
}