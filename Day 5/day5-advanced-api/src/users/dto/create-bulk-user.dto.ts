import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateBulkUserDto {
  @ApiProperty({
    type: [CreateUserDto],
    description: 'An array of user objects to create',
  })
  @IsArray()
  @ValidateNested({ each: true }) // This tells the validator to check each object in the array
  @Type(() => CreateUserDto) // This tells class-transformer which class to use for each object
  users: CreateUserDto[];
}