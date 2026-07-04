import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
  permissions?: string[];
  version?: number;
}

/**
 * Extracts the authenticated user from the request. Set by JwtAuthGuard
 * after successful JWT validation.
 *
 * @example
 *   handler(@CurrentUser() user: AuthenticatedUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return req.user;
  },
);
