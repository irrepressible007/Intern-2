import { PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';

// PartialType makes all properties of CreateBudgetDto optional
export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}