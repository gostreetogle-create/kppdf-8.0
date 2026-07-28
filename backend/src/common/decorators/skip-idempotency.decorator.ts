import { SetMetadata } from '@nestjs/common';
import { SKIP_IDEMPOTENCY_KEY } from '../../modules/idempotency/idempotency.interceptor';

/**
 * Skip idempotency enforcement for the decorated handler or controller class.
 *
 * Use cases:
 *   - Auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`) — no userId
 *     before authentication; idempotency doesn't apply (login retries are
 *     intentional and should return fresh tokens).
 *   - Streaming responses (`@Res() stream` or SSE endpoints) — body can't be
 *     captured in BSON; replay would return stale stream.
 *   - Oversized payloads — `IDEMPOTENCY_MAX_BODY_BYTES` exceeded; replay would
 *     miss the body. Use `@SkipIdempotency()` instead of relying on the soft
 *     skip-via-undefined behavior.
 *
 * Usage:
 *   ```typescript
 *   @SkipIdempotency()
 *   @Post('login')
 *   async login(@Body() dto: LoginDto) { ... }
 *   ```
 */
export const SkipIdempotency = (): MethodDecorator & ClassDecorator =>
  SetMetadata(SKIP_IDEMPOTENCY_KEY, true);