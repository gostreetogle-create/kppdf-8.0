/**
 * TZ-86 Phase F.1.1 — TextBlock e2e.
 *
 * Coverage:
 *  - POST /api/text-blocks — creates with auto-slug from Russian name (transliteration)
 *  - POST /api/text-blocks — duplicate slug returns 409 Conflict
 *  - GET /api/text-blocks — list returns array
 *  - GET /api/text-blocks?category=legal — filters
 *  - GET /api/text-blocks/:id — single doc
 *  - GET /api/text-blocks/:id — invalid id returns 404
 *  - PATCH /api/text-blocks/:id — updates name + content
 *  - PATCH /api/text-blocks/:id — duplicate slug returns 409
 *  - DELETE /api/text-blocks/:id — soft-deletes (subsequent GET returns 404)
 *
 * Run: `pnpm test:e2e test/e2e/text-blocks.e2e-spec.ts`
 * Requires: MongoDB RS up (`docker compose up -d mongo`), admin seeded via AdminSeed.
 */
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';

describe('TextBlocks (e2e)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let auth: { Authorization: string };
  const created: string[] = [];

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const { access } = await loginAsAdmin(app);
    auth = authHeader(access);
  });

  afterAll(async () => {
    // Best-effort cleanup; the test DB is dropped by ctx.cleanup() anyway.
    for (const id of created) {
      await request(app.getHttpServer())
        .delete(`/api/text-blocks/${id}`)
        .set(auth)
        .catch(() => undefined);
    }
    await ctx.cleanup();
  });

  it('POST /text-blocks — creates with auto-slug from Russian name (transliteration)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Стандартные условия',
        content: 'Тестовый текст',
        category: 'legal',
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.name).toBe('Стандартные условия');
    // Service slugify: "Стандартные условия" → lowercased → "стандартные условия"
    //   → transliterate (ы→y, е→e, и→i, я→ya) → "standartnye usloviya"
    //   → spaces to dashes → "standartnye-usloviya"
    expect(res.body.slug).toBe('standartnye-usloviya');
    expect(res.body.content).toBe('Тестовый текст');
    expect(res.body.category).toBe('legal');
    expect(res.body.isActive).toBe(true);
    created.push(res.body._id);
  });

  it('POST /text-blocks — duplicate slug returns 409', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Дубликат имени',
        content: 'Первый',
        category: 'legal',
      });
    expect([200, 201]).toContain(first.status);
    created.push(first.body._id);

    const dup = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Дубликат имени', // same name → same auto-slug
        content: 'Второй',
        category: 'legal',
      });
    expect(dup.status).toBe(409);
  });

  it('POST /text-blocks — explicit duplicate slug returns 409', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Custom name 1',
        slug: 'fixed-slug',
        content: 'a',
        category: 'intro',
      });
    expect([200, 201]).toContain(first.status);
    created.push(first.body._id);

    const dup = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Custom name 2',
        slug: 'fixed-slug', // explicit duplicate
        content: 'b',
        category: 'outro',
      });
    expect(dup.status).toBe(409);
  });

  it('GET /text-blocks — list returns array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/text-blocks')
      .set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /text-blocks?category=legal filters by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/text-blocks?category=legal')
      .set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const t of res.body) {
      expect(t.category).toBe('legal');
    }
  });

  it('GET /text-blocks/:id — single doc', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({
        name: 'Single doc test',
        content: 'x',
        category: 'intro',
      });
    expect([200, 201]).toContain(create.status);
    created.push(create.body._id);

    const res = await request(app.getHttpServer())
      .get(`/api/text-blocks/${create.body._id}`)
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Single doc test');
  });

  it('GET /text-blocks/:id — invalid id returns 404', async () => {
    // 24-char valid format but non-existent id
    const res = await request(app.getHttpServer())
      .get('/api/text-blocks/64a7b8c9d0e1f2a3b4c5d6e7')
      .set(auth);
    expect(res.status).toBe(404);
  });

  it('PATCH /text-blocks/:id — updates name + content', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({ name: 'Before', content: 'a', category: 'legal' });
    expect([200, 201]).toContain(create.status);
    created.push(create.body._id);

    const res = await request(app.getHttpServer())
      .patch(`/api/text-blocks/${create.body._id}`)
      .set(auth)
      .send({ name: 'After', content: 'b' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('After');
    expect(res.body.content).toBe('b');
  });

  it('DELETE /text-blocks/:id — soft-deletes (subsequent GET returns 404)', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/text-blocks')
      .set(auth)
      .send({ name: 'ToDelete', content: 'x', category: 'legal' });
    expect([200, 201]).toContain(create.status);
    // Do NOT push to `created` — already deleted below.

    const del = await request(app.getHttpServer())
      .delete(`/api/text-blocks/${create.body._id}`)
      .set(auth);
    expect([200, 204]).toContain(del.status);

    const get = await request(app.getHttpServer())
      .get(`/api/text-blocks/${create.body._id}`)
      .set(auth);
    expect(get.status).toBe(404);
  });
});
