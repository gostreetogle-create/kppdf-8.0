import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext } from '../setup/test-db';
import {
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_USERNAME,
  loginAsAdmin,
  authHeader,
} from '../setup/admin.fixture';

describe('Auth (e2e)', () => {
  let ctx: TestContext | undefined;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await ctx?.cleanup();
  });

  // NOTE: Do NOT clear the 'users' collection in beforeEach — the admin
  // user is seeded by AdminSeed during app bootstrap and login tests
  // depend on it. Only the auth tests that mutate user state (e.g.
  // refreshTokenVersion) would need cleanup, but each test re-logs in
  // fresh anyway.

  it('POST /auth/login — admin can login with default credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
    expect([200, 201]).toContain(res.status);
    expect(res.body.access).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it('POST /auth/login — wrong password returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: TEST_ADMIN_USERNAME, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me — without token returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me — with valid token returns 200 (TZ-92: safe projection)', async () => {
    // TZ-95 Phase 1: use canonical loginAsAdmin fixture (was raw supertest with
    // hardcoded credentials — drift-prone).
    // TZ-92 Phase 1: response must NOT contain refreshTokenVersion, passwordHash,
    // soft-delete fields, etc — only safe AuthUserPayload projection.
    const { access } = await loginAsAdmin(app);
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set(authHeader(access));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(TEST_ADMIN_USERNAME);
    expect(res.body.role).toBe('admin');
    // TZ-92 §1 HIGH QA-01:1.4 — these fields must be absent from the response.
    expect(res.body.refreshTokenVersion).toBeUndefined();
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.password).toBeUndefined();
    expect(res.body.deletedAt).toBeUndefined();
  });

  it('POST /auth/refresh — with valid refresh returns new tokens', async () => {
    const { refresh } = await loginAsAdmin(app);
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set(authHeader(refresh))
      .send({});
    expect([200, 201]).toContain(res.status);
    expect(res.body.access).toBeDefined();
  });
});
