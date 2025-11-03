import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'The month for the budget in YYYY-MM format',
    example: '2025-11',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must be in YYYY-MM format',
  })
  month: string;

  @ApiProperty({
    description: 'The budget limit amount',
    example: 500,
  })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiPropertyOptional({
    description: 'Optional category ID. If null, this is an "Overall" budget.',
    example: '69803e5d0a66c659621f86',
  })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;
}