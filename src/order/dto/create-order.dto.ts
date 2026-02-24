import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OrderItemDto } from "./order-items.dto";

export class CreateOrderDto {
    @ApiProperty({ 
        description: 'Array of order items', 
        type: [OrderItemDto],
        example: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

    @ApiProperty({ 
        description: 'Shipping address', 
        example: '123 Main St, City, State 12345',
        required: false 
    })
    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @ApiProperty({ 
        description: 'Additional notes for the order', 
        example: 'Please deliver before 5 PM',
        required: false 
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
