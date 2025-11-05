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
    const request = ctx.getRequest(); // Get the request object
    const response = ctx.getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // --- Task 8: Add requestId to logs ---
    // This looks for a request ID set by a firewall, load balancer,
    // or (in a more advanced setup) a request-id middleware.
    const requestId = request.id || request.headers['x-request-id'];
    const logMessage = `[RequestID: ${requestId || 'N/A'}]`;
    // ------------------------------------

    // Handle Mongoose/Mongo Errors
    if (exception instanceof Error) {
      // Log the full error with stack and requestId
      this.logger.error(`${logMessage} ${exception.message}`, exception.stack);
      
      if (exception.message.includes('E11000 duplicate key error')) {
        statusCode = HttpStatus.CONFLICT;
        // This is a generic message, but we've handled specifics in the services.
        message = 'A resource with these unique properties already exists.';
      }
      
      else if (exception.name === 'CastError') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Invalid ID format provided.`;
      }
    }

    // Handle NestJS HTTP Exceptions (like 404, 401, 400)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // This handles class-validator's array of messages
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null && (exceptionResponse as any).message) {
        message = (exceptionResponse as any).message;
      } else {
        message = exception.message;
      }
      
      // Log the HTTP exception
      this.logger.warn(`${logMessage} ${statusCode} ${request.method} ${request.url} - ${JSON.stringify(message)}`);
    }

    const responseBody = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}