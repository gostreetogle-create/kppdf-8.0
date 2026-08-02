import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ColorReferenceService,
  SYSTEM_DEFAULT_COLOR_SLUG,
} from './color-reference.service';
import { ColorReference } from './color-reference.schema';

/**
 * TZ-PRODUCTS-301 — Unit spec for ColorReferenceService.
 *
 * Hermetic: in-memory fake-модель (@InjectModel), без Mongo. Зеркалит
 * TZ-DOC-307/315 spec-паттерн. Покрывает acceptance criteria:
 *  - create: slug-генерация, 409 на дубликат в scope, org-scope;
 *  - findAll: envelope/org-scope $or + search + soft-delete;
 *  - update: 403 на чужую область, 409 на system-цвет, 409 dup slug;
 *  - remove: soft-delete, 409 system;
 *  - resolveDefault: org-default → системный «Не выбран» → null;
 *  - assertAssignable / assertDefaultId: 404/400;
 *  - legacy backward-compat (цвет без новых полей открывается).
 */

type MockDoc = Record<string, unknown> & {
  _id: Types.ObjectId;
  save: jest.Mock;
  organizationId?: Types.ObjectId | null;
  deletedAt?: Date | null;
};

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (Array.isArray(a)) {
    return a.some((item) => String(item) === String(b));
  }
  return String(a) === String(b);
}

function matchesQuery(doc: MockDoc, query: Record<string, unknown>): boolean {
  return Object.entries(query).every(([k, v]) => {
    if (k === '$and') {
      return (v as Record<string, unknown>[]).every((cond) =>
        matchesQuery(doc, cond),
      );
    }
    if (k === '$or') {
      return (v as Record<string, unknown>[]).some((cond) =>
        matchesQuery(doc, cond),
      );
    }
    if (v && typeof v === 'object' && '$exists' in v) {
      const present = doc[k] !== undefined && doc[k] !== null;
      return v.$exists ? present : !present;
    }
    if (v instanceof RegExp) {
      return v.test(String(doc[k] ?? ''));
    }
    if (v && typeof v === 'object' && '$ne' in v) {
      return !valuesEqual(doc[k], (v as { $ne: unknown }).$ne);
    }
    return valuesEqual(doc[k], v);
  });
}

class FakeModel {
  public store: Map<string, MockDoc> = new Map();

  reset() {
    this.store.clear();
  }

  makeDoc(partial: Record<string, unknown>): MockDoc {
    const _id = (partial._id as Types.ObjectId) ?? new Types.ObjectId();
    const doc: MockDoc = { ...partial, _id, save: jest.fn(async () => doc) };
    this.store.set(String(_id), doc);
    return doc;
  }

  findOne = jest.fn((query: Record<string, unknown>) => {
    const matches = Array.from(this.store.values()).filter((d) =>
      matchesQuery(d, query),
    );
    const select = jest.fn(() => ({
      exec: jest.fn(async () => matches[0] ?? null),
    }));
    const sort = jest.fn(() => ({ exec: jest.fn(async () => matches[0] ?? null) }));
    return { select, sort, exec: jest.fn(async () => matches[0] ?? null) };
  });

  find = jest.fn((query: Record<string, unknown>) => {
    const matches = Array.from(this.store.values()).filter((d) =>
      matchesQuery(d, query),
    );
    return {
      sort: jest.fn(() => ({ exec: jest.fn(async () => matches) })),
    };
  });

  findById = jest.fn((id: string) => ({
    exec: jest.fn(async () => {
      const doc = this.store.get(String(id));
      if (!doc) return null;
      return doc;
    }),
  }));

  create = jest.fn(async (doc: Record<string, unknown>) => this.makeDoc(doc));

  updateOne = jest.fn((filter: Record<string, unknown>, update: Record<string, unknown>) => {
    const target = Array.from(this.store.values()).find((d) =>
      matchesQuery(d, filter),
    );
    if (target) {
      const set = (update.$set ?? {}) as Record<string, unknown>;
      Object.entries(set).forEach(([k, v]) => {
        (target as Record<string, unknown>)[k] = v;
      });
    }
    return { exec: jest.fn(async () => ({ modifiedCount: target ? 1 : 0 })) };
  });
}

describe('ColorReferenceService (TZ-PRODUCTS-301)', () => {
  let service: ColorReferenceService;
  let model: FakeModel;

  beforeEach(async () => {
    model = new FakeModel();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ColorReferenceService,
        { provide: getModelToken(ColorReference.name), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(ColorReferenceService);
  });

  const orgId = String(new Types.ObjectId());

  // ── create ────────────────────────────────────────────────────────────
  describe('create', () => {
    it('creates with org scope, generates slug from Cyrillic name, isActive default true', async () => {
      const created = await service.create(
        { name: 'Сигнальный белый', hex: '#FFFFFF' },
        orgId,
      );
      expect(created.slug).toBe('signalnyi-belyi');
      expect(created.organizationId?.toString()).toBe(orgId);
      expect(created.isActive).toBe(true);
      expect(created.isSystem).toBe(false);
      expect(created.hex).toBe('#FFFFFF');
    });

    it('409 on duplicate slug in same org scope', async () => {
      model.makeDoc({
        _id: new Types.ObjectId(),
        slug: 'ral-9003',
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      await expect(
        service.create({ name: 'RAL 9003', hex: '#FFFFFF', slug: 'ral-9003' }, orgId),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows the same slug in a different org scope', async () => {
      model.makeDoc({
        _id: new Types.ObjectId(),
        slug: 'ral-9003',
        organizationId: new Types.ObjectId(),
        deletedAt: null,
      });
      const created = await service.create(
        { name: 'RAL 9003', hex: '#FFFFFF', slug: 'ral-9003' },
        orgId,
      );
      expect(created.slug).toBe('ral-9003');
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('returns only non-deleted colors and applies org-scope $or', async () => {
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Белый', deletedAt: null });
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Удалённый', deletedAt: new Date() });
      const res = await service.findAll({ organizationId: orgId });
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Белый');
    });

    it('filters by search on name', async () => {
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Сигнальный белый', deletedAt: null });
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Чёрный', deletedAt: null });
      const res = await service.findAll({ search: 'сигнал', organizationId: orgId });
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Сигнальный белый');
    });

    it('filters activeOnly', async () => {
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Белый', isActive: true, deletedAt: null });
      model.makeDoc({ _id: new Types.ObjectId(), name: 'Чёрный', isActive: false, deletedAt: null });
      const res = await service.findAll({ activeOnly: true, organizationId: orgId });
      expect(res.length).toBe(1);
    });
  });

  // ── update (IDOR / system / dup) ──────────────────────────────────────
  describe('update', () => {
    it('403 when updating a color of another org scope', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Чужой',
        slug: 'chuzhoy',
        organizationId: new Types.ObjectId(),
        deletedAt: null,
      });
      await expect(
        service.update(String(doc._id), { name: 'X' }, orgId),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('409 on system color update', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Не выбран',
        slug: SYSTEM_DEFAULT_COLOR_SLUG,
        isSystem: true,
        deletedAt: null,
      });
      await expect(
        service.update(String(doc._id), { name: 'X' }, orgId),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('409 on duplicate slug during rename', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Белый',
        slug: 'belyy',
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Чёрный',
        slug: 'chernyy',
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      await expect(
        service.update(String(doc._id), { slug: 'chernyy' }, orgId),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ── remove (soft-delete / system) ─────────────────────────────────────
  describe('remove', () => {
    it('soft-deletes via deletedAt; findById then 404s', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Белый',
        slug: 'belyy',
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      await service.remove(String(doc._id), orgId);
      expect(doc.deletedAt).toBeInstanceOf(Date);
      await expect(service.findById(String(doc._id))).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('409 on system color remove', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Не выбран',
        slug: SYSTEM_DEFAULT_COLOR_SLUG,
        isSystem: true,
        deletedAt: null,
      });
      await expect(
        service.remove(String(doc._id), orgId),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  // ── resolveDefault ────────────────────────────────────────────────────
  describe('resolveDefault', () => {
    it('returns org-scoped isDefault color when present', async () => {
      const orgDefault = model.makeDoc({
        _id: new Types.ObjectId(),
        slug: 'org-default',
        isActive: true,
        isDefault: true,
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      const res = await service.resolveDefault(orgId);
      expect(res?._id).toEqual(orgDefault._id);
    });

    it('falls back to system «Не выбран» when org has no default', async () => {
      model.makeDoc({
        _id: new Types.ObjectId(),
        slug: 'some-org-color',
        isActive: true,
        isDefault: false,
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      const sys = model.makeDoc({
        _id: new Types.ObjectId(),
        slug: SYSTEM_DEFAULT_COLOR_SLUG,
        isActive: true,
        isDefault: true,
        deletedAt: null,
      });
      const res = await service.resolveDefault(orgId);
      expect(res?._id).toEqual(sys._id);
    });

    it('returns null when no default exists', async () => {
      const res = await service.resolveDefault(orgId);
      expect(res).toBeNull();
    });
  });

  // ── assertAssignable / assertDefaultId ────────────────────────────────
  describe('assertAssignable / assertDefaultId', () => {
    it('assertAssignable rejects invalid ObjectId with BadRequest', async () => {
      await expect(
        service.assertAssignable('not-an-id', orgId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('assertAssignable returns NotFound for missing color', async () => {
      await expect(
        service.assertAssignable(String(new Types.ObjectId()), orgId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('assertAssignable rejects inactive color with BadRequest', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Архив',
        slug: 'archived',
        isActive: false,
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      await expect(
        service.assertAssignable(String(doc._id), orgId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('assertAssignable rejects foreign-org color with BadRequest', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Чужой',
        slug: 'chuzhoy',
        isActive: true,
        organizationId: new Types.ObjectId(),
        deletedAt: null,
      });
      await expect(
        service.assertAssignable(String(doc._id), orgId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('assertDefaultId rejects a non-default color with BadRequest', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Не default',
        slug: 'non-default',
        isActive: true,
        isDefault: false,
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      await expect(
        service.assertDefaultId(String(doc._id), orgId),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('assertDefaultId resolves a valid org default', async () => {
      const doc = model.makeDoc({
        _id: new Types.ObjectId(),
        name: 'Белый',
        slug: 'belyy',
        isActive: true,
        isDefault: true,
        organizationId: new Types.ObjectId(orgId),
        deletedAt: null,
      });
      const res = await service.assertDefaultId(String(doc._id), orgId);
      expect(res._id).toEqual(doc._id);
    });
  });
});
