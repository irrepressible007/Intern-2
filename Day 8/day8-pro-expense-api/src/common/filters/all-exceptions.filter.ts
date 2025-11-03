import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch() // Catch all types of exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // Handle Mongoose/Mongo Errors
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      
      // --- THIS IS THE FIX ---
      // Task 9: Mongo E11000 => 409 Conflict
      if (exception.message.includes('E11000 duplicate key error')) {
        statusCode = HttpStatus.CONFLICT;
        // Use a more generic (and correct) message
        message = 'A resource with these unique properties already exists.';
      }
      // -------------------------
      
      // Task 9: CastError/ObjectId => 400 Bad Request
      else if (exception.name === 'CastError') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Invalid ID format provided.`;
      }
    }

    // Handle NestJS HTTP Exceptions (like 404 Not Found or 400 Validation)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      
      // This handles class-validator's array of messages
      if (typeof response === 'object' && response !== null && (response as any).message) {
        message = (response as any).message;
      } else {
        message = exception.message;
      }
    }

    const responseBody = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}