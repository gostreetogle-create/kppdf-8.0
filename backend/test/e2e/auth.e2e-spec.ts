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

  it('GET /auth/me — with valid token returns 200', async () => {
    // TZ-95 Phase 1: use canonical loginAsAdmin fixture (was raw supertest with
    // hardcoded credentials — drift-prone).
    const { access } = await loginAsAdmin(app);
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set(authHeader(access));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(TEST_ADMIN_USERNAME);
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
