import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailapiService {
    constructor(private readonly httpService : HttpService){
    }
    async sendMail(sendEmailDto: SendEmailDto){
        const body = sendEmailDto;
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${process.env.EMAIL_API_URL}/send-mail`,
                    body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )
            return response;
        }
        catch (error){
            console.log();
            throw error;
        }
    }
}
