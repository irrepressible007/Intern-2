import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

// All fields from CreateExpenseDto become optional
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}