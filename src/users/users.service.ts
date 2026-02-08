import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RoleEnum } from '../common/enum/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepo : Repository<User>){}

    generatOTP(length : number) : string {
        let otp = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456780';
        for(let i =0; i<length; i++){
            otp+=characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return otp;
    }

    async createUser(createUserDto: CreateUserDto) : Promise<{message : string}>{
        const otp : string = this.generatOTP(8);
        const {name, email, password, role=RoleEnum.CUSTOMER} = createUserDto;
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



}
