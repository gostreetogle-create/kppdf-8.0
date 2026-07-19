import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, defer } from 'rxjs';
import { userContext } from '../context/user-context';

interface RequestWithUser {
  user?: {
    id: string;
    username: string;
    role: string;
    permissions?: string[];
  };
}

/**
 * Wraps the request handler in an AsyncLocalStorage scope carrying the
 * authenticated user. The Mongoose `userContextPlugin` then reads this
 * inside its pre-hooks to populate `query.$locals.userId` for audit.
 *
 * Registered as APP_INTERCEPTOR in AuthModule.
 */
@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    if (req.user?.id) {
      const value = {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        permissions: req.user.permissions ?? [],
      };
      return defer(() => userContext.run(value, () => next.handle()));
    }

    return next.handle();
  }
}
