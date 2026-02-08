import { IsNotEmpty, IsString, IsEmail,Matches, IsEnum } from "class-validator";
import { RoleEnum } from "src/common/enum/role.enum";
export class RegisterDto{
    @IsNotEmpty()
    @IsString()
    name! : string;

    @IsNotEmpty()
    @IsEmail()
    email! : string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}$/, {
        message : 'Password must contain atleast one uppercase, one lower case, one digit, one symbol and it must be at least 8 digit'
    })
    password! : string;

    @IsEnum(RoleEnum, {message : "Role must be either customer or admin"})
    role? : RoleEnum;
}