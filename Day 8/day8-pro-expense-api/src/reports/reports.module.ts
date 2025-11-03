import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema';
import { Budget, BudgetSchema } from 'src/budgets/schemas/budget.schema'; // <-- 1. Import Budget schema

@Module({
  imports: [
    // Make both Expense and Budget models available to ReportsService
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Budget.name, schema: BudgetSchema }, // <-- 2. Add BudgetModel
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}