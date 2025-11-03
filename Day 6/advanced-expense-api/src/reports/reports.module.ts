import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- Import
// Import the Expense schema so this service can use it
import { Expense, ExpenseSchema } from 'src/expenses/schemas/expense.schema'; 

@Module({
  imports: [
    // Make the Expense model available to the ReportsService
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]), 
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}