import { IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProductDto{ 
    @ApiProperty({ description: 'Product name', example: 'Wireless Headphones', required: false })
    @IsString()
    @IsOptional()
    name!: string;
 
    @ApiProperty({ description: 'Product description', example: 'Updated description', required: false })
    @IsString()
    @IsOptional()
    description! : string;

    @ApiProperty({ description: 'Product price in string format', example: '89.99', required: false })
    @IsOptional()
    @IsNumberString({},{message : 'Must be in string format eg. "5.55"'})
    price!: string;

    @ApiProperty({ description: 'Product quantity', example: 100, minimum: 0, maximum: 100000, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100000)
    quantity! : number;

    // may later be needed for ownership changes
    // @IsOptional()
    // @IsNumber()
    // owner_id! : number;

}