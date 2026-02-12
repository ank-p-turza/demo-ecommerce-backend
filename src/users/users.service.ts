import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { RoleEnum } from '../common/enum/role.enum';
import * as bcrypt from 'bcrypt';
import { SendEmailDto } from 'src/common/emailapi/dto/send-email.dto';
import { EmailapiService } from 'src/common/emailapi/emailapi.service';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepo : Repository<User>,
                private readonly emailapiService : EmailapiService){}

    generatOTP(length : number) : string {
        let otp = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456780';
        for(let i =0; i<length; i++){
            otp+=characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return otp;
    }

    async createUser(createUserDto: UserDto) : Promise<{message : string}>{
        const otp : string = this.generatOTP(8);
        const {name, email, password, role=RoleEnum.CUSTOMER} = createUserDto;
        const message = `Hello, ${name}, \nWelcome to demo ecommerce. Your One Time Password (OTP) is : ${otp}. Do not share this code with anyone.`;
        const sendEmailDto : SendEmailDto = {name, to_email: email, subject : "Demo Ecommerce email verification.", message};
        this.emailapiService.sendMail(sendEmailDto);
        const rounds : number = 5;
        const hashedPassword :string = await bcrypt.hash(password, rounds);
        try{
            const newUser : User = this.userRepo.create({
                name,
                email,
                password: hashedPassword,
                role,
                otp,
            })
            await this.userRepo.save(newUser);
            if(role=== RoleEnum.CUSTOMER)
                return {message : "Account creted"};
            return {message : "Admin account created"};
        }
        catch(error : any){
            if(error.code === '23505'){
                throw new ConflictException("User already exist");
            }
            else{
                throw new InternalServerErrorException("Something went wrong.");
            }
        }
        
    }

    async getUserbyEmail(email : string) : Promise<UserDto | null> {
        const user = await this.userRepo.findOne({
            where : {email},
        });
        if(!user){
           return null;
        }
        const UserDto: UserDto = user;
        return UserDto;
    }


}
