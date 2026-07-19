import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

interface ThrottlerRequest {
  user?: { sub?: string; role?: string };
  headers?: Record<string, string | string[]>;
  ip?: string;
}

interface TierLimit {
  ttl: number;
  limit: number;
}

const TIER_LIMITS: Record<string, TierLimit> = {
  anon: { ttl: 60_000, limit: 10 },
  auth: { ttl: 60_000, limit: 30 },
  admin: { ttl: 60_000, limit: 100 },
};

@Injectable()
export class ThrottlerBehindAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const r = req as ThrottlerRequest;
    const headers = r.headers ?? {};
    const xff = headers['x-forwarded-for'];
    const ip = Array.isArray(xff) ? xff[0] : xff ?? r.ip ?? 'unknown';
    const role = r.user?.role ?? 'anon';
    return `tier:${role}:ip:${ip}`;
  }

  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    if (process.env.DISABLE_THROTTLE === '1') return true;
    return false;
  }

  getLimitForRole(role: string): TierLimit {
    return TIER_LIMITS[role] ?? TIER_LIMITS.anon;
  }
}
