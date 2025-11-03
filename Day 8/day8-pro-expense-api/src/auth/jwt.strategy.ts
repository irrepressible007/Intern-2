import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // FIX: Get the secret from ConfigService
    const secret = configService.get<string>('JWT_SECRET');
    
    // FIX: Check if the secret exists
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET is not defined in .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // <-- Use the guaranteed 'secret' variable
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // This attaches { userId: payload.sub, email: payload.email } to req.user
    return { userId: payload.sub, email: payload.email };
  }
}