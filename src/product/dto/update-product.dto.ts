import { IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateProductDto{ 
    @IsString()
    @IsOptional()
    name!: string;
 
    @IsString()
    @IsOptional()
    description! : string;

    @IsOptional()
    @IsNumberString({},{message : 'Must be in string format eg. "5.55"'})
    price!: string;

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