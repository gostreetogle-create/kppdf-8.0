/**
 * TZ-83 Phase E.1: products-with-modules e2e (TZ-83 § D.3 attach/detach).
 *
 * Проверяет:
 *  - atomic POST /products/:id/modules { moduleId } → 201 + product has moduleId in productModuleIds
 *  - idempotency: повторный attach не дублирует ($addToSet)
 *  - existence check: attach с несуществующим moduleId → 404
 *  - DELETE /products/:id/modules/:moduleId → 204
 *  - DELETE non-existent product → 404
 *
 * Запуск: `pnpm run test:e2e test/e2e/products-attach-modules.e2e-spec.ts`
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginAsAdmin, authHeader } from '../setup/admin.fixture';

describe('Products attach/detach modules (TZ-83 Phase D.3)', () => {
  let app: INestApplication;
  let adminToken: string;
  let productId: string;
  let module1: string;
  let module2: string;

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

    const product = await request(app.getHttpServer())
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Attach Product', kind: 'good', unit: 'шт', status: 'new', isActive: true })
      .expect(201);
    productId = product.body._id;

    const m1 = await request(app.getHttpServer())
      .post('/api/product-modules')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Attach Mod 1', materials: [], workTypes: [] })
      .expect(201);
    module1 = m1.body._id;

    const m2 = await request(app.getHttpServer())
      .post('/api/product-modules')
      .set(authHeader(adminToken))
      .send({ name: 'E2E Attach Mod 2', materials: [], workTypes: [] })
      .expect(201);
    module2 = m2.body._id;
  });

  afterAll(async () => {
    if (productId) {
      await request(app.getHttpServer())
        .delete(`/api/products/${productId}`)
        .set(authHeader(adminToken))
        .expect(204);
    }
    if (module1) {
      await request(app.getHttpServer())
        .delete(`/api/product-modules/${module1}`)
        .set(authHeader(adminToken))
        .expect(204);
    }
    if (module2) {
      await request(app.getHttpServer())
        .delete(`/api/product-modules/${module2}`)
        .set(authHeader(adminToken))
        .expect(204);
    }
    await app.close();
  });

  it('atomic attach: POST /products/:id/modules → 201 + productModuleIds populated', async () => {
    const r = await request(app.getHttpServer())
      .post(`/api/products/${productId}/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: module1 })
      .expect(201);
    expect(r.body.productModuleIds).toBeDefined();
    const ids = r.body.productModuleIds.map((m: { _id?: string } | string) =>
      typeof m === 'string' ? m : m._id,
    );
    expect(ids).toContain(module1);
  });

  it('idempotency: повторный attach того же moduleId НЕ дублирует', async () => {
    await request(app.getHttpServer())
      .post(`/api/products/${productId}/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: module1 })
      .expect(201);
    const after = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    const ids = after.body.productModuleIds.map((m: { _id?: string } | string) =>
      typeof m === 'string' ? m : m._id,
    );
    expect(ids.filter((id: string) => id === module1).length).toBe(1);
  });

  it('attaching two distinct modules → productModuleIds has both', async () => {
    await request(app.getHttpServer())
      .post(`/api/products/${productId}/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: module2 })
      .expect(201);
    const after = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    const ids = after.body.productModuleIds.map((m: { _id?: string } | string) =>
      typeof m === 'string' ? m : m._id,
    );
    expect(ids).toContain(module1);
    expect(ids).toContain(module2);
  });

  it('existence check: attach non-existent moduleId → 404', async () => {
    await request(app.getHttpServer())
      .post(`/api/products/${productId}/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: '64b8b8b8b8b8b8b8b8b8b8b8' })
      .expect(404);
  });

  it('DELETE /products/:id/modules/:moduleId → 204 + productModuleIds shrinks', async () => {
    await request(app.getHttpServer())
      .delete(`/api/products/${productId}/modules/${module1}`)
      .set(authHeader(adminToken))
      .expect(204);
    const after = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    const ids = after.body.productModuleIds.map((m: { _id?: string } | string) =>
      typeof m === 'string' ? m : m._id,
    );
    expect(ids).not.toContain(module1);
  });

  it('DELETE on non-existent product → 404', async () => {
    await request(app.getHttpServer())
      .delete(`/api/products/64b8b8b8b8b8b8b8b8b8b8b8/modules/${module2}`)
      .set(authHeader(adminToken))
      .expect(404);
  });

  it('invalid ObjectId in either param → 400', async () => {
    await request(app.getHttpServer())
      .post(`/api/products/garbage/modules`)
      .set(authHeader(adminToken))
      .send({ moduleId: module2 })
      .expect(400);
  });
});
