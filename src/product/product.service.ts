import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Repository } from 'typeorm';
import { AddProductDto } from './dto/add-product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
    constructor(@InjectRepository(Product) private readonly productRepo : Repository<Product>){        
    }

    async addProduct(addProductDto : AddProductDto) {
        try{
            const product =this.productRepo.create(addProductDto);
            await this.productRepo.save(product);
            return {message: `New product with product id ${product.id} has beend added.`};
        }
        catch(error:any){
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async getAllProducts(){
        try{
            const products : GetProductDto[] = await this.productRepo.find();
            return products;
        }
        catch(error : any){
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async getProductById(id : number) : Promise<GetProductDto> {
        try{
            const product : GetProductDto | null = await this.productRepo.findOne({where : {id}});
            if(!product){
                throw new NotFoundException("Product not found.");
            }
            return product;
        }
        catch(error : any){
            if(error instanceof NotFoundException){
                throw new NotFoundException("Product not found.");
            }
            throw new InternalServerErrorException();
        }
    }

    async updateProductDetails(id : number, updateProductDto : UpdateProductDto, owner_id : number) {
        try{
            const updateData = Object.fromEntries(
                Object.entries(updateProductDto).filter(([_, value]) => value !== undefined && value !== null)
            );

            if(Object.keys(updateData).length === 0){
                throw new NotFoundException('No valid fields to update.');
            }

            const product = await this.getProductById(id);
            if(product.owner_id !== owner_id){
                throw new ForbiddenException("Cannot update other's product.");
            }

            const result = await this.productRepo.update(id, updateData);
            
            if(result.affected === 0){
                throw new NotFoundException('Product not found.');
            }
            
            return {message: `Product with product id ${id} has been updated.`};
        }
        catch(error : any){
            if(error instanceof NotFoundException){
                throw error;
            }
            if(error instanceof ForbiddenException){
                throw error;
            }
            console.log(error);
            throw new InternalServerErrorException('Failed to update product.');
        }   
    }

    async deleteProductById(id :number, owner_id : number){
        try{
            const product = await this.getProductById(id);
            if(product.owner_id !== owner_id){
                throw new ForbiddenException("Cannot deleted other's product.");
            }
            
            await this.productRepo.delete({id});
            return {message : `Product with product id ${id} deleted`};
        }
        catch(error){
            if(error instanceof ForbiddenException){
                throw error;
            }
            if(error instanceof NotFoundException){
                throw new NotFoundException("Cannot delete a non-exisiting product.");
            }
        }
    }
}
