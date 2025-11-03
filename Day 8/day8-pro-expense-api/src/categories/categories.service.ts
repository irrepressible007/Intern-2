import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model, Types } from 'mongoose'; // <-- FIX: Import 'Types' from mongoose
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const { name } = createCategoryDto;
    const slug = slugify(name, { lower: true, strict: true, trim: true });

    const createdCategory = new this.categoryModel({ name, slug, userId });
    
    try {
      return await createdCategory.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryModel.find({ userId, isDeleted: false }).lean().exec();
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ _id: id, userId, isDeleted: false })
      .lean()
      .exec();
    
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    const { name } = updateCategoryDto;
    let slug: string | undefined = undefined;

    if (name) {
      slug = slugify(name, { lower: true, strict: true, trim: true });
    }

    const updatedCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        { ...updateCategoryDto, ...(slug && { slug }) },
        { new: true },
      )
      .lean()
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category not found`);
    }
    return updatedCategory;
  }

  async remove(id: string, deleteCategoryDto: DeleteCategoryDto, userId: string) {
    // FIX: Use 'new Types.ObjectId(userId)'
    const deletedBy = new Types.ObjectId(userId); 

    const softDeletedCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deleteReason: deleteCategoryDto.deleteReason || null,
          deletedBy: deletedBy,
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!softDeletedCategory) {
      throw new NotFoundException(`Category not found`);
    }
    return softDeletedCategory;
  }

  async restore(id: string, userId: string): Promise<Category> {
    const restoredCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: true },
        {
          isDeleted: false,
          deletedAt: null,
          deleteReason: null,
          deletedBy: null,
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!restoredCategory) {
      throw new NotFoundException(`Category not found`);
    }
    return restoredCategory;
  }
}