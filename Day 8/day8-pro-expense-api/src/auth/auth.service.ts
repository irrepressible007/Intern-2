import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<{ accessToken: string }> {
    try {
      const user = await this.usersService.create(signUpDto);

      // FIX: Cast user to 'any' to access the Mongoose '_id' property
      const payload = { email: user.email, sub: (user as any)._id };
      return {
        accessToken: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already in use'); 
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // FIX: Cast user to 'any' to access the Mongoose '_id' property
    const payload = { email: user.email, sub: (user as any)._id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}