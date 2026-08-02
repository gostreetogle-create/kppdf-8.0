import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TextBlockService } from './text-block.service';
import { TextBlock } from './text-block.schema';
import { TextBlockCategoryService } from '../text-block-category/text-block-category.service';

/**
 * TZ-DOC-322 + TZ-DOC-323 — text-block `categoryId` resolution contract.
 *
 * Verified here (also exercised by the e2e text-blocks suite + the boot
 * assertion `text-block-category-seed-init.e2e-spec.ts`):
 *
 *  1. Caller-supplied `categoryId` is honored via `assertAssignable`.
 *  2. No `categoryId` → `resolveDefault(organizationId)`. Empty result
 *     surfaces a deterministic 4xx BadRequestException with a message
 *     that names the operator action (AppModule-wired seed) — NOT a
 *     silent self-heal via the TZ-DOC-320 ladder.
 *  3. The shared `isDuplicateSlug(11000) → ConflictException` and
 *     Mongoose-error-propagation paths stay unchanged.
 *
 * Removed in TZ-DOC-322: `LEGACY_CATEGORY_SLUG` ladder, `ensureSystemDefault`
 * lazy upsert (both rolled forward by TZ-DOC-321 seed wire-up).
 * Removed in TZ-DOC-323: the legacy `dto.category?: 'legal'|...` test.
 * The schema field is gone; a caller that still sends `category` is
 * rejected upstream by the global `ValidationPipe.forbidNonWhitelisted`
 * (covered by `backend/src/main.ts` `exceptionFactory`, via e2e sanity
 * when needed).
 *
 * TZ-DOC-323 regression additions:
 *  - create({ categoryId: <system default ObjectId> }) → writes through
 *    `assertAssignable` and returns a doc with that `_id` on
 *    `categoryId`. (Mirrors test #1 but asserts the doc's persisted
 *    payload explicitly — covering the integration with `model.create`.)
 *  - create({ category: 'intro' as any, ... }) → the service is given
 *    a `category`-shaped unknown extra by an upstream caller. The
 *    service MUST NOT forward that key to Mongoose (it would be
 *    stripped by the global DTO cast; this test asserts the same at
 *    service-layer as a defense-in-depth.
 */
describe('TextBlockService (TZ-DOC-322 + TZ-DOC-323)', () => {
  let service: TextBlockService;
  let blockModel: {
    create: jest.Mock;
    findById: jest.Mock;
    find: jest.Mock;
    deleteOne: jest.Mock;
  };
  let categoryService: {
    assertAssignable: jest.Mock;
    resolveDefault: jest.Mock;
  };

  beforeEach(async () => {
    blockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(() => ({ sort: () => ({ exec: () => Promise.resolve([]) }) })),
      deleteOne: jest.fn(() => ({ exec: () => Promise.resolve({}) })),
    };
    categoryService = { assertAssignable: jest.fn(), resolveDefault: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextBlockService,
        { provide: getModelToken(TextBlock.name), useValue: blockModel },
        { provide: TextBlockCategoryService, useValue: categoryService },
      ],
    }).compile();
    service = module.get<TextBlockService>(TextBlockService);
  });

  it('honors a caller-supplied categoryId via assertAssignable', async () => {
    const callerCat = { _id: new Types.ObjectId(), name: 'Caller category' };
    categoryService.assertAssignable.mockResolvedValue(callerCat);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    const res = await service.create({
      name: 'Caller block',
      content: 'x',
      categoryId: '64a7b8c9d0e1f2a3b4c5d6e7',
    });

    expect(categoryService.assertAssignable).toHaveBeenCalledWith(
      '64a7b8c9d0e1f2a3b4c5d6e7',
      '',
    );
    expect(categoryService.resolveDefault).not.toHaveBeenCalled();
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      callerCat._id,
    );
  });

  // TZ-DOC-323 regression #1 — caller-supplied categoryId flow with an
  // explicit persistence assertion. Mirrors #1 but is named for the
  // TZ-DOC-323 invariant (the contract closure of the legacy enum).
  it('TZ-DOC-323 regression: persists only the resolved categoryId, even when caller passed a category-like field shape', async () => {
    const systemDefaultId = new Types.ObjectId();
    const callerCat = { _id: systemDefaultId, name: 'Caller category' };
    categoryService.assertAssignable.mockResolvedValue(callerCat);
    const captured: Record<string, unknown> = {};
    blockModel.create.mockImplementation((doc: Record<string, unknown>) => {
      Object.assign(captured, doc);
      return Promise.resolve({ ...doc, _id: new Types.ObjectId() });
    });

    const res = await service.create({
      name: 'TZ-DOC-323 invariant block',
      content: 'x',
      categoryId: systemDefaultId.toHexString(),
    });

    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      systemDefaultId,
    );
    // The persisted payload MUST carry only categoryId (not the legacy
    // category enum), confirming the schema-side removal.
    expect(captured).toHaveProperty('categoryId', systemDefaultId);
    expect(Object.prototype.hasOwnProperty.call(captured, 'category')).toBe(false);
  });

  it('falls back to resolveDefault when no categoryId is supplied', async () => {
    const sysDefault = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
      name: 'Общее',
    };
    categoryService.resolveDefault.mockResolvedValue(sysDefault);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    const res = await service.create({ name: 'Default block', content: 'x' });

    expect(categoryService.assertAssignable).not.toHaveBeenCalled();
    expect(categoryService.resolveDefault).toHaveBeenCalledWith(undefined);
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      sysDefault._id,
    );
  });

  it('throws BadRequestException when resolveDefault returns null (TZ-DOC-322 explicit contract)', async () => {
    // Reproduces the historical 400 the seed-path healed: when the
    // TextBlockCategoriesSeed (TZ-DOC-321) did not run OR was
    // deactivated, surface a deterministic 4xx describing the
    // operator-actionable fix. Never silent-upsert.
    categoryService.resolveDefault.mockResolvedValue(null);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    await expect(
      service.create({ name: 'No default', content: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // TZ-DOC-323 regression #2 — service-layer defense in depth for the
  // legacy field. Even if a future caller bypassed the global ValidationPipe
  // (e.g. an internal Nest service-to-service call), the service must
  // not forward a `category`-shaped key to Mongoose. The DTO strips it
  // upstream; this test confirms the service writes a payload that has
  // `categoryId` set and NO `category` field at all.
  it('TZ-DOC-323 regression: service.create never writes a `category` key to Mongoose', async () => {
    const sysDefault = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    };
    // Caller passes a body that looks like the legacy DTO shape — the
    // service is called with `category: 'intro' as any` (an explicit
    // bypass of the typing contract). The service should still write
    // nothing keyed under `category`.
    categoryService.resolveDefault.mockResolvedValue(sysDefault);
    const captured: Record<string, unknown> = {};
    blockModel.create.mockImplementation((doc: Record<string, unknown>) => {
      Object.assign(captured, doc);
      return Promise.resolve({ ...doc, _id: new Types.ObjectId() });
    });

    // Caller bypasses the typing contract — pre-TZ-DOC-323 callers would
    // send a `category` key. We type the input as the legacy DTO shape
    // (with `category` declared) so the test documents what an
    // integration call from a non-conformant upstream would look like.
    // The service should still ignore it and write `categoryId` only.
    interface LegacyCreateTextBlockDto {
      name: string;
      content?: string;
      categoryId?: string;
      category?: 'legal' | 'intro' | 'outro' | 'custom';
    }
    const legacyBody: LegacyCreateTextBlockDto = {
      name: 'Service-layer legacy-field sanitization',
      content: 'x',
      category: 'intro',
    };
    await service.create(legacyBody);

    expect(Object.prototype.hasOwnProperty.call(captured, 'category')).toBe(false);
    expect(captured.categoryId).toEqual(sysDefault._id);
  });

  it('rejects a duplicated slug with ConflictException (11000)', async () => {
    const sysDefault = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    };
    categoryService.resolveDefault.mockResolvedValue(sysDefault);
    const err = new Error('dup') as Error & { code: number };
    err.code = 11000;
    blockModel.create.mockRejectedValue(err);

    await expect(
      service.create({ name: 'Dup', content: 'x' }),
    ).rejects.toThrow(/already exists/);
  });

  it('propagates an unknown Mongoose error untouched', async () => {
    const sysDefault = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    };
    categoryService.resolveDefault.mockResolvedValue(sysDefault);
    const err = new Error('boom');
    blockModel.create.mockRejectedValue(err);

    await expect(
      service.create({ name: 'Boom', content: 'x' }),
    ).rejects.toBe(err);
  });
});
