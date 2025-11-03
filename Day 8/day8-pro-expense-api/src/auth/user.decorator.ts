import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// This defines the shape of the user object that our JwtStrategy attaches
export interface ReqUser {
  userId: string;
  email: string;
}

// Create the @User() decorator
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ReqUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // 'user' is the payload from JwtStrategy.validate()
  },
);