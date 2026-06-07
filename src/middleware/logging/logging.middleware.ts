/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: any, res: any, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - IP ${ip} - User-Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('Content-Length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `Outgoing Response: ${method} - ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`,
      );

      if (statusCode >= 400) {
        this.logger.error(
          `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }

      // Log de erros
      res.on('error', (error) => {
        this.logger.error(
          // `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${error.message}`,
          `Error Response: ${method} ${originalUrl} - ${error.message}`,
        );
      });

      // Log de timeout
      res.on('timeout', () => {
        this.logger.warn(
          // `Error Response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${error.message}`,
          `Error Response: ${method} ${originalUrl} - ${Date.now() - startTime}ms - Timeout`,
        );
      });
    });
    next();
  }
}
