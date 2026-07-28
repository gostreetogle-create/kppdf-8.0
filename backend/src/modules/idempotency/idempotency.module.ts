import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IDEMPOTENCY_CONFIG,
  IdempotencyInterceptor,
} from './idempotency.interceptor';
import {
  IdempotencyRecord,
  IdempotencyRecordSchema,
} from './schemas/idempotency-record.schema';

/**
 * IdempotencyModule wires:
 *  - Mongoose schema for `idempotency_records` collection (with TTL index)
 *  - Global IdempotencyInterceptor (provided in AppModule via APP_INTERCEPTOR)
 *  - IDEMPOTENCY_CONFIG provider reading env vars via ConfigService
 *
 * Env vars (declared in env.validation.ts with defaults):
 *   - IDEMPOTENCY_ENABLED: boolean (default true)
 *   - IDEMPOTENCY_TTL_SECONDS: number (default 300 = 5 min, matches TZ-232.N frontend)
 *   - IDEMPOTENCY_MAX_BODY_BYTES: number (default 5 * 1024 * 1024 = 5 MB)
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: IdempotencyRecord.name, schema: IdempotencyRecordSchema },
    ]),
  ],
  providers: [
    IdempotencyInterceptor,
    {
      provide: IDEMPOTENCY_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        enabled: config.get<string>('IDEMPOTENCY_ENABLED') !== 'false',
        ttlSeconds: Number(config.get<string>('IDEMPOTENCY_TTL_SECONDS') ?? 300),
        maxBodyBytes: Number(
          config.get<string>('IDEMPOTENCY_MAX_BODY_BYTES') ?? 5 * 1024 * 1024,
        ),
      }),
    },
  ],
  exports: [IdempotencyInterceptor, MongooseModule],
})
export class IdempotencyModule {}