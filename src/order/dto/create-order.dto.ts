import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { OrderItemDto } from "./order-items.dto";

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
