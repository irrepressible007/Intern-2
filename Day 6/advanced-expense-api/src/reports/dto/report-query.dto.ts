import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ReportQueryDto {
  @ApiProperty({ 
    description: 'Month for the report (YYYY-MM format)', 
    example: '2025-10',
    required: true // This field is mandatory
  })
  @IsNotEmpty() // Make sure it's not empty
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Month must be in YYYY-MM format' })
  month: string;
}