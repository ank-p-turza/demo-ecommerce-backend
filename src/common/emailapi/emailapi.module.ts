import { Module } from '@nestjs/common';
import { EmailapiService } from './emailapi.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [EmailapiService],
  exports: [EmailapiService]
})
export class EmailapiModule {}
