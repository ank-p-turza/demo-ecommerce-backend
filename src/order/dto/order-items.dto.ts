import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class OrderItemDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    productId!: number;

    @ApiProperty({ description: 'Quantity to order', example: 2, minimum: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity!: number;
}