import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { Model, FilterQuery, Types } from 'mongoose';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expenseData = {
      ...createExpenseDto,
      date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
    };
    
    const createdExpense = new this.expenseModel(expenseData);
    
    try {
      const savedExpense = await createdExpense.save();
      return savedExpense.populate({ path: 'categoryId', select: 'name slug' }); 
    } catch (error) {
      throw error;
    }
  }

  async findAll(queryDto: QueryExpenseDto) {
    const { page = 1, pageSize = 10, month, categoryId } = queryDto;

    const filter: FilterQuery<ExpenseDocument> = {
      isDeleted: false,
    };

    if (categoryId) {
       if (Types.ObjectId.isValid(categoryId)) {
        filter.categoryId = categoryId;
      }
    }

    if (month) {
      const year = parseInt(month.substring(0, 4), 10);
      const monthIndex = parseInt(month.substring(5, 7), 10) - 1; 

      const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0)); 
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0)); 
      endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1); 

      filter.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const skip = (page - 1) * pageSize;

    // --- This is FIX #5 ---
    const sort: any = { date: -1 }; // Cast to 'any' to fix Mongoose type error

    const dataQuery = this.expenseModel
      .find(filter)
      .populate<{ categoryId: { name: string; slug: string } }>('categoryId', 'name slug') 
      .sort(sort) // <-- Now works
      .skip(skip)
      .limit(pageSize)
      .lean() 
      .exec();

    const totalQuery = this.expenseModel.countDocuments(filter);

    const [data, total] = await Promise.all([dataQuery, totalQuery]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  // --- This is FIX #6 ---
  async findOne(id: string) { // Return type inferred
     const expense = await this.expenseModel
       .findOne({ _id: id, isDeleted: false })
       .populate<{ categoryId: { name: string; slug: string } }>('categoryId', 'name slug')
       .lean()
       .exec();
       
     if (!expense) {
       throw new NotFoundException(`Expense with ID "${id}" not found`);
     }
     return expense; // <-- No more type error
  }

  // --- This is FIX #6 ---
  async update(id: string, updateExpenseDto: UpdateExpenseDto) { // Return type inferred
     const updatedExpense = await this.expenseModel
       .findOneAndUpdate({ _id: id, isDeleted: false }, updateExpenseDto, { new: true })
       .populate<{ categoryId: { name: string; slug: string } }>('categoryId', 'name slug')
       .lean()
       .exec();
       
     if (!updatedExpense) {
       throw new NotFoundException(`Expense with ID "${id}" not found`);
     }
     return updatedExpense; // <-- No more type error
  }

  // --- This is FIX #6 ---
  async remove(id: string) { // Return type inferred
    const deletedExpense = await this.expenseModel
      .findByIdAndUpdate(id, { 
        isDeleted: true, 
        deletedAt: new Date() 
      }, { new: true })
      .lean()
      .exec();
      
    if (!deletedExpense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
    return { message: `Expense with ID "${id}" successfully soft-deleted.` };
  }
}