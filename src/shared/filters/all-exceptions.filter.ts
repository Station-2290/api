import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly http_adapter_host: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.http_adapter_host;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let http_status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error_details: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      http_status = exception.getStatus();
      const exception_response = exception.getResponse();

      if (typeof exception_response === 'string') {
        message = exception_response;
      } else if (
        typeof exception_response === 'object' &&
        exception_response !== null
      ) {
        const response_obj = exception_response as Record<string, unknown>;
        message = (response_obj.message as string) || message;
        error_details = response_obj;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error_details = {
        name: exception.name,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    } else if (typeof exception === 'string') {
      message = exception;
    }

    const response_body: Record<string, unknown> = {
      statusCode: http_status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
      ...error_details,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(response_body),
    );

    httpAdapter.reply(ctx.getResponse(), response_body, http_status);
  }
}
