import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = (req as { headers?: Record<string, string | string[]> }).headers ?? {};
    const xff = headers['x-forwarded-for'];
    const ip = Array.isArray(xff) ? xff[0] : xff ?? (req as { ip?: string }).ip ?? 'unknown';
    return `ip:${ip}`;
  }

  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    if (process.env.DISABLE_THROTTLE === '1') return true;
    return false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: { sub?: string } }>();
    const hasAuthUser = !!req.user?.sub;
    if (hasAuthUser) {
      // Bypass throttling for authenticated users (per TZ-18 spec)
      return true;
    }
    return super.canActivate(context);
  }
}
