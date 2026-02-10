import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddProductDto } from './dto/add-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
    constructor(private readonly productService : ProductService){}
    

    // Add new products
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @UsePipes(new ValidationPipe())
    async addProduct(@Body() addProductDto : AddProductDto, @Request() req){
        if(!addProductDto.owner_id || addProductDto.owner_id<1){
            addProductDto.owner_id = req.user.id;
        }
        else if(addProductDto.owner_id !== req.user.id){
            throw new UnauthorizedException("You can not add products for other admin");
        }
        return await this.productService.addProduct(addProductDto);
    }

    @Get()
    async getAllProducts(){
        return await this.productService.getAllProducts();
    }

    @Get('/:id')
    async getProductById(@Param('id', ParseIntPipe) id : number){
        return await this.productService.getProductById(id);

    }

    // Update product details
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe())
    @Patch('/:id')
    async updateProductDetails(@Param('id', ParseIntPipe) id : number, @Body() updateProductDto: UpdateProductDto, @Request() req){
        return await this.productService.updateProductDetails(id, updateProductDto, req.user.id);
    }

    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:id')
    async deleteProduct(@Param('id', ParseIntPipe) id : number, @Request() req){
        return await this.productService.deleteProductById(id, req.user.id);
    }
}
