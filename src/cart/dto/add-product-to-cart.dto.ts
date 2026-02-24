import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddproductToCartDto{
    @ApiProperty({ description: 'Product ID to add to cart', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    productId!: number;

    @ApiProperty({ description: 'Quantity to add', example: 2, minimum: 1 })
    @IsNotEmpty()
    @IsNumber()
    quantity!:number;

}