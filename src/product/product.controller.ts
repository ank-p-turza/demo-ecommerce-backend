import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AddProductDto } from './dto/add-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService : ProductService){}
    

    // Add new products
    @ApiOperation({ summary: 'Add a new product (Admin only)' })
    @ApiResponse({ status: 201, description: 'Product successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiBearerAuth('JWT-auth')
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

    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ status: 200, description: 'Returns all products' })
    @Get()
    async getAllProducts(){
        return await this.productService.getAllProducts();
    }

    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Returns product details' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @Get('/:id')
    async getProductById(@Param('id', ParseIntPipe) id : number){
        return await this.productService.getProductById(id);

    }

    // Update product details
    @ApiOperation({ summary: 'Update product details (Admin only)' })
    @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Product successfully updated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe())
    @Patch('/:id')
    async updateProductDetails(@Param('id', ParseIntPipe) id : number, @Body() updateProductDto: UpdateProductDto, @Request() req){
        return await this.productService.updateProductDetails(id, updateProductDto, req.user.id);
    }

    @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
    @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
    @ApiResponse({ status: 200, description: 'Product successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiBearerAuth('JWT-auth')
    @Roles(RoleEnum.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:id')
    async deleteProduct(@Param('id', ParseIntPipe) id : number, @Request() req){
        return await this.productService.deleteProductById(id, req.user.id);
    }
}
