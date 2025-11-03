import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { MongooseModule } from '@nestjs/mongoose'; // <-- 1. Import MongooseModule
import { Budget, BudgetSchema } from './schemas/budget.schema'; // <-- 2. Import your schema

@Module({
  imports: [
    // 3. Register the Budget schema
    MongooseModule.forFeature([{ name: Budget.name, schema: BudgetSchema }]),
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}