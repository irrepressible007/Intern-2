import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

// This uses PartialType to make all fields from CreateExpenseDto optional
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}