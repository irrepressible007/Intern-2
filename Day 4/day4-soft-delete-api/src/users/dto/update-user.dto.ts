import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// This automatically makes all fields from CreateUserDto optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}