import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from "class-validator";
import { RoleEnum } from "../../common/enum/role.enum";

export class CreateUserDto{
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