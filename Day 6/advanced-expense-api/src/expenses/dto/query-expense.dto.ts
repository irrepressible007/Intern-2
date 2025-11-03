import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString, Matches, Min } from 'class-validator';

export class QueryExpenseDto {
  @ApiPropertyOptional({ 
    description: 'Filter by month (YYYY-MM format)', 
    example: '2025-10' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Month must be in YYYY-MM format' }) 
  month?: string;

  @ApiPropertyOptional({ description: 'Filter by Category ID', example: '672f...' })
  @IsOptional()
  @IsMongoId() // Validate it's a Mongo ID string
  categoryId?: string;

  // We can also add the PaginationDto fields from Task 6
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number) // Ensure transformation from string to number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number) // Ensure transformation
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}