import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TextBlockCategoryService } from './text-block-category.service';
import { TextBlockCategory, SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG } from './text-block-category.schema';
import { TextBlock } from '../text-block/text-block.schema';

/**
 * TZ-DOC-315 — Unit spec for TextBlockCategoryService.
 *
 * Uses an in-memory fake `@InjectModel` (resolveDefault, findById,
 * findOne, countDocuments, create, deleteOne, doc.save) so the suite stays
 * hermetic — no Mongo dependency. Covers the user's core acceptance
 * criteria: default-resolution order, assignability contract, foreign-org
 * rejection, system/in_use delete protection, and slug uniqueness.
 */

type MockDoc = Record<string, unknown> & { _id: Types.ObjectId; save: jest.Mock; organizationId?: Types.ObjectId | null };

class FakeModel {
  public store: Map<string, MockDoc> = new Map();

  // generic per-test reset
  reset() {
    this.store.clear();
  }

  makeDoc(partial: Record<string, unknown>): MockDoc {
    const _id = (partial._id as Types.ObjectId) ?? new Types.ObjectId();
    const doc: MockDoc = {
      ...partial,
      _id,
      save: jest.fn(async () => doc),
    };
    this.store.set(String(_id), doc);
    return doc;
  }

  // Model API ── returns whatever the test sets up
  findOne = jest.fn((query: Record<string, unknown>) => {
    const matches = Array.from(this.store.values()).filter((d) => matchesQuery(d, query));
    type Chainable = { sort: jest.Mock; exec: jest.Mock };
    const obj: Chainable = {
      sort: jest.fn(),
      exec: jest.fn(async () => matches[0] ?? null),
    };
    obj.sort.mockImplementation(() => obj);
    return obj;
  });

  findById = jest.fn((id: string) => ({
    exec: jest.fn(async () => {
      const doc = this.store.get(String(id));
      if (!doc) return null;
      return doc;
    }),
  }));

  countDocuments = jest.fn((query: Record<string, unknown>) => {
    const matches = Array.from(this.store.values()).filter((d) => matchesQuery(d, query));
    return { exec: jest.fn(async () => matches.length) };
  });

  create = jest.fn(async (doc: Record<string, unknown>) => {
    // Mimic unique index violation on dup (organizationId, slug).
    const dup = Array.from(this.store.values()).find((d) => {
      const sameOrg = String(d.organizationId ?? '') === String(doc.organizationId ?? '');
      const sameSlug = d.slug === doc.slug;
      return sameOrg && sameSlug;
    });
    if (dup) {
      const err = new Error('duplicate key');
      (err as { code?: number }).code = 11000;
      throw err;
    }
    return this.makeDoc(doc);
  });

  deleteOne = jest.fn((filter: Record<string, unknown>) => ({
    exec: jest.fn(async () => {
      const target = Array.from(this.store.values()).find((d) => matchesQuery(d, filter));
      if (target) this.store.delete(String(target._id));
      return { deletedCount: target ? 1 : 0 };
    }),
  }));

  find = jest.fn(() => ({
    sort: jest.fn(() => ({
      exec: jest.fn(async () => Array.from(this.store.values())),
    })),
  }));
}

function matchesQuery(doc: MockDoc, query: Record<string, unknown>): boolean {
  return Object.entries(query).every(([k, v]) => {
    if (v && typeof v === 'object' && '$exists' in v) {
      const present = doc[k] !== undefined;
      return v.$exists ? present : !present;
    }
    return doc[k] === v || String(doc[k]) === String(v);
  });
}

describe('TextBlockCategoryService (TZ-DOC-315)', () => {
  let service: TextBlockCategoryService;
  let blockModel: FakeModel;
  let categoryModel: FakeModel;

  beforeEach(async () => {
    blockModel = new FakeModel();
    categoryModel = new FakeModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TextBlockCategoryService,
        { provide: getModelToken(TextBlockCategory.name), useValue: categoryModel },
        { provide: getModelToken(TextBlock.name), useValue: blockModel },
      ],
    }).compile();

    service = moduleRef.get(TextBlockCategoryService);
    categoryModel.create.mockClear();
    categoryModel.findOne.mockClear();
    categoryModel.findById.mockClear();
    blockModel.countDocuments.mockClear();
  });

  // ──────────────────────────────────────────────────────────────────────
  // resolveDefault order
  // ──────────────────────────────────────────────────────────────────────
  describe('resolveDefault', () => {
    it('returns org-scoped `isDefault: true` category when present', async () => {
      const orgId = new Types.ObjectId();
      const orgDefault = categoryModel.makeDoc({
        name: 'Реквизиты',
        slug: 'rekvizity',
        isActive: true,
        isDefault: true,
        isSystem: false,
        organizationId: orgId,
      });
      categoryModel.makeDoc({
        name: 'Общее',
        slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
        isActive: true,
        isDefault: true,
        isSystem: true,
        organizationId: undefined,
      });

      const result = await service.resolveDefault(String(orgId));
      expect(result?._id).toEqual(orgDefault._id);
    });

    it('falls back to system «Общее» when org has no default', async () => {
      const orgId = new Types.ObjectId();
      const systemDefault = categoryModel.makeDoc({
        name: 'Общее',
        slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
        isActive: true,
        isDefault: true,
        isSystem: true,
        organizationId: undefined,
      });

      const result = await service.resolveDefault(String(orgId));
      expect(result?._id).toEqual(systemDefault._id);
    });

    it('returns null when neither org nor system default exists', async () => {
      const result = await service.resolveDefault(String(new Types.ObjectId()));
      expect(result).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // assertAssignable
  // ──────────────────────────────────────────────────────────────────────
  describe('assertAssignable', () => {
    it('rejects invalid ObjectId with BadRequestException', async () => {
      await expect(service.assertAssignable('not-an-id', String(new Types.ObjectId()))).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns NotFoundException for missing category', async () => {
      await expect(
        service.assertAssignable(String(new Types.ObjectId()), String(new Types.ObjectId())),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects inactive category with BadRequestException', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Архив',
        slug: 'archived',
        isActive: false,
        isDefault: false,
        organizationId: new Types.ObjectId(),
      });
      await expect(
        service.assertAssignable(String(cat._id), String(cat.organizationId)),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects category from a different organization', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Org B',
        slug: 'org-b-cat',
        isActive: true,
        isDefault: false,
        organizationId: new Types.ObjectId(),
      });
      const otherOrgId = new Types.ObjectId();
      await expect(
        service.assertAssignable(String(cat._id), String(otherOrgId)),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('accepts system categories for any org', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Общее',
        slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
        isActive: true,
        isDefault: true,
        isSystem: true,
        organizationId: undefined,
      });
      const result = await service.assertAssignable(String(cat._id), String(new Types.ObjectId()));
      expect(result._id).toEqual(cat._id);
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // create / remove protection
  // ──────────────────────────────────────────────────────────────────────
  describe('create uniqueness', () => {
    it('throws ConflictException on duplicate slug in same org', async () => {
      const orgId = new Types.ObjectId();
      // Pre-populate so service.findOne finds it BEFORE create is called.
      categoryModel.makeDoc({
        name: 'Первая',
        slug: 'one',
        isActive: true,
        isDefault: false,
        organizationId: orgId,
      });

      await expect(
        service.create({ name: 'Вторая', slug: 'one' } as never, String(orgId)),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove protection', () => {
    it('refuses to delete isSystem category with ConflictException', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Общее',
        slug: SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG,
        isActive: true,
        isDefault: true,
        isSystem: true,
        organizationId: undefined,
      });
      await expect(service.remove(String(cat._id), String(new Types.ObjectId()))).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('refuses to delete a category referenced by text blocks (Conflict + count)', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Реквизиты',
        slug: 'rekvizity',
        isActive: true,
        isDefault: false,
        isSystem: false,
        organizationId: new Types.ObjectId(),
      });
      // Any reference count > 0 is enough.
      blockModel.countDocuments.mockReturnValueOnce({ exec: jest.fn(async () => 3) });

      await expect(service.remove(String(cat._id), String(cat.organizationId))).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('refuses to delete a category owned by a different org (Forbidden)', async () => {
      const cat = categoryModel.makeDoc({
        name: 'Org B only',
        slug: 'org-b-only',
        isActive: true,
        isDefault: false,
        isSystem: false,
        organizationId: new Types.ObjectId(),
      });
      const callerOrg = String(new Types.ObjectId());
      await expect(service.remove(String(cat._id), callerOrg)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
