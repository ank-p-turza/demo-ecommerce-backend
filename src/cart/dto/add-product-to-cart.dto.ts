import { IsNotEmpty, IsNumber } from "class-validator";

export class AddproductToCartDto{
    @IsNotEmpty()
    @IsNumber()
    productId!: number;

    @IsNotEmpty()
    @IsNumber()
    quantity!:number;

}