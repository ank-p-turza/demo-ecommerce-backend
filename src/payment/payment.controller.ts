import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { IpnBodyDto } from './dto/ipn-body.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('ipn')
  @UsePipes(new ValidationPipe())
  async handleIPN(@Body() body: IpnBodyDto) {
      return await this.paymentService.handleIPN(body);
  }


}
