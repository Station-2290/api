import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exception_response = exception.getResponse();

    let error_message = exception.message;
    let error_details: Record<string, unknown> = {};

    if (typeof exception_response === 'string') {
      error_message = exception_response;
    } else if (
      typeof exception_response === 'object' &&
      exception_response !== null
    ) {
      const response_obj = exception_response as Record<string, unknown>;
      error_message = (response_obj.message as string) || error_message;
      error_details = response_obj;
    }

    const error_response = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: error_message,
      ...error_details,
    };

    this.logger.warn(
      `${request.method} ${request.url} ${status} - ${error_message}`,
    );

    response.status(status).json(error_response);
  }
}
