import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from 'passport-local';
import { AuthService } from "../auth.service";
import { LoginDto } from "../dto/login.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalStratrgy extends PassportStrategy(Strategy){
    constructor(private readonly authService : AuthService){
        super({
            usernameField : "email",
            passReqToCallback : true
        })
    }

    async validate(req : Request, email : string, password : string) : Promise<any>{
        // ip and other info implementation later
        const loginDto : LoginDto =  {email, password};
        return await this.authService.validateUser(loginDto);
    }

}