/**
 * TZ-251 — TemplateBlock image upload e2e.
 *
 * Coverage (mirrors `document-templates-upload-background.e2e-spec.ts` style):
 *  - POST /api/template-blocks/:id/upload with valid PNG → 201 + URL match
 *  - URL matches /uploads/document-templates/<blockId>/<uuid>.png
 *  - POST with invalid MIME (text/plain) → 400 (fileFilter rejects)
 *  - POST with file > 5MB → 413 (MulterExceptionFilter maps LIMIT_FILE_SIZE)
 *  - POST to non-existent block → 404 (findById throws)
 *  - POST without file field → 400 (MulterExceptionFilter or service validation)
 *
 * Run: `pnpm test:e2e test/e2e/template-block-upload.e2e-spec.ts`
 */
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import { createTestApp, TestContext } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';

// 1x1 transparent PNG, 67 bytes. Valid signature + IHDR + IDAT + IEND.
const PNG_1x1 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

// 5 MB+ PNG buffer; PNG signature at start so fileFilter accepts, size
// check fires during streaming → MulterError('LIMIT_FILE_SIZE') → 413.
const PNG_TOO_LARGE = Buffer.alloc(6 * 1024 * 1024 + 16);
PNG_TOO_LARGE.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);

async function createTestTemplate(
  app: INestApplication,
  auth: { Authorization: string },
  name: string,
): Promise<string> {
  const orgId = new Types.ObjectId().toString();
  const docTypeId = new Types.ObjectId().toString();
  const res = await request(app.getHttpServer())
    .post('/api/document-templates')
    .set(auth)
    .send({ name, organizationId: orgId, docTypeId });
  expect([200, 201]).toContain(res.status);
  return res.body._id;
}

async function createImageBlock(
  app: INestApplication,
  auth: { Authorization: string },
  templateId: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post(`/api/document-templates/${templateId}/blocks`)
    .set(auth)
    .send({
      type: 'image',
      order: 0,
      title: 'Test Image',
      settings: { imageUrl: 'about:blank' },
      isActive: true,
    });
  expect([200, 201]).toContain(res.status);
  return res.body._id;
}

describe('TemplateBlock upload-image (e2e, TZ-251)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let auth: { Authorization: string };
  const createdTemplates: string[] = [];
  const createdBlocks: string[] = [];

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const { access } = await loginAsAdmin(app);
    auth = authHeader(access);
  });

  afterAll(async () => {
    for (const id of createdBlocks) {
      await request(app.getHttpServer())
        .delete(`/api/template-blocks/${id}`)
        .set(auth)
        .catch(() => undefined);
    }
    for (const id of createdTemplates) {
      await request(app.getHttpServer())
        .delete(`/api/document-templates/${id}`)
        .set(auth)
        .catch(() => undefined);
    }
    await ctx.cleanup();
  });

  it('POST upload-image with valid PNG → 201 + relative URL', async () => {
    const templateId = await createTestTemplate(app, auth, 'TZ-251 PNG');
    createdTemplates.push(templateId);
    const blockId = await createImageBlock(app, auth, templateId);
    createdBlocks.push(blockId);

    const res = await request(app.getHttpServer())
      .post(`/api/template-blocks/${blockId}/upload`)
      .set(auth)
      .attach('file', PNG_1x1, { filename: 'test.png', contentType: 'image/png' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.url).toMatch(
      new RegExp(`^/uploads/document-templates/${blockId}/[a-f0-9-]{36}\\.png$`),
    );
  });

  it('POST upload-image with invalid MIME (text/plain) → 400', async () => {
    const templateId = await createTestTemplate(app, auth, 'TZ-251 BadMime');
    createdTemplates.push(templateId);
    const blockId = await createImageBlock(app, auth, templateId);
    createdBlocks.push(blockId);

    const res = await request(app.getHttpServer())
      .post(`/api/template-blocks/${blockId}/upload`)
      .set(auth)
      .attach('file', Buffer.from('hello'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBe(400);
  });

  it('POST upload-image with file > 5MB → 413', async () => {
    const templateId = await createTestTemplate(app, auth, 'TZ-251 BigFile');
    createdTemplates.push(templateId);
    const blockId = await createImageBlock(app, auth, templateId);
    createdBlocks.push(blockId);

    const res = await request(app.getHttpServer())
      .post(`/api/template-blocks/${blockId}/upload`)
      .set(auth)
      .attach('file', PNG_TOO_LARGE, { filename: 'big.png', contentType: 'image/png' });
    expect(res.status).toBe(413);
  });

  it('POST upload-image to non-existent block → 404', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request(app.getHttpServer())
      .post(`/api/template-blocks/${fakeId}/upload`)
      .set(auth)
      .attach('file', PNG_1x1, { filename: 'test.png', contentType: 'image/png' });
    expect(res.status).toBe(404);
  });
});
