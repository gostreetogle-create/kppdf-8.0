import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TextBlockService } from './text-block.service';
import { TextBlock } from './text-block.schema';
import { TextBlockCategoryService } from '../text-block-category/text-block-category.service';

/**
 * TZ-DOC-322 — text-block categoryId resolution contract (post TZ-DOC-321
 * seed wire-up, post TZ-DOC-320 ladder removal).
 *
 * The two paths verified here (also exercised by the
 * test/e2e/text-blocks.e2e-spec.ts suite + the boot assertion
 * test/e2e/text-block-category-seed-init.e2e-spec.ts):
 *
 *  1. Caller-supplied `categoryId` is honored via `assertAssignable`.
 *  2. No `categoryId` → `resolveDefault(organizationId)`. Empty result
 *     surfaces a deterministic 4xx BadRequestException with a message
 *     that names the operator action (AppModule-wired seed) — NOT a
 *     silent self-heal via the TZ-DOC-320 ladder.
 *  3. The shared `isDuplicateSlug(11000) → ConflictException` and
 *     Mongoose-error-propagation paths stay unchanged.
 *
 * Removed in TZ-DOC-322:
 *  - `LEGACY_CATEGORY_SLUG` ladder (legal|legal, intro|intro, ...). The
 *    legacy enum still flows through `dto.category` and is persisted on
 *    the schema's `category` field for backward compat (TZ-DOC-318
 *    successor plans to remove it), but its value no longer drives
 *    `categoryId` resolution.
 *  - `ensureSystemDefault()` lazy upsert of «Общее». The seed is now
 *    wired (TZ-DOC-321), so silent auto-heal is both redundant and
 *    operationally misleading.
 */
describe('TextBlockService (TZ-DOC-322)', () => {
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
    ).rejects.toMatchObject({
      // NestJS BadRequestException has status 400; we don't pin the
      // exact message here so future copy-edits don't break the test.
      status: 400,
    });
  });

  it('persists legacy category enum on the schema without affecting categoryId resolution', async () => {
    // The legacy `dto.category` enum ('legal'|'intro'|'outro'|'custom')
    // is persisted on the doc for backward compat (TZ-DOC-318 successor).
    // It does NOT drive categoryId — that comes exclusively from
    // assertAssignable or resolveDefault.
    const sysDefault = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    };
    categoryService.resolveDefault.mockResolvedValue(sysDefault);
    const captured: Record<string, unknown> = {};
    blockModel.create.mockImplementation((doc: Record<string, unknown>) => {
      Object.assign(captured, doc);
      return Promise.resolve({ ...doc, _id: new Types.ObjectId() });
    });

    await service.create({
      name: 'Legacy enum block',
      content: 'x',
      category: 'legal',
    });

    expect(captured.category).toBe('legal');
    expect(captured.categoryId).toEqual(sysDefault._id);
    // Service-level isActive/legit assertions: no slug-map lookup,
    // no direct TextBlockCategory model access (the second
    // @InjectModel from TZ-DOC-320 was removed).
    expect(categoryService.resolveDefault).toHaveBeenCalledTimes(1);
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
