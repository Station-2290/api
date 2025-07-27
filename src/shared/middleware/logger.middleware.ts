import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const user_agent = request.get('user-agent') || '';
    const start_time = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const content_length = response.get('content-length');
      const response_time = Date.now() - start_time;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${content_length || 0} - ${user_agent} ${ip} ${response_time}ms`,
      );
    });

    next();
  }
}
