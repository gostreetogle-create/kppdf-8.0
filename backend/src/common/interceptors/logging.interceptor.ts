import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();
    return next.handle().pipe(
      catchError((err) => {
        const ms = Date.now() - start;
        const status = (err as { status?: number })?.status ?? 500;
        this.logger.warn(`${req.method} ${req.url} → ${status} (${ms}ms)`);
        return throwError(() => err);
      }),
      finalize(() => {
        const ms = Date.now() - start;
        if (ms > 1000) {
          this.logger.warn(`SLOW REQUEST: ${req.method} ${req.url} (${ms}ms)`);
        }
      }),
    );
  }
}
