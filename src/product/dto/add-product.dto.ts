import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddProductDto{ 
    @ApiProperty({ description: 'Product name', example: 'Wireless Headphones' })
    @IsNotEmpty()
    @IsString()
    name!: string;
 
    @ApiProperty({ description: 'Product description', example: 'High-quality wireless headphones with noise cancellation' })
    @IsString()
    @IsNotEmpty()
    description! : string;

    @ApiProperty({ description: 'Product price in string format', example: '99.99' })
    @IsNumberString({},{message : 'Must be in string format eg. "5.55"'})
    @IsNotEmpty()
    price!: string;


    @ApiProperty({ description: 'Product quantity in stock', example: 50, minimum: 0, maximum: 100000 })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100000)
    quantity! : number;

    @ApiProperty({ description: 'Owner admin ID (optional)', example: 1, required: false })
    @IsOptional()
    @IsNumber()
    owner_id! : number;

}