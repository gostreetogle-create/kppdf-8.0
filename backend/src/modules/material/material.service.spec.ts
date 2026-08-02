import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MaterialService } from './material.service';
import type { CreateMaterialDto } from './dto/create-material.dto';
import type { UpdateMaterialDto } from './dto/update-material.dto';

/**
 * TZ-MATERIALS-303 — MaterialService unit spec (manual mocks, repository
 * convention — see `roles-admin.controller.spec.ts` / `users-admin.controller.spec.ts`).
 *
 * Verifies:
 * 1. `create` persists the user-supplied `sku` (the DTO now declares it —
 *    previously it was silently stripped by the whitelist → HTTP 400).
 * 2. A Mongo duplicate-key (E11000) on `create` is mapped to 409 Conflict
 *    (server-side uniqueness is the sparse unique index, not client code).
 * 3. The same E11000 mapping applies on `update` (doc.save()).
 * 4. Non-duplicate errors are re-thrown untouched.
 */

function buildService(opts: {
  create?: jest.Mock;
  findById?: jest.Mock;
  save?: jest.Mock;
  updateOne?: jest.Mock;
}) {
  const create = opts.create ?? jest.fn();
  const findById = opts.findById ?? jest.fn();
  const save = opts.save ?? jest.fn();
  const updateOne = opts.updateOne ?? jest.fn();
  const model = {
    create,
    findById,
    updateOne,
  } as any;
  const service = new MaterialService(model);
  return { service, create, findById, save, updateOne };
}

function dto(overrides: Partial<CreateMaterialDto> = {}): CreateMaterialDto {
  return {
    name: 'Стекло 4мм',
    unit: 'm2',
    ...overrides,
  } as CreateMaterialDto;
}

function doc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId().toString(),
    name: 'Стекло 4мм',
    unit: 'm2',
    save: jest.fn(),
    ...overrides,
  };
}

describe('MaterialService (TZ-MATERIALS-303)', () => {
  describe('create', () => {
    it('persists the user-supplied sku through the DTO', async () => {
      const { service, create } = buildService({
        create: jest.fn().mockResolvedValue(doc({ sku: 'M-0001' })),
      });
      const result = await service.create(dto({ sku: 'M-0001', article: 'STK-004' }));
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'M-0001', article: 'STK-004' }),
      );
      expect(result.sku).toBe('M-0001');
    });

    it('maps a Mongo duplicate-key (E11000) on create to 409 Conflict', async () => {
      const { service, create } = buildService({
        create: jest.fn().mockRejectedValue({ code: 11000, message: 'E11000 duplicate key' }),
      });
      await expect(service.create(dto({ sku: 'M-0001' }))).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(create).toHaveBeenCalledTimes(1);
    });

    it('re-throws non-duplicate errors untouched', async () => {
      const { service } = buildService({
        create: jest.fn().mockRejectedValue(new Error('network down')),
      });
      await expect(service.create(dto())).rejects.toThrow('network down');
    });
  });

  describe('update', () => {
    it('maps an E11000 raised by doc.save() to 409 Conflict', async () => {
      const save = jest.fn().mockRejectedValue({ code: 11000, message: 'E11000 duplicate key' });
      const { service } = buildService({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(doc({ save })),
        }),
      });
      const updateDto: UpdateMaterialDto = { sku: 'M-0001' };
      await expect(service.update('507f1f77bcf86cd799439011', updateDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('keeps 404 behavior for a missing document (no save attempted)', async () => {
      const { service, save } = buildService({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      await expect(
        service.update('507f1f77bcf86cd799439011', { sku: 'M-0001' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(save).not.toHaveBeenCalled();
    });
  });
});
