import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger'; // <-- Import

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // This is just to show in Swagger that all fields are optional for update
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  age?: number;
}