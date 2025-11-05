import {
  Controller,
  Get,
  Post, 
  Body,
  Patch, 
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger'; 
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, type ReqUser } from 'src/auth/user.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories') 
export class CategoriesController { // <-- The 'export' is here
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post() 
  @ApiOperation({ summary: 'Create a new category (User-Scoped)' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @User() user: ReqUser, // <-- Inject user
  ) {
    // Pass userId to the service
    return this.categoriesService.create(createCategoryDto, user.userId);
  }

  @Get() 
  @ApiOperation({ summary: 'Get all active categories (User-Scoped)' })
  findAll(@User() user: ReqUser) { // <-- Inject user
    // Pass userId to the service
    return this.categoriesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID (User-Scoped)' })
  findOne(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser, // <-- Inject user
  ) {
    // Pass userId to the service
    return this.categoriesService.findOne(id, user.userId);
  }

  @Patch(':id') 
  @ApiOperation({ summary: 'Update a category by ID (User-Scoped)' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: ReqUser, // <-- Inject user
  ) {
    // Pass userId to the service
    return this.categoriesService.update(id, updateCategoryDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a category by ID (User-Scoped)' })
  @ApiBody({ type: DeleteCategoryDto, required: false })
  remove(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser, // <-- Inject user
    @Body() deleteCategoryDto: DeleteCategoryDto,
  ) {
    // Pass userId to the service
    return this.categoriesService.remove(id, deleteCategoryDto, user.userId);
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted category by ID (User-Scoped)' })
  restore(
    @Param('id', MongoIdPipe) id: string,
    @User() user: ReqUser, // <-- Inject user
  ) {
    // Pass userId to the service
    return this.categoriesService.restore(id, user.userId);
  }
}