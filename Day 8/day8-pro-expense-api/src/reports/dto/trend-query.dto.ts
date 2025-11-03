import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TrendQueryDto {
  @ApiProperty({
    description: 'Start month for the trend report (YYYY-MM format)',
    example: '2025-01',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must be in YYYY-MM format',
  })
  from: string;

  @ApiProperty({
    description: 'End month for the trend report (YYYY-MM format)',
    example: '2025-10',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must be in YYYY-MM format',
  })
  to: string;
}