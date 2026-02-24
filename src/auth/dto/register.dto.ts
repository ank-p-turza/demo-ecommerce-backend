import { IsNotEmpty, IsString, IsEmail,Matches, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum } from "src/common/enum/role.enum";
export class RegisterDto{
    @ApiProperty({ description: 'User full name', example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    name! : string;

    @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email! : string;

    @ApiProperty({ 
        description: 'User password (min 8 chars, must include uppercase, lowercase, digit, and special character)', 
        example: 'Password123!' 
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}$/, {
        message : 'Password must contain atleast one uppercase, one lower case, one digit, one symbol and it must be at least 8 digit'
    })
    password! : string;

    @ApiProperty({ description: 'User role', enum: RoleEnum, required: false, example: RoleEnum.CUSTOMER })
    @IsEnum(RoleEnum, {message : "Role must be either customer or admin"})
    role? : RoleEnum;
}