import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";

export class GetProductDto{ 
    @IsNotEmpty()
    @IsNumber()
    id!: number;

    @IsNotEmpty()
    @IsString()
    name!: string;
 
    @IsString()
    @IsNotEmpty()
    description! : string;

    @IsNumberString({},{message : 'Must be in string format eg. "5.55"'})
    @IsNotEmpty()
    price!: string;


    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(100000)
    quantity! : number;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    owner_id! : number;

}