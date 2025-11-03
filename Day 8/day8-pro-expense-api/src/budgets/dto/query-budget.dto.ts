import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class QueryBudgetDto {
  @ApiProperty({
    description: 'The month to retrieve budgets for (YYYY-MM format)',
    example: '2025-11',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must be in YYYY-MM format',
  })
  month: string;
}