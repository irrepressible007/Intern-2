import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail() // <-- This rule checks if it's an email
  @IsNotEmpty() // <-- This rule makes it required
  email: string;

  @IsString()
  @IsOptional() // <-- This rule makes it optional
  phone?: string;
}