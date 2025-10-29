import { ApiProperty } from '@nestjs/swagger'; // <-- Import
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Max, // <-- Import Max
  Length, // <-- Import Length
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'Fahim Ahmed',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50) // Task 3: Add min/max length
  name: string;

  @ApiProperty({
    description: 'The email of the user (must be unique)',
    example: 'fahim@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The age of the user',
    example: 25,
  })
  @IsNumber()
  @Min(1)
  @Max(120) // Task 3: Add max age
  age: number;
}