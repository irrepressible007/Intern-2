import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Cadence } from '../schemas/recurring-expense.schema'; // Import the enum

export class CreateRecurringExpenseDto {
  @ApiProperty({ example: 'Monthly Netflix Subscription' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 15.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Category ID', example: '672f...' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ 
    description: 'Cadence (daily, weekly, or monthly)', 
    example: Cadence.MONTHLY,
    enum: Cadence 
  })
  @IsEnum(Cadence)
  @IsNotEmpty()
  cadence: Cadence;

  @ApiProperty({ 
    description: 'The date the recurrence starts (YYYY-MM-DD)', 
    example: '2025-11-01' 
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string; // The service will also set nextRunDate to this

  @ApiPropertyOptional({ 
    description: 'Optional date the recurrence ends (YYYY-MM-DD)', 
    example: '2026-11-01' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}