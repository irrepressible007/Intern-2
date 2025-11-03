import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RecurringExpense, RecurringExpenseDocument, Cadence } from './schemas/recurring-expense.schema';
import { Model, FilterQuery, Types } from 'mongoose';
import { CategoriesService } from 'src/categories/categories.service';
import { Cron, CronExpression } from '@nestjs/schedule'; // <-- Import Cron
import { addDays, addWeeks, addMonths } from 'date-fns'; // <-- Import date-fns
import { Expense, ExpenseDocument } from 'src/expenses/schemas/expense.schema'; // <-- Import Expense

@Injectable()
export class RecurringExpensesService {
  private readonly logger = new Logger(RecurringExpensesService.name);

  constructor(
    @InjectModel(RecurringExpense.name) 
    private recurringExpenseModel: Model<RecurringExpenseDocument>,
    @InjectModel(Expense.name) // <-- Inject ExpenseModel
    private expenseModel: Model<ExpenseDocument>, 
    private readonly categoriesService: CategoriesService,
  ) {}

  // --- TASK 5: CRON JOB WORKER ---
  // This runs every day at 10 minutes past midnight (00:10)
  // We'll use EVERY_DAY_AT_10AM for testing, you can change to CronExpression.EVERY_DAY_AT_MIDNIGHT
  @Cron(CronExpression.EVERY_DAY_AT_10AM) 
  async handleCron() {
    this.logger.log('Running Recurring Expense Cron Job...');
    const now = new Date();
    
    // 1. Find all recurring expenses that are due to run
    const expensesToRun = await this.recurringExpenseModel.find({
      isDeleted: false,
      nextRunDate: { $lte: now }, // Find all tasks that are due
      $or: [
        { endDate: null }, // Or it recurs forever
        { endDate: { $gte: now } }, // Or the end date is in the future
      ],
    }).exec();

    if (expensesToRun.length === 0) {
      this.logger.log('No recurring expenses to run.');
      return;
    }

    this.logger.log(`Found ${expensesToRun.length} expenses to process...`);
    let createdCount = 0;
    let skippedCount = 0;

    for (const recurring of expensesToRun) {
      const runDate = new Date(recurring.nextRunDate); // The date for the new expense

      // 2. Idempotency Check (Task 5)
      // Check if an expense for this template on this date *already exists*
      const existing = await this.expenseModel.findOne({
        recurringExpenseId: recurring._id,
        date: runDate,
      });

      if (existing) {
        this.logger.warn(`Skipping duplicate expense for ${recurring.title} on ${runDate.toISOString()}`);
        skippedCount++;
      } else {
        // 3. Create the new "concrete" Expense
        const newExpense = new this.expenseModel({
          userId: recurring.userId,
          title: recurring.title,
          amount: recurring.amount,
          categoryId: recurring.categoryId,
          date: runDate, // Set the expense date to the run date
          note: `Auto-generated from recurring expense: ${recurring.title}`,
          recurringExpenseId: recurring._id, // Link to the template
        });
        await newExpense.save();
        createdCount++;
      }

      // 4. Update the nextRunDate for the template
      recurring.nextRunDate = this.calculateNextRunDate(runDate, recurring.cadence);
      await recurring.save();
    }

    this.logger.log(`Cron Job Complete: ${createdCount} created, ${skippedCount} skipped.`);
  }

  // Helper function to calculate the next date
  private calculateNextRunDate(currentRunDate: Date, cadence: Cadence): Date {
    switch (cadence) {
      case Cadence.DAILY:
        return addDays(currentRunDate, 1);
      case Cadence.WEEKLY:
        return addWeeks(currentRunDate, 1);
      case Cadence.MONTHLY:
      default:
        return addMonths(currentRunDate, 1);
    }
  }
  // ---------------------------------

  // --- CRUD API METHODS (from before) ---

  async create(createRecurringExpenseDto: CreateRecurringExpenseDto, userId: string): Promise<RecurringExpense> {
    const { categoryId, startDate } = createRecurringExpenseDto;
    const category = await this.categoriesService.findOne(categoryId, userId);
    if (!category) {
      throw new BadRequestException('Category not found or you do not own it.');
    }
    const nextRunDate = new Date(startDate); // First run is the start date
    const createdExpense = new this.recurringExpenseModel({
      ...createRecurringExpenseDto,
      userId,
      nextRunDate,
      isDeleted: false,
    });
    return createdExpense.save();
  }

  async findAll(userId: string) {
    return this.recurringExpenseModel
      .find({ userId, isDeleted: false })
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .sort({ nextRunDate: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string, userId: string) {
    const expense = await this.recurringExpenseModel
      .findOne({ _id: id, userId, isDeleted: false })
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .lean()
      .exec();
    if (!expense) {
      throw new NotFoundException(`Recurring expense not found`);
    }
    return expense;
  }

  async update(id: string, updateRecurringExpenseDto: UpdateRecurringExpenseDto, userId: string) {
    if (updateRecurringExpenseDto.categoryId) {
      const category = await this.categoriesService.findOne(updateRecurringExpenseDto.categoryId, userId);
      if (!category) {
        throw new BadRequestException('New category not found or you do not own it.');
      }
    }
    const updatedExpense = await this.recurringExpenseModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        updateRecurringExpenseDto,
        { new: true },
      )
      .populate<{ categoryId: { name: string; slug: string } }>({
        path: 'categoryId',
        select: 'name slug',
      })
      .lean()
      .exec();

    if (!updatedExpense) {
      throw new NotFoundException(`Recurring expense not found`);
    }
    return updatedExpense;
  }

  async remove(id: string, userId: string) {
    const deletedExpense = await this.recurringExpenseModel
      .findOneAndUpdate(
        { _id: id, userId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      )
      .lean()
      .exec();
    if (!deletedExpense) {
      throw new NotFoundException(`Recurring expense not found`);
    }
    return { message: `Recurring expense successfully deleted.` };
  }
}