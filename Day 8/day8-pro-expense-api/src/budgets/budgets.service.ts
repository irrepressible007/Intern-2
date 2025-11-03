import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    
    try {
      // .save() returns the full document, so Promise<Budget> is correct here
      return await createdBudget.save();
    } catch (error) {
      throw error;
    }
  }

  // FIX: Removed explicit : Promise<Budget[]> return type
  async findAll(queryDto: QueryBudgetDto, userId: string) {
    const { month } = queryDto;

    const filter: FilterQuery<BudgetDocument> = {
      userId,
      month,
    };

    // .lean() and .populate() create a type mismatch, so we infer it.
    return this.budgetModel
      .find(filter)
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .lean()
      .exec();
  }

  // FIX: Removed explicit : Promise<Budget> return type
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
    return budget; // Type is now inferred and correct
  }

  // FIX: Removed explicit : Promise<Budget> return type
  async update(id: string, updateBudgetDto: UpdateBudgetDto, userId: string) {
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
    return updatedBudget; // Type is now inferred and correct
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