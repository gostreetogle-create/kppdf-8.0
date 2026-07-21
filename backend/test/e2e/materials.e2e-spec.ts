import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext, clearCollections } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';

describe('Materials (e2e)', () => {
  let ctx: TestContext | undefined;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const auth = await loginAsAdmin(app);
    token = auth.access;
  });

  afterAll(async () => {
    await ctx?.cleanup();
  });

  beforeEach(async () => {
    await clearCollections(ctx!.connection, ['materials']);
  });

  describe('GET /materials', () => {
    it('returns paginated list of materials', async () => {
      // Seed two materials
      await request(app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({ name: 'Steel Sheet', unit: 'кг' });
      await request(app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({ name: 'Aluminum Rod', unit: 'шт' });

      const res = await request(app.getHttpServer())
        .get('/api/materials')
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /materials', () => {
    it('admin creates a material', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({ name: 'Steklo 4mm', unit: 'м2', pricePerUnit: 500 });
      expect([200, 201]).toContain(res.status);
      expect(res.body._id).toBeDefined();
      expect(res.body.name).toBe('Steklo 4mm');
    });

    it('without admin role returns 403', async () => {
      // Create a non-admin user
      const userRes = await request(app.getHttpServer())
        .post('/api/users')
        .set(authHeader(token))
        .send({
          username: 'viewer_e2e',
          email: 'viewer_e2e@test.com',
          displayName: 'Viewer',
          password: 'viewerpass123',
          role: 'user',
        });
      // Login as that user
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'viewer_e2e', password: 'viewerpass123' });
      const userToken = loginRes.body.access;

      const res = await request(app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(userToken))
        .send({ name: 'Unauthorized Material', unit: 'шт' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /materials/:id', () => {
    it('returns material by ID', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({ name: 'Copper Wire', unit: 'м' });
      const id = created.body._id;

      const res = await request(app.getHttpServer())
        .get(`/api/materials/${id}`)
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(id);
      expect(res.body.name).toBe('Copper Wire');
    });
  });
});
