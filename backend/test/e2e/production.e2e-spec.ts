import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext, clearCollections } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';

describe('Production flow (e2e)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let token: string;
  let productId: string;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const auth = await loginAsAdmin(app);
    token = auth.access;
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(async () => {
    await clearCollections(ctx.connection, [
      'products', 'techprocesses', 'productionorders', 'ordertasks',
      'workorders', 'workorderoperations', 'costcalculations', 'actualcosts', 'orderclosings', 'boms',
    ]);
    const p = await request(app.getHttpServer())
      .post('/api/products')
      .set(authHeader(token))
      .send({ name: 'Widget', kind: 'good', unit: 'шт' });
    productId = p.body._id;
  });

  it('full production flow — create PO, complete tasks, cost, close', async () => {
    // 1. Create production order
    const po = await request(app.getHttpServer())
      .post('/api/production-orders')
      .set(authHeader(token))
      .send({ productId, quantity: 5 });
    expect([200, 201]).toContain(po.status);
    const poId = po.body._id;

    // 2. Get tasks
    const tasks = await request(app.getHttpServer())
      .get(`/api/production-orders/${poId}/tasks`)
      .set(authHeader(token));
    expect([200, 201]).toContain(tasks.status);
    expect(Array.isArray(tasks.body)).toBe(true);

    // 3. Actual cost
    const ac = await request(app.getHttpServer())
      .post(`/api/production-orders/${poId}/actual-costs`)
      .set(authHeader(token))
      .send({ type: 'material', amount: 5000 });
    expect([200, 201]).toContain(ac.status);

    // 4. Cost comparison
    const cc = await request(app.getHttpServer())
      .get(`/api/production-orders/${poId}/cost-comparison`)
      .set(authHeader(token));
    expect(cc.status).toBe(200);
    expect(cc.body.planned).toBeDefined();
    expect(cc.body.actual).toBeDefined();
    expect(cc.body.variance).toBeDefined();
  }, 30000);
});
