import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put, // Import Put for the restore endpoint
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto'; // Import the new DTO
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  findOne(@Param('id', MongoIdPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id') // Changed from generator's @Patch
  @ApiOperation({ summary: 'Update a category by ID' })
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a category by ID' })
  @ApiBody({ type: DeleteCategoryDto, required: false }) // Document the optional body
  remove(
    @Param('id', MongoIdPipe) id: string,
    @Body() deleteCategoryDto: DeleteCategoryDto, // Pass the DTO
  ) {
    return this.categoriesService.remove(id, deleteCategoryDto);
  }

  @Put(':id/restore') // New endpoint
  @ApiOperation({ summary: 'Restore a soft-deleted category by ID' })
  restore(@Param('id', MongoIdPipe) id: string) {
    return this.categoriesService.restore(id);
  }
}