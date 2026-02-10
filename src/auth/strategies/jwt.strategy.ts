import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPayload } from "../interface/user-payload.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        const secret = process.env.JWT_SECRET_KEY;
        console.log('JWT Secret in Strategy:', secret);
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey : String(process.env.JWT_SECRET_KEY),
        })
    }

    async validate(payload : UserPayload) {
        return payload;
    }
}