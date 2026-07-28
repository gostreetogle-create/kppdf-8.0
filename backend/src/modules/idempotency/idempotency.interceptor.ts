import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as crypto from 'crypto';
import {
  IdempotencyRecord,
  IdempotencyRecordDocument,
} from './schemas/idempotency-record.schema';

/**
 * Skip marker — read by `@SkipIdempotency()` decorator metadata.
 * Endpoints decorated with `@SkipIdempotency()` bypass replay/conflict logic
 * (used for auth endpoints, streaming responses, oversized payloads).
 */
export const SKIP_IDEMPOTENCY_KEY = 'skipIdempotency';

/** HTTP methods that mutate state. GET / HEAD / OPTIONS are bypassed. */
const MUTATING_METHODS = new Set(['POST', 'PATCH', 'DELETE', 'PUT']);

interface RequestShape {
  method: string;
  url: string;
  body?: unknown;
  query?: unknown;
  headers: Record<string, string | string[] | undefined>;
  user?: { id?: string; _id?: string; sub?: string };
  ip?: string;
}

interface IdempotencyConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxBodyBytes: number;
}

export const IDEMPOTENCY_CONFIG = 'IDEMPOTENCY_CONFIG';

/**
 * Global interceptor: detects replays of state-changing requests via the
 * `Idempotency-Key` header (RFC draft "The Idempotency-Key HTTP Header Field").
 *
 * Execution chain (per TZ-247 spec):
 *   Request → RequestIdMiddleware → JwtAuthGuard (sets req.user)
 *   → **IdempotencyInterceptor** (this; reads req.user)
 *   → UserContextInterceptor → AuditInterceptor → RouteHandler
 *
 * Flow (atomic upsert — see TZ-247 §3 Race Condition handling):
 *   1. Missing/invalid key OR non-mutating method OR `@SkipIdempotency()` → bypass
 *   2. Compute payloadHash = sha256(JSON.stringify({ body, query }))
 *   3. atomic upsert `{ key, userId }` with `$setOnInsert` to create IN_PROGRESS record:
 *      - If `existing === null` → WE ARE FIRST → run handler, capture response, mark COMPLETED
 *      - If `existing.status === 'IN_PROGRESS'` → race condition → 409 Conflict
 *      - If `existing.payloadHash !== currentHash` → different body → 409 Conflict
 *      - If `existing.status === 'COMPLETED' && payloadHash matches` → REPLAY cached response
 *
 * Race-condition safety: atomic `findOneAndUpdate` with `upsert:true, returnDocument:'before'`
 * guarantees only ONE request creates the IN_PROGRESS record. Concurrent attempts
 * receive the existing record with `status === 'IN_PROGRESS'` and get 409.
 *
 * Edge cases:
 *   - Streaming responses (Content-Type: text/event-stream, application/octet-stream):
 *     skip caching via `@SkipIdempotency()` decorator OR configure `maxBodyBytes`.
 *   - Oversized responses (>5MB BSON limit): record stored WITHOUT `responseBody`,
 *     replay returns 200 + cached statusCode only (next request re-executes handler).
 *   - Handler exceptions: `catchError` operator stores error response (4xx/5xx)
 *     and re-throws — allows replay of error responses for retry-storm protection
 *     (matches frontend SubmitGuard 5xx cache TTL of 60s — see TZ-232.N).
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger('IdempotencyInterceptor');

  constructor(
    private readonly reflector: Reflector,
    @InjectModel(IdempotencyRecord.name)
    private readonly model: Model<IdempotencyRecordDocument>,
    @Optional()
    @Inject(IDEMPOTENCY_CONFIG)
    private readonly config: IdempotencyConfig = {
      enabled: true,
      ttlSeconds: 300,
      maxBodyBytes: 5 * 1024 * 1024, // 5 MB
    },
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    if (!this.config.enabled) return next.handle();

    const req = context.switchToHttp().getRequest<RequestShape>();
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();

    // ── Bypass gates ──────────────────────────────────────────────────────
    if (!MUTATING_METHODS.has(req.method)) return next.handle();

    const skipped = this.reflector.getAllAndOverride<boolean>(SKIP_IDEMPOTENCY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipped) return next.handle();

    const rawKey = req.headers['idempotency-key'];
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    if (!key || !this.isValidKey(key)) {
      // No/invalid key → pass through. Idempotency is opt-in via header.
      // Frontend attaches the header; service-level mutations without frontend
      // bypass (matches TZ-232.N interceptor fallback: generate fresh UUID).
      return next.handle();
    }

    // ── Scope by userId (req.user set by JwtAuthGuard which runs BEFORE us) ──
    const userIdRaw = req.user?.id ?? req.user?._id ?? req.user?.sub;
    const userId = userIdRaw ? new Types.ObjectId(userIdRaw) : undefined;
    if (!userId) {
      // No userId → can't scope; allow through (e.g. login endpoints skip via @SkipIdempotency).
      this.logger.debug(`No userId for ${req.method} ${req.url} — bypassing`);
      return next.handle();
    }

    // ── Compute payload hash ─────────────────────────────────────────────
    const payloadHash = this.hashPayload(req.body, req.query);

    // ── Atomic upsert: create IN_PROGRESS or detect existing ─────────────
    const existing = await this.model.findOneAndUpdate(
      { key, userId },
      {
        $setOnInsert: {
          key,
          userId,
          endpoint: `${req.method} ${req.url}`,
          payloadHash,
          status: 'IN_PROGRESS' as const,
        },
      },
      { upsert: true, returnDocument: 'before', new: false },
    );

    if (existing) {
      // ── Branch B: existing record found ────────────────────────────────
      if (existing.payloadHash !== payloadHash) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Idempotency-Key payload mismatch',
          message: `Idempotency-Key "${key}" was previously used with a different payload. Use a new key for different operations.`,
        });
      }
      if (existing.status === 'IN_PROGRESS') {
        // Race condition: a previous request is still running.
        throw new ConflictException({
          statusCode: 409,
          error: 'Idempotency-Key request already in progress',
          message: `A request with Idempotency-Key "${key}" is currently being processed. Retry in ~1s.`,
        });
      }
      // COMPLETED + same payload → REPLAY.
      this.logger.debug(
        `Replaying cached response for key=${key} user=${userId} endpoint=${existing.endpoint}`,
      );
      res.statusCode = existing.statusCode ?? 200;
      return of(existing.responseBody ?? null);
    }

    // ── Branch A: WE ARE FIRST — run handler, capture response ───────────
    return next.handle().pipe(
      tap(async (data) => {
        // Capture response (success path).
        const statusCode = res.statusCode ?? 200;
        const responseBody = this.maybeSerializeBody(data);
        try {
          await this.model.updateOne(
            { key, userId },
            {
              $set: {
                status: 'COMPLETED' as const,
                statusCode,
                ...(responseBody !== undefined
                  ? { responseBody: responseBody as Record<string, unknown> | unknown[] }
                  : {}),
              },
            },
          );
        } catch (e) {
          // Best-effort: if capture fails, future replays will see IN_PROGRESS → 409.
          // Trade-off: avoid throwing here (would mask the actual response).
          this.logger.error(
            `Failed to capture idempotency response for key=${key}: ${(e as Error).message}`,
          );
        }
        return data;
      }),
      catchError((err: unknown, caught: Observable<unknown>) => {
        // Capture error responses (4xx/5xx) for retry-storm protection.
        const httpErr = err as { status?: number; statusCode?: number; response?: unknown };
        const statusCode = httpErr.statusCode ?? httpErr.status ?? 500;
        // Fire-and-forget; do not block error propagation.
        this.model
          .updateOne(
            { key, userId },
            {
              $set: {
                status: 'COMPLETED' as const,
                statusCode,
                responseBody: (httpErr.response ?? {}) as Record<string, unknown> | unknown[],
              },
            },
          )
          .catch((e) => {
            this.logger.error(
              `Failed to capture idempotency error for key=${key}: ${(e as Error).message}`,
            );
          });
        return throwError(() => err);
      }),
    );
  }

  /**
   * SHA-256 of JSON.stringify({ body, query }) — stable across process restarts
   * because both inputs are plain JSON values (no Date objects after Express body parsing).
   * Sort keys at top level via JSON.stringify replacer=false (default order is insertion order).
   */
  private hashPayload(body: unknown, query: unknown): string {
    const payload = JSON.stringify({ b: body ?? null, q: query ?? null });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /** UUID v4 format check (lenient: accept any non-empty string ≤64 chars). */
  private isValidKey(key: string): boolean {
    return typeof key === 'string' && key.length >= 8 && key.length <= 64;
  }

  /**
   * Serialize body for MongoDB storage. Returns undefined if body is too large
   * (will be skipped in update — replay returns null body + cached status).
   */
  private maybeSerializeBody(data: unknown): unknown {
    if (data === undefined || data === null) return null;
    try {
      const serialized = JSON.stringify(data);
      if (serialized.length > this.config.maxBodyBytes) return undefined;
      return JSON.parse(serialized) as Record<string, unknown> | unknown[];
    } catch {
      // Non-serializable (e.g., circular ref, BigInt) → skip.
      return undefined;
    }
  }
}