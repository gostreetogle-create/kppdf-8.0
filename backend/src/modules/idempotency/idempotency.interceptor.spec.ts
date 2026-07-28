import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { firstValueFrom, of, throwError } from 'rxjs';
import { IdempotencyInterceptor, IDEMPOTENCY_CONFIG } from './idempotency.interceptor';
import { IdempotencyRecord } from './schemas/idempotency-record.schema';
import { SkipIdempotency } from '../../common/decorators/skip-idempotency.decorator';
import { SKIP_IDEMPOTENCY_KEY } from './idempotency.interceptor';

interface MockRecord {
  key: string;
  userId: string;
  endpoint: string;
  payloadHash: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  statusCode?: number;
  responseBody?: Record<string, unknown> | unknown[];
}

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let mockModel: {
    findOneAndUpdate: jest.Mock;
    updateOne: jest.Mock;
  };

  const USER_ID = '507f1f77bcf86cd799439011';

  const buildContext = (req: Record<string, unknown>): ExecutionContext => {
    const res = { statusCode: 200 };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => jest.fn(),
      getClass: () => class Foo {},
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    mockModel = {
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        Reflector,
        { provide: getModelToken(IdempotencyRecord.name), useValue: mockModel },
        { provide: IDEMPOTENCY_CONFIG, useValue: { enabled: true, ttlSeconds: 300, maxBodyBytes: 1024 } },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
  });

  describe('bypass gates', () => {
    it('bypasses GET requests', async () => {
      const next: CallHandler = { handle: () => of('ok') };
      const ctx = buildContext({
        method: 'GET',
        url: '/api/products',
        headers: {},
      });
      const result = await interceptor.intercept(ctx, next);
      expect(await firstValueFrom(result)).toBe('ok');
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('bypasses when Idempotency-Key header is missing', async () => {
      const next: CallHandler = { handle: () => of('ok') };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: {},
        body: { name: 'foo' },
        user: { id: USER_ID },
      });
      const result = await interceptor.intercept(ctx, next);
      expect(await firstValueFrom(result)).toBe('ok');
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('bypasses when IDEMPOTENCY_ENABLED=false', async () => {
      const cfg = { enabled: false, ttlSeconds: 300, maxBodyBytes: 1024 };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          IdempotencyInterceptor,
          Reflector,
          { provide: getModelToken(IdempotencyRecord.name), useValue: mockModel },
          { provide: IDEMPOTENCY_CONFIG, useValue: cfg },
        ],
      }).compile();
      const localInterceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
      const next: CallHandler = { handle: () => of('ok') };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-xxx' },
        user: { id: USER_ID },
        body: { name: 'foo' },
      });
      const result = await localInterceptor.intercept(ctx, next);
      expect(await firstValueFrom(result)).toBe('ok');
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('bypasses when no userId (e.g. unauthenticated endpoint)', async () => {
      const next: CallHandler = { handle: () => of('ok') };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'idempotency-key': 'uuid-xxx' },
        body: { username: 'a', password: 'b' },
        // No `user` field — would normally be filtered by JwtAuthGuard too,
        // but the interceptor is robust to anonymous endpoints.
      });
      const result = await interceptor.intercept(ctx, next);
      expect(await firstValueFrom(result)).toBe('ok');
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('first request (no existing record)', () => {
    it('creates IN_PROGRESS record, runs handler, captures COMPLETED status', async () => {
      const captured: { status?: string; statusCode?: number; responseBody?: unknown } = {};
      mockModel.findOneAndUpdate.mockResolvedValueOnce(null); // first time
      mockModel.updateOne.mockImplementation((_filter, update) => {
        captured.status = update.$set.status;
        captured.statusCode = update.$set.statusCode;
        captured.responseBody = update.$set.responseBody;
        return { exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
      });

      const next: CallHandler = { handle: () => of({ _id: 'p1', name: 'foo' }) };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-12345678' },
        body: { name: 'foo' },
        user: { id: USER_ID },
      });
      ctx.switchToHttp().getResponse().statusCode = 201;

      const result = await interceptor.intercept(ctx, next);
      const out = await firstValueFrom(result);
      expect(out).toEqual({ _id: 'p1', name: 'foo' });

      // findOneAndUpdate called with atomic upsert + IN_PROGRESS
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const [filter, update, opts] = mockModel.findOneAndUpdate.mock.calls[0]!;
      expect(filter.key).toBe('uuid-12345678');
      expect(update.$setOnInsert.status).toBe('IN_PROGRESS');

      // updateOne called via tap to capture response
      expect(mockModel.updateOne).toHaveBeenCalledTimes(1);
      expect(captured.status).toBe('COMPLETED');
      expect(captured.statusCode).toBe(201);
      expect(captured.responseBody).toEqual({ _id: 'p1', name: 'foo' });
    });

    it('captures error responses (5xx) for retry-storm protection', async () => {
      const captured: { status?: string; statusCode?: number } = {};
      mockModel.findOneAndUpdate.mockResolvedValueOnce(null);
      mockModel.updateOne.mockImplementation((_filter, update) => {
        captured.status = update.$set.status;
        captured.statusCode = update.$set.statusCode;
        return { exec: jest.fn().mockResolvedValue({}) };
      });

      const next: CallHandler = {
        handle: () => throwError(() => ({ statusCode: 500, response: { message: 'fail' } })),
      };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-error' },
        body: {},
        user: { id: USER_ID },
      });

      await expect(firstValueFrom(await interceptor.intercept(ctx, next))).rejects.toMatchObject({
        statusCode: 500,
      });

      expect(captured.status).toBe('COMPLETED');
      expect(captured.statusCode).toBe(500);
    });
  });

  describe('replay (existing COMPLETED record)', () => {
    it('returns cached response without running handler', async () => {
      const cached: MockRecord = {
        key: 'uuid-replay',
        userId: USER_ID,
        endpoint: 'POST /api/products',
        payloadHash: 'h1', // matches
        status: 'COMPLETED',
        statusCode: 201,
        responseBody: { _id: 'p1', name: 'cached' },
      };
      mockModel.findOneAndUpdate.mockResolvedValueOnce(cached);

      const handler = jest.fn().mockReturnValue(of({ fresh: 'should-not-run' }));
      const next: CallHandler = { handle: handler };

      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-replay' },
        body: { name: 'foo' }, // produces hash 'h1'
        user: { id: USER_ID },
      });

      const result = await interceptor.intercept(ctx, next);
      const out = await firstValueFrom(result);
      expect(out).toEqual({ _id: 'p1', name: 'cached' });
      expect(handler).not.toHaveBeenCalled();
      expect(ctx.switchToHttp().getResponse().statusCode).toBe(201);
    });
  });

  describe('conflict (different payload)', () => {
    it('throws 409 Conflict when payloadHash differs', async () => {
      mockModel.findOneAndUpdate.mockResolvedValueOnce({
        key: 'uuid-conflict',
        userId: USER_ID,
        endpoint: 'POST /api/products',
        payloadHash: 'different-hash',
        status: 'COMPLETED',
        statusCode: 200,
      });

      const next: CallHandler = { handle: () => of({ ok: true }) };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-conflict' },
        body: { name: 'NEW NAME' },
        user: { id: USER_ID },
      });

      await expect(interceptor.intercept(ctx, next)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(mockModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('race condition (IN_PROGRESS)', () => {
    it('throws 409 when previous request still running', async () => {
      mockModel.findOneAndUpdate.mockResolvedValueOnce({
        key: 'uuid-race',
        userId: USER_ID,
        endpoint: 'POST /api/products',
        payloadHash: 'h1',
        status: 'IN_PROGRESS',
      });

      const next: CallHandler = { handle: () => of({ ok: true }) };
      const ctx = buildContext({
        method: 'POST',
        url: '/api/products',
        headers: { 'idempotency-key': 'uuid-race' },
        body: { name: 'foo' },
        user: { id: USER_ID },
      });

      await expect(interceptor.intercept(ctx, next)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('@SkipIdempotency()', () => {
    it('bypasses when handler has @SkipIdempotency metadata', async () => {
      // Re-create with a real reflector that returns skip=true for handler.
      const skipHandler = function skipHandler() {} as unknown as Function;
      // Apply decorator manually for testing.
      const { Reflect } = require('@nestjs/core');
      Reflect.defineMetadata(SKIP_IDEMPOTENCY_KEY, true, skipHandler);

      const next: CallHandler = { handle: () => of('ok') };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/api/auth/login',
            headers: { 'idempotency-key': 'uuid-skip' },
            body: {},
            user: { id: USER_ID },
          }),
          getResponse: () => ({ statusCode: 200 }),
        }),
        getHandler: () => skipHandler,
        getClass: () => class Foo {},
      } as unknown as ExecutionContext;

      const result = await interceptor.intercept(ctx, next);
      expect(await firstValueFrom(result)).toBe('ok');
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});