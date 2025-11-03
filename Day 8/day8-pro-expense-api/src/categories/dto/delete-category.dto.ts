import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty({ 
    description: 'Optional reason for deleting the category', 
    example: 'No longer needed' 
  })
  @IsString()
  @IsOptional()
  @Length(5, 100)
  deleteReason?: string;
}