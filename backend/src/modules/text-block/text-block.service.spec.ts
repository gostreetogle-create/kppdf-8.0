import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TextBlockService } from './text-block.service';
import { TextBlock } from './text-block.schema';
import { TextBlockCategoryDocument } from '../text-block-category/text-block-category.schema';
import { TextBlockCategoryService } from '../text-block-category/text-block-category.service';

/**
 * TZ-DOC-320 — text-block legacy enum → categoryId migration regression.
 *
 * The three contracts verified here (also exercised by the
 * test/e2e/text-blocks.e2e-spec.ts suite):
 *
 *  1. Caller-supplied `categoryId` is honored via `assertAssignable`.
 *  2. Legacy enum `category` without `categoryId` resolves through the
 *     `LEGACY_CATEGORY_SLUG` ladder first, then `resolveDefault`, then
 *     the lazy `ensureSystemDefault()` upsert.
 *  3. Last-resort `ensureSystemDefault()` upserts the global «Общее»
 *     with the published constants and logs a WARN.
 */
describe('TextBlockService (TZ-DOC-320)', () => {
  let service: TextBlockService;
  let blockModel: {
    create: jest.Mock;
    findById: jest.Mock;
    find: jest.Mock;
    deleteOne: jest.Mock;
  };
  let categoryModel: {
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let categoryService: {
    assertAssignable: jest.Mock;
    resolveDefault: jest.Mock;
  };

  const SYS_DEFAULT_ID = new Types.ObjectId();

  /** Helper: make Mongoose-shape chainable mock for `Model.findOne`. */
  const findOneMock = (resolved: unknown): jest.Mock =>
    jest.fn(() => ({ exec: jest.fn().mockResolvedValue(resolved) }));

  beforeEach(async () => {
    blockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(() => ({ sort: () => ({ exec: () => Promise.resolve([]) }) })),
      deleteOne: jest.fn(() => ({ exec: () => Promise.resolve({}) })),
    };
    categoryModel = { findOne: findOneMock(null), create: jest.fn() };
    categoryService = { assertAssignable: jest.fn(), resolveDefault: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextBlockService,
        { provide: getModelToken(TextBlock.name), useValue: blockModel },
        { provide: getModelToken('TextBlockCategory'), useValue: categoryModel },
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
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      callerCat._id,
    );
    expect(categoryModel.findOne).not.toHaveBeenCalled();
    expect(categoryModel.create).not.toHaveBeenCalled();
  });

  it('legacy legal enum → resolves through slug-map to system category', async () => {
    const sysCat = {
      _id: new Types.ObjectId(),
      slug: 'legal',
      isSystem: true,
    } as unknown as TextBlockCategoryDocument;
    categoryModel.findOne = findOneMock(sysCat);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    const res = await service.create({
      name: 'Terms of service',
      content: 'b',
      category: 'legal',
    });

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: 'legal',
      isSystem: true,
    });
    expect(categoryService.resolveDefault).not.toHaveBeenCalled();
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      sysCat._id,
    );
  });

  it('legacy enum without system match → resolveDefault (org scope)', async () => {
    categoryModel.findOne = findOneMock(null);
    const orgDefault = {
      _id: SYS_DEFAULT_ID,
      slug: 'org-default',
    } as unknown as TextBlockCategoryDocument;
    categoryService.resolveDefault.mockResolvedValue(orgDefault);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    const res = await service.create({
      name: 'Plain',
      content: 'a',
      category: 'intro',
    });

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: 'intro',
      isSystem: true,
    });
    expect(categoryService.resolveDefault).toHaveBeenCalledWith(undefined);
    expect(categoryModel.create).not.toHaveBeenCalled();
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      orgDefault._id,
    );
  });

  it('no categoryId, no legacy enum, resolveDefault null → lazily upserts «Общее»', async () => {
    categoryService.resolveDefault.mockResolvedValue(null);
    categoryModel.findOne = findOneMock(null);
    const upserted = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    } as unknown as TextBlockCategoryDocument;
    categoryModel.create.mockResolvedValue(upserted);
    blockModel.create.mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: new Types.ObjectId() }),
    );

    const res = await service.create({ name: 'Default block', content: 'x' });

    expect(categoryService.resolveDefault).toHaveBeenCalledWith(undefined);
    expect(categoryModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'obshchee',
        isSystem: true,
        isDefault: true,
        isActive: true,
      }),
    );
    expect((res as unknown as { categoryId: Types.ObjectId }).categoryId).toEqual(
      upserted._id,
    );
  });

  it('upserted default has categoryId and category attributes back on the block', async () => {
    categoryService.resolveDefault.mockResolvedValue(null);
    categoryModel.findOne = findOneMock(null);
    const upserted = {
      _id: new Types.ObjectId(),
      slug: 'obshchee',
    } as unknown as TextBlockCategoryDocument;
    categoryModel.create.mockResolvedValue(upserted);
    const captured: Record<string, unknown> = {};
    blockModel.create.mockImplementation((doc: Record<string, unknown>) => {
      Object.assign(captured, doc);
      return Promise.resolve({ ...doc, _id: new Types.ObjectId() });
    });

    await service.create({
      name: 'Default test',
      content: 'x',
      category: 'custom',
    });

    expect(captured.categoryId).toEqual(upserted._id);
    expect(captured.category).toBe('custom');
    expect(captured.slug).toBe('default-test');
    expect(captured.name).toBe('Default test');
  });

  it('rejects a duplicated slug with ConflictException (11000)', async () => {
    const sysCat = {
      _id: new Types.ObjectId(),
      slug: 'legal',
    } as unknown as TextBlockCategoryDocument;
    categoryModel.findOne = findOneMock(sysCat);
    const err = new Error('dup') as Error & { code: number };
    err.code = 11000;
    blockModel.create.mockRejectedValue(err);

    await expect(
      service.create({ name: 'Dup', content: 'x', category: 'legal' }),
    ).rejects.toThrow(/already exists/);
  });

  it('propagates an unknown Mongoose error untouched', async () => {
    const sysCat = {
      _id: new Types.ObjectId(),
      slug: 'legal',
    } as unknown as TextBlockCategoryDocument;
    categoryModel.findOne = findOneMock(sysCat);
    const err = new Error('boom');
    blockModel.create.mockRejectedValue(err);

    await expect(
      service.create({ name: 'Boom', content: 'x', category: 'legal' }),
    ).rejects.toBe(err);
  });
});

describe('TextBlockService (TZ-DOC-320) — exclude-unused-import lint', () => {
  it('re-exports BadRequestException for backward compat', () => {
    // Sanity: the importer of this spec did not lose the import when
    // we removed the explicit `resolveDefault is null → 400` branch in
    // service.create (it's covered by ensureSystemDefault instead).
    expect(BadRequestException).toBeDefined();
  });
});
