import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsInt, 
  IsMongoId, 
  IsOptional, 
  IsString, 
  Matches, 
  Min,
  IsNumber, 
  IsEnum,   
} from 'class-validator';
// FIX: Path assumes 'payment-method.enum.ts' is in the sibling 'schemas' folder
import { PaymentMethod } from '../schemas/payment-method.enum'; 

export class QueryExpenseDto {
  // Existing Pagination and Base Filters
  @ApiPropertyOptional({ description: 'Filter by month (YYYY-MM)', example: '2025-10' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Month must be in YYYY-MM format' }) 
  month?: string;

  @ApiPropertyOptional({ description: 'Filter by Category ID', example: '672f...' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;
  
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
  
  // Task 3: New Filter Fields
  @ApiPropertyOptional({ 
    description: 'Case-insensitive search for title or note',
    example: 'milk'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;
  
  @ApiPropertyOptional({ description: 'Filter by maximum amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;
  
  @ApiPropertyOptional({ description: 'Filter by payment method', enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}