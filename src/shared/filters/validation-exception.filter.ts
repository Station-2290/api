import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exception_response = exception.getResponse() as Record<
      string,
      unknown
    >;

    let validation_errors: string[] = [];

    if (
      exception_response.message &&
      Array.isArray(exception_response.message)
    ) {
      validation_errors = exception_response.message as string[];
    } else {
      validation_errors = [
        (exception_response.message as string) || 'Validation failed',
      ];
    }

    const error_response = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Validation failed',
      errors: validation_errors,
    };

    this.logger.warn(
      `Validation failed for ${request.method} ${request.url}`,
      validation_errors,
    );

    response.status(status).json(error_response);
  }
}
