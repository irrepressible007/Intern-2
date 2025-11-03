import { Module } from '@nestjs/common';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesController } from './recurring-expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RecurringExpense, RecurringExpenseSchema } from './schemas/recurring-expense.schema';
import { CategoriesModule } from 'src/categories/categories.module';
// Import the Expense schema
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringExpense.name, schema: RecurringExpenseSchema },
      { name: Expense.name, schema: ExpenseSchema }, // <-- 1. Add ExpenseModel
    ]),
    CategoriesModule,
  ],
  controllers: [RecurringExpensesController],
  providers: [RecurringExpensesService],
})
export class RecurringExpensesModule {}