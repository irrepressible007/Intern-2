    import { ApiProperty } from '@nestjs/swagger';
    import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

    export class LoginDto {
      @ApiProperty({ example: 'fahim@example.com' })
      @IsEmail()
      @IsNotEmpty()
      email: string;

      @ApiProperty({ example: 'Str0ngP@ssw0rd' })
      @IsString()
      @IsNotEmpty()
      password: string;
    }
    
