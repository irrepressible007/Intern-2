import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category', example: 'Groceries' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;
}