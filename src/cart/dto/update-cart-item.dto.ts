import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartItemDto{
    @ApiProperty({ description: 'New quantity for cart item', example: 3, minimum: 0 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    quantity!: number;
}
