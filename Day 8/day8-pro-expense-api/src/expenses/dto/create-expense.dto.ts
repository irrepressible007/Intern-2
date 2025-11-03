import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Title of the expense', example: 'Weekly Groceries' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Amount of the expense', example: 55.75 })
  @IsNumber()
  @Min(0.01) // Amount must be positive
  amount: number;

  @ApiProperty({ description: 'Category ID for the expense', example: '672f...' })
  @IsMongoId() // Validate it's a MongoDB ObjectId string
  @IsNotEmpty()
  categoryId: string; // Receive the ID as a string

  @ApiPropertyOptional({ description: 'Date of the expense (YYYY-MM-DD)', example: '2025-10-29' })
  @IsOptional()
  @IsDateString() // Validate it's a date string
  date?: string; 

  @ApiPropertyOptional({ description: 'Optional note', example: 'Bought milk and eggs' })
  @IsOptional()
  @IsString()
  note?: string;
}