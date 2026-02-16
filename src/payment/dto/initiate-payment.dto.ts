import { IsNotEmpty, IsNumber } from "class-validator";

export class InitiatePaymentDto{
    @IsNotEmpty()
    @IsNumber()
    orderId!: number;
}