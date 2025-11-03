import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto'; // Import the new DTO
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import slugify from 'slugify'; // Import slugify

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * API: POST /categories
   * Task 1: Case-Insensitive Slug
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name } = createCategoryDto;

    // Task 1: Generate lowercase slug manually for case-insensitivity
    const slug = slugify(name, { lower: true, strict: true, trim: true });

    const createdCategory = new this.categoryModel({ name, slug });
    
    try {
      return await createdCategory.save();
    } catch (error) {
      // Let the global filter handle duplicate key (E11000) errors
      throw error;
    }
  }

  /**
   * API: GET /categories
   * Task 5: Hide soft-deleted
   */
  async findAll(): Promise<Category[]> {
    // Only return categories that are not soft-deleted
    return this.categoryModel.find({ isDeleted: false }).lean().exec();
  }

  /**
   * API: GET /categories/:id
   * Task 5: Hide soft-deleted
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ _id: id, isDeleted: false })
      .lean()
      .exec();
    
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  // We'll implement a basic update for now
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const { name } = updateCategoryDto;
    let slug: string | undefined = undefined;

    // If name is being updated, re-generate the slug
    if (name) {
      slug = slugify(name, { lower: true, strict: true, trim: true });
    }

    const updatedCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { ...updateCategoryDto, ...(slug && { slug }) }, // Conditionally add slug to update
        { new: true }, // Return the updated document
      )
      .lean()
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return updatedCategory;
  }

  /**
   * API: DELETE /categories/:id
   * Task 5: Soft-Delete with Audit Fields
   */
  async remove(id: string, deleteCategoryDto: DeleteCategoryDto): Promise<Category> {
    // In a real app, you'd get userId from the logged-in user (e.g., req.user.id)
    // For now, we'll hardcode a placeholder or leave it null.
    // const deletedBy = null; // Replace with actual user ID

    const softDeletedCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deleteReason: deleteCategoryDto.deleteReason || null,
          // deletedBy: deletedBy,
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!softDeletedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return softDeletedCategory;
  }

  /**
   * API: PUT /categories/:id/restore
   * Task 5: Restore soft-deleted item
   */
  async restore(id: string): Promise<Category> {
    const restoredCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
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
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return restoredCategory;
  }
}