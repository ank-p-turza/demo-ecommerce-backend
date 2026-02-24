import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { IpnBodyDto } from './dto/ipn-body.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Handle IPN (Instant Payment Notification) callback from payment gateway' })
  @ApiResponse({ status: 200, description: 'IPN processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid IPN data' })
  @Post('ipn')
  @UsePipes(new ValidationPipe())
  async handleIPN(@Body() body: IpnBodyDto) {
      return await this.paymentService.handleIPN(body);
  }


}
