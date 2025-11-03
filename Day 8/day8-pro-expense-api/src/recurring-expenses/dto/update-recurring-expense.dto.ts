import { PartialType } from '@nestjs/swagger';
import { CreateRecurringExpenseDto } from './create-recurring-expense.dto';

// All fields from CreateRecurringExpenseDto become optional
export class UpdateRecurringExpenseDto extends PartialType(CreateRecurringExpenseDto) {}