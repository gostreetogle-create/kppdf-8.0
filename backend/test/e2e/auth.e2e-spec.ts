import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext, clearCollections } from '../setup/test-db';

describe('Auth (e2e)', () => {
  let ctx: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(async () => {
    await clearCollections(ctx.connection, ['users', 'refreshtokens']);
  });

  it('POST /auth/login — admin can login with default credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@kppdf.local', password: 'admin' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.access).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it('POST /auth/login — wrong password returns 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@kppdf.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('GET /auth/me — without token returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /auth/me — with valid token returns 200', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@kppdf.local', password: 'admin' });
    const token = login.body.access;
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@kppdf.local');
  });

  it('POST /auth/refresh — with valid refresh returns new tokens', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@kppdf.local', password: 'admin' });
    const refresh = login.body.refresh;
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refresh });
    expect([200, 201]).toContain(res.status);
    expect(res.body.access).toBeDefined();
  });
});
