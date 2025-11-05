import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'; // <-- 1. Import
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { Model, Types, FilterQuery } from 'mongoose';
import { QueryBudgetDto } from './dto/query-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, userId: string): Promise<Budget> {
    const budgetData = {
      ...createBudgetDto,
      userId,
      categoryId: createBudgetDto.categoryId ? new Types.ObjectId(createBudgetDto.categoryId) : null,
    };

    const createdBudget = new this.budgetModel(budgetData);
    
    // --- 2. Add try...catch block ---
    try {
      return await createdBudget.save();
    } catch (error) {
      // Task 8: Domain-specific error code
      if (error.code === 11000) {
        throw new ConflictException('A budget for this month and category combination already exists.');
      }
      throw error;
    }
  }

  // ... (rest of the service: findAll, findOne, update, remove) ...
  
  async findAll(queryDto: QueryBudgetDto, userId: string) {
    const { month } = queryDto;
    const filter: FilterQuery<BudgetDocument> = { userId, month };

    return this.budgetModel
      .find(filter)
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .lean()
      .exec();
  }

  async findOne(id: string, userId: string) {
    const budget = await this.budgetModel
      .findOne({ _id: id, userId })
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .lean()
      .exec();
    if (!budget) {
      throw new NotFoundException(`Budget not found`);
    }
    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
    try {
      const updatedBudget = await this.budgetModel
        .findOneAndUpdate(
          { _id: id, userId },
          updateBudgetDto,
          { new: true },
        )
        .populate<{ categoryId: { name: string; slug: string } }>({
          path: 'categoryId',
          select: 'name slug',
        })
        .lean()
        .exec();
      if (!updatedBudget) {
        throw new NotFoundException(`Budget not found`);
      }
      return updatedBudget;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('A budget for this month and category combination already exists.');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const result = await this.budgetModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Budget not found`);
    }
    return { message: 'Budget successfully deleted.' };
  }
}