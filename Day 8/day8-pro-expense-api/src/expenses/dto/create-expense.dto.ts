import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
  IsArray,
} from 'class-validator';
import { PaymentMethod } from '../schemas/payment-method.enum';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Title of the expense', example: 'Weekly Groceries' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Amount of the expense', example: 55.75 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Category ID', example: '672f...' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Date (YYYY-MM-DD)', example: '2025-10-29' })
  @IsOptional()
  @IsDateString()
  date?: string; 

  @ApiPropertyOptional({ description: 'Optional note', example: 'Bought milk and eggs' })
  @IsOptional()
  @IsString()
  note?: string;
  
  @ApiPropertyOptional({ 
    description: 'Payment method', 
    enum: PaymentMethod,
    default: PaymentMethod.OTHER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
  
  @ApiPropertyOptional({ 
    description: 'Array of tags',
    example: ['groceries', 'urgent']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}