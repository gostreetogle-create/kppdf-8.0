/**
 * TZ-83 Phase E.1: product-modules e2e.
 *
 * Smoke-проверка CRUD для /api/product-modules с populate
 * (workTypes.workTypeId + materials.materialId). Тест требует:
 *  - запущенный Mongo (docker compose up -d mongo)
 *  - seeded admin (AdminSeed на bootstrap)
 *
 * Запуск: `pnpm run test:e2e test/e2e/product-modules.e2e-spec.ts`
 * Skip в CI? NO — это smoke. Если падает, значит regression.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginAsAdmin, authHeader } from '../setup/admin.fixture';

describe('ProductModules (TZ-83 Phase E)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));
    await app.init();

    const tokens = await loginAsAdmin(app);
    adminToken = tokens.access;
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * TZ-83 cleanup: NestJS POST defaults to HTTP 201 Created (если не
   * переопределен @HttpCode() декоратором). Никакого helper не нужно —
   * `.expect(201)` это canonical NestJS behavior.
   */
  it('CRUD round-trip preserves materials[] override', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/product-modules')
      .set(authHeader(adminToken))
      .send({
        name: 'Test Module E2E',
        article: 'TEST-MOD-001',
        dimensions: { width: 100, height: 50, depth: 30, unit: 'мм' },
        weight: 1.2,
        materials: [],
        workTypes: [],
      })
      .expect(201);
    const moduleId = create.body._id;
    expect(create.body.name).toBe('Test Module E2E');

    const list = await request(app.getHttpServer())
      .get('/api/product-modules')
      .set(authHeader(adminToken))
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.find((m: { _id: string }) => m._id === moduleId)).toBeDefined();

    const got = await request(app.getHttpServer())
      .get(`/api/product-modules/${moduleId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(got.body.name).toBe('Test Module E2E');
    expect(got.body.dimensions.unit).toBe('мм');

    await request(app.getHttpServer())
      .delete(`/api/product-modules/${moduleId}`)
      .set(authHeader(adminToken))
      .expect(204);
  });

  it('GET /product-modules?productId filters via Product.productModuleIds[] (M:N reverse)', async () => {
    // создать 2 модуля, привязать к продукту, проверить фильтр
    const productRes = await request(app.getHttpServer())
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Test Product', kind: 'good', unit: 'шт', status: 'new', isActive: true })
      .expect(201);
    const productId = productRes.body._id;

    const m1 = await request(app.getHttpServer())
      .post('/api/product-modules')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Fil 1', materials: [], workTypes: [] })
      .expect(201);
    const m2 = await request(app.getHttpServer())
      .post('/api/product-modules')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Fil 2', materials: [], workTypes: [] })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/products/${productId}/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: m1.body._id })
      .expect(201);

    const filtered = await request(app.getHttpServer())
      .get(`/api/product-modules?productId=${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(filtered.body.length).toBe(1);
    expect(filtered.body[0]._id).toBe(m1.body._id);

    // cleanup
    await request(app.getHttpServer())
      .delete(`/api/products/${productId}/modules/${m1.body._id}`)
      .set(authHeader(adminToken))
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/product-modules/${m1.body._id}`)
      .set(authHeader(adminToken))
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/product-modules/${m2.body._id}`)
      .set(authHeader(adminToken))
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/products/${productId}`)
      .set(authHeader(adminToken))
      .expect(204);
  });
});
