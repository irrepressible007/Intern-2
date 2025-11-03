import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { Model, FilterQuery, Types } from 'mongoose';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { AttachReceiptDto } from './dto/attach-receipt.dto'; // <-- Ensure this is imported

// Define the expected output type after populating and leaning
type PopulatedExpense = Omit<Expense, 'categoryId'> & {
    categoryId: {
        _id: Types.ObjectId;
        name: string;
        slug: string;
    } | null;
};

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  private buildFilter(queryDto: QueryExpenseDto, userId: string): FilterQuery<ExpenseDocument> {
    const { month, categoryId, q, minAmount, maxAmount, paymentMethod } = queryDto;

    const filter: FilterQuery<ExpenseDocument> = {
      userId,
      isDeleted: false,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (month) {
      const year = parseInt(month.substring(0, 4), 10);
      const monthIndex = parseInt(month.substring(5, 7), 10) - 1; 

      const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));
      endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);

      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = minAmount;
        if (maxAmount) filter.amount.$lte = maxAmount;
    }

    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { note: { $regex: q, $options: 'i' } },
        ];
    }
    
    return filter;
  }

  // --- CRUD API METHODS ---

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const category = await this.categoriesService.findOne(createExpenseDto.categoryId, userId);
    if (!category) {
      throw new BadRequestException('Category not found or you do not own it.');
    }
    if (category.isDeleted) {
        throw new BadRequestException('Cannot add expense to a deleted category.');
    }
    
    const expenseData = {
      ...createExpenseDto,
      userId,
      date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
    };
    
    const createdExpense = new this.expenseModel(expenseData);
    
    try {
      const savedExpense = await createdExpense.save();
      return savedExpense.populate('categoryId'); 
    } catch (error) {
      throw error;
    }
  }

  async findAll(queryDto: QueryExpenseDto, userId: string): Promise<{ data: PopulatedExpense[]; meta: any }> {
    const { page = 1, pageSize = 10 } = queryDto;
    const filter = this.buildFilter(queryDto, userId);
    
    const skip = (page - 1) * pageSize;
    const sort: any = { date: -1 }; 

    const dataQuery = this.expenseModel
      .find(filter)
      .populate<PopulatedExpense>('categoryId', 'name slug') 
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean()
      .exec();

    const totalQuery = this.expenseModel.countDocuments(filter);

    const [data, total] = await Promise.all([dataQuery, totalQuery]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data as PopulatedExpense[],
      meta: { total, page, pageSize, totalPages },
    };
  }
  
  /**
   * Task 7: PUT /expenses/:id/receipt
   * Attaches or removes receipt metadata from an expense document.
   */
  async attachReceipt(expenseId: string, userId: string, attachReceiptDto: AttachReceiptDto): Promise<PopulatedExpense> {
    const { receipt } = attachReceiptDto;
    
    // Find and update the expense, ensuring user scope and activity
    const updatedExpense = await this.expenseModel
      .findOneAndUpdate(
        { _id: expenseId, userId, isDeleted: false },
        { 
          // Set the receipt object (or null) directly
          receipt: receipt, 
        }, 
        { new: true }
      )
      .populate<PopulatedExpense>('categoryId', 'name slug')
      .lean()
      .exec();

    if (!updatedExpense) {
      throw new NotFoundException(`Expense with ID "${expenseId}" not found or already deleted.`);
    }

    return updatedExpense as PopulatedExpense;
  }

  exportExpenses(queryDto: QueryExpenseDto, userId: string) {
    const filter = this.buildFilter(queryDto, userId);
    
    const cursor = this.expenseModel
        .find(filter)
        .sort({ date: -1 })
        .select('title amount date paymentMethod note') 
        .lean()
        .cursor(); 
        
    return (cursor as any).stream(); 
  }

  async findOne(id: string, userId: string): Promise<PopulatedExpense> {
     const expense = await this.expenseModel
       .findOne({ _id: id, userId, isDeleted: false })
       .populate<PopulatedExpense>('categoryId', 'name slug')
       .lean()
       .exec();
       
     if (!expense) {
       throw new NotFoundException(`Expense with ID "${id}" not found`);
     }
     return expense as PopulatedExpense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<PopulatedExpense> {
    if (updateExpenseDto.categoryId) {
      const category = await this.categoriesService.findOne(updateExpenseDto.categoryId, userId);
      if (!category) {
        throw new BadRequestException('New category not found or you do not own it.');
      }
    }
     
     const updatedExpense = await this.expenseModel
       .findOneAndUpdate(
         { _id: id, userId, isDeleted: false },
         updateExpenseDto,
         { new: true }
       )
       .populate<PopulatedExpense>('categoryId', 'name slug')
       .lean()
       .exec();
       
     if (!updatedExpense) {
       throw new NotFoundException(`Expense with ID "${id}" not found`);
     }
     return updatedExpense as PopulatedExpense;
  }

  async remove(id: string, userId: string) {
    const deletedExpense = await this.expenseModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        { 
          isDeleted: true, 
          deletedAt: new Date() 
        }, 
        { new: true }
      )
      .lean()
      .exec();
      
    if (!deletedExpense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
    return { message: `Expense with ID "${id}" successfully soft-deleted.` };
  }
}