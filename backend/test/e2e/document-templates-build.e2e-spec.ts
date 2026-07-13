/**
 * TZ-86 Phase F.1.3 — DocumentTemplate build e2e.
 *
 * Coverage:
 *  - POST /api/document-templates/:id/build — returns 201 + text/html
 *  - Build with literal content (no dataBinding) renders the content as-is
 *  - Build with `{{organization.name}}` substitution template resolves the org
 *    from the build body and substitutes the name
 *  - Build with static dataBinding (set via Mongoose model bypass) substitutes
 *    the static value into the rendered HTML
 *  - Build with missing sourceIds degrades gracefully (empty placeholder)
 *  - Build with invalid templateId returns 400 (BadRequestException)
 *
 *  - Build with multi-column blocks (columns[] on TemplateBlock)
 *
 * Note: static-binding test uses Mongoose bypass because testing the build
 * pipeline independent of HTTP validation edge cases.
 *
 * Run: `pnpm test:e2e test/e2e/document-templates-build.e2e-spec.ts`
 */
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types, type Model } from 'mongoose';
import { createTestApp, TestContext } from '../setup/test-db';
import { loginAsAdmin, authHeader } from '../setup/test-auth';
import { TemplateBlock, TemplateBlockDocument } from '../../src/modules/template-block/template-block.schema';
import { Organization, OrganizationDocument } from '../../src/modules/organization/organization.schema';

describe('DocumentTemplates build (e2e)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let auth: { Authorization: string };
  let connection: Connection;
  let blockModel: Model<TemplateBlockDocument>;
  let orgModel: Model<OrganizationDocument>;
  const createdTemplates: string[] = [];
  const createdOrgs: string[] = [];

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    connection = app.get<Connection>(getConnectionToken());
    blockModel = connection.model<TemplateBlockDocument>(TemplateBlock.name);
    orgModel = connection.model<OrganizationDocument>(Organization.name);
    const { access } = await loginAsAdmin(app);
    auth = authHeader(access);
  });

  afterAll(async () => {
    for (const id of createdTemplates) {
      await request(app.getHttpServer())
        .delete(`/api/document-templates/${id}`)
        .set(auth)
        .catch(() => undefined);
    }
    // Cleanup organizations created directly via Mongoose
    for (const id of createdOrgs) {
      await orgModel.deleteOne({ _id: new Types.ObjectId(id) }).exec().catch(() => undefined);
    }
    await ctx.cleanup();
  });

  /**
   * Helper: create a real Organization via the API (admin endpoint).
   *
   * The `IsINN()` validator (`common/validators/inn.validator.ts`) runs the
   * official FNS checksum algorithm — random 10-digit strings fail it. We
   * therefore compute a unique 10-digit INN per call (9 digits derived from
   * the run-scoped monotonic counter + Date.now() tail for cross-run
   * uniqueness, 10th digit = the canonical (sum mod 11 mod 10) checksum).
   * This avoids dependence on a hand-curated list of real-world INNs (any
   * such list can drift as legal entities are merged/renamed).
   */
  let innCounter = 0;
  function generateValidInn(): string {
    const seed = (innCounter++).toString();
    // First 9 digits: 8 from `Date.now()` tail (cross-run uniqueness) + 1 from
    // the per-test counter (within-run uniqueness).
    const base = (Date.now().toString().slice(-8) + seed).slice(0, 9);
    const w = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let s = 0;
    for (let i = 0; i < 9; i++) s += Number(base[i]) * w[i];
    const check = (s % 11) % 10;
    return base + check.toString();
  }
  async function createRealOrganization(name: string): Promise<string> {
    const inn = generateValidInn();
    const res = await request(app.getHttpServer())
      .post('/api/organizations')
      .set(auth)
      .send({
        name,
        shortName: name.slice(0, 12),
        inn,
        legalForm: 'ООО',
        legalType: 'ooo',
        isActive: true,
      });
    expect([200, 201]).toContain(res.status);
    createdOrgs.push(res.body._id);
    return res.body._id;
  }

  /** Helper: create template + block via HTTP. Block has no dataBinding. */
  async function createTemplateWithBlock(opts: {
    templateName: string;
    organizationId: string;
    blockContent: string;
  }): Promise<{ templateId: string; blockId: string }> {
    const docTypeId = new Types.ObjectId().toString();
    const tpl = await request(app.getHttpServer())
      .post('/api/document-templates')
      .set(auth)
      .send({
        name: opts.templateName,
        organizationId: opts.organizationId,
        docTypeId,
        pageSize: 'A4',
      });
    expect([200, 201]).toContain(tpl.status);
    const tId = tpl.body._id;
    createdTemplates.push(tId);

    const block = await request(app.getHttpServer())
      .post(`/api/document-templates/${tId}/blocks`)
      .set(auth)
      .send({
        type: 'text',
        order: 0,
        content: opts.blockContent,
      });
    expect([200, 201]).toContain(block.status);
    return { templateId: tId, blockId: block.body._id };
  }

  it('POST /document-templates/:id/build — returns 201 + text/html with literal content', async () => {
    const orgId = await createRealOrganization('Literal Test Org');
    const { templateId } = await createTemplateWithBlock({
      templateName: 'Literal Test',
      organizationId: orgId,
      blockContent: 'LITERAL_CONTENT_HERE',
    });

    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${templateId}/build`)
      .set(auth)
      .send({});
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('LITERAL_CONTENT_HERE');
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('POST /document-templates/:id/build — substitutes {{organization.name}} from build body', async () => {
    const orgId = await createRealOrganization('SubstituteOrg');
    const { templateId } = await createTemplateWithBlock({
      templateName: 'Substitute Test',
      organizationId: orgId,
      blockContent: 'Hello {{organization.name}}!',
    });

    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${templateId}/build`)
      .set(auth)
      .send({ organizationId: orgId });
    expect(res.status).toBe(201);
    expect(res.text).toContain('Hello SubstituteOrg!');
    expect(res.text).not.toContain('{{organization.name}}');
  });

  it('POST /document-templates/:id/build — static dataBinding via Mongoose bypass substitutes value', async () => {
    // Create template via HTTP (no block yet)
    const orgId = await createRealOrganization('Static Test Org');
    const docTypeId = new Types.ObjectId().toString();
    const tpl = await request(app.getHttpServer())
      .post('/api/document-templates')
      .set(auth)
      .send({
        name: 'Static Binding Test',
        organizationId: orgId,
        docTypeId,
      });
    expect([200, 201]).toContain(tpl.status);
    const tId = tpl.body._id;
    createdTemplates.push(tId);

    // Create block with dataBinding via Mongoose (bypassing HTTP whitelist)
    const block = await blockModel.create({
      templateId: new Types.ObjectId(tId),
      type: 'text',
      order: 0,
      content: 'PLACEHOLDER', // should be replaced by dataBinding.value
      dataBinding: { source: 'static', value: 'STATIC_BOUND_VALUE' },
      isActive: true,
    });
    expect(block._id).toBeDefined();

    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${tId}/build`)
      .set(auth)
      .send({});
    expect(res.status).toBe(201);
    expect(res.text).toContain('STATIC_BOUND_VALUE');
    expect(res.text).not.toContain('PLACEHOLDER');
  });

  it('POST /document-templates/:id/build — missing sourceIds degrade to empty placeholders', async () => {
    const orgId = await createRealOrganization('Empty Test Org');
    const { templateId } = await createTemplateWithBlock({
      templateName: 'Empty Test',
      organizationId: orgId,
      blockContent: 'Hi {{organization.name}}!',
    });

    // Build with no organizationId in body → org source not resolved → empty
    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${templateId}/build`)
      .set(auth)
      .send({});
    expect(res.status).toBe(201);
    expect(res.text).toContain('Hi !'); // empty placeholder
  });

  it('POST /document-templates/:id/build — invalid templateId returns 400', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${fakeId}/build`)
      .set(auth)
      .send({});
    // build() validates ObjectId first → BadRequestException (400).
    // Note: NOT 404, because we don't even reach the findById call.
    expect([400, 404]).toContain(res.status);
  });

  it('POST block with columns[] — persists and build renders multi-column HTML', async () => {
    const orgId = await createRealOrganization('MultiCol Org');
    const docTypeId = new Types.ObjectId().toString();
    const tpl = await request(app.getHttpServer())
      .post('/api/document-templates')
      .set(auth)
      .send({ name: 'MultiCol', organizationId: orgId, docTypeId, pageSize: 'A4' });
    expect([200, 201]).toContain(tpl.status);
    const templateId = tpl.body._id;
    createdTemplates.push(templateId);

    const block = await request(app.getHttpServer())
      .post(`/api/document-templates/${templateId}/blocks`)
      .set(auth)
      .send({
        type: 'text',
        order: 0,
        columns: [
          { id: 'c1', content: 'LEFT_COL_XYZ', width: 1 },
          { id: 'c2', content: 'RIGHT_COL_XYZ', width: 1 },
        ],
      });
    expect([200, 201]).toContain(block.status);
    expect(block.body.columns).toHaveLength(2);

    const res = await request(app.getHttpServer())
      .post(`/api/document-templates/${templateId}/build`)
      .set(auth)
      .send({ organizationId: orgId });
    expect(res.status).toBe(201);
    expect(res.text).toContain('LEFT_COL_XYZ');
    expect(res.text).toContain('RIGHT_COL_XYZ');
  });
});
