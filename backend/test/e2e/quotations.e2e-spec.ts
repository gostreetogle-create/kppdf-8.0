import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, TestContext, clearCollections } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';

describe('Quotations (e2e)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let token: string;
  let counterpartyId: string;
  let orgId: string;
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
      'quotations', 'counterparties', 'organizations', 'products', 'categories',
    ]);
    // Setup minimal fixtures
    const cp = await request(app.getHttpServer())
      .post('/api/counterparties')
      .set(authHeader(token))
      .send({ name: 'Test CP', inn: '1234567890' });
    counterpartyId = cp.body._id;
    const org = await request(app.getHttpServer())
      .post('/api/organizations')
      .set(authHeader(token))
      .send({ name: 'Test Org', inn: '9876543210' });
    orgId = org.body._id;
    const prod = await request(app.getHttpServer())
      .post('/api/products')
      .set(authHeader(token))
      .send({ name: 'Test Product', sku: 'TEST-1', kind: 'good', unit: 'шт', listPrice: 100 });
    productId = prod.body._id;
  });

  it('POST /quotations — creates with snapshot fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/quotations')
      .set(authHeader(token))
      .send({
        organizationId: orgId,
        counterpartyId,
        items: [{ productId, quantity: 5, unitPrice: 100 }],
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.total).toBe(500);
    expect(res.body.items[0].total).toBe(500);
    expect(res.body.items[0].unitPrice).toBe(100);
  });

  it('POST /quotations/:id/duplicate — creates new Quotation', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/quotations')
      .set(authHeader(token))
      .send({ organizationId: orgId, counterpartyId, items: [{ productId, quantity: 1, unitPrice: 50 }] });
    const dup = await request(app.getHttpServer())
      .post(`/api/quotations/${create.body._id}/duplicate`)
      .set(authHeader(token));
    expect([200, 201]).toContain(dup.status);
    expect(dup.body._id).not.toBe(create.body._id);
    expect(dup.body.items.length).toBe(create.body.items.length);
  });

  it('Snapshot integrity — product price change does not affect old quotation', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/quotations')
      .set(authHeader(token))
      .send({ organizationId: orgId, counterpartyId, items: [{ productId, quantity: 1, unitPrice: 100 }] });
    const oldSnapshotPrice = create.body.items[0].unitPrice;
    // Update product price
    await request(app.getHttpServer())
      .patch(`/api/products/${productId}`)
      .set(authHeader(token))
      .send({ listPrice: 999 });
    // Re-fetch quotation
    const refetch = await request(app.getHttpServer())
      .get(`/api/quotations/${create.body._id}`)
      .set(authHeader(token));
    expect(refetch.body.items[0].unitPrice).toBe(oldSnapshotPrice);
  });

  it('POST /quotations/:id/convert-to-contract — creates Contract', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/quotations')
      .set(authHeader(token))
      .send({ organizationId: orgId, counterpartyId, items: [{ productId, quantity: 1, unitPrice: 100 }] });
    const convert = await request(app.getHttpServer())
      .post(`/api/quotations/${create.body._id}/convert-to-contract`)
      .set(authHeader(token))
      .send({});
    expect([200, 201]).toContain(convert.status);
    expect(convert.body.contractId).toBeDefined();
  });
});
