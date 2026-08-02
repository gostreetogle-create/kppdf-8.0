import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MaterialService } from './material.service';
import type { CreateMaterialDto } from './dto/create-material.dto';
import type { UpdateMaterialDto } from './dto/update-material.dto';

const CATEGORY_ID = new Types.ObjectId().toString();

function query<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function buildService(opts: {
  create?: jest.Mock;
  findById?: jest.Mock;
  updateOne?: jest.Mock;
  categoryFindById?: jest.Mock;
  counterNext?: jest.Mock;
}) {
  const create = opts.create ?? jest.fn();
  const findById = opts.findById ?? jest.fn();
  const updateOne = opts.updateOne ?? jest.fn();
  const categoryFindById = opts.categoryFindById ?? jest.fn();
  const counterNext = opts.counterNext ?? jest.fn();
  const model = { create, findById, updateOne } as any;
  const categoryModel = { findById: categoryFindById } as any;
  const counter = { next: counterNext } as any;
  const service = new MaterialService(model, categoryModel, counter);
  return { service, create, findById, updateOne, categoryFindById, counterNext };
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

describe('MaterialService (TZ-MATERIALS-303/307)', () => {
  describe('create', () => {
    it('persists the user-supplied sku without generating another code', async () => {
      const { service, create, categoryFindById, counterNext } = buildService({
        create: jest.fn().mockResolvedValue(doc({ sku: 'M-0001' })),
      });
      const result = await service.create(dto({ sku: 'M-0001', article: 'STK-004' }));

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'M-0001', article: 'STK-004' }),
      );
      expect(categoryFindById).not.toHaveBeenCalled();
      expect(counterNext).not.toHaveBeenCalled();
      expect(result.sku).toBe('M-0001');
    });

    it('generates a server-side SKU from the material category when sku is omitted', async () => {
      const { service, create, categoryFindById, counterNext } = buildService({
        categoryFindById: jest.fn().mockReturnValue(
          query({ _id: CATEGORY_ID, name: 'Листовые материалы', skuPrefix: 'SHEET' }),
        ),
        counterNext: jest.fn().mockResolvedValue('SHEET-2026-001'),
        create: jest.fn().mockResolvedValue(doc({ sku: 'SHEET-2026-001' })),
      });

      await service.create(dto({ categoryId: CATEGORY_ID }));

      expect(categoryFindById).toHaveBeenCalledWith(CATEGORY_ID);
      expect(counterNext).toHaveBeenCalledWith('Material', 'SHEET');
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'SHEET-2026-001', categoryId: CATEGORY_ID }),
      );
    });

    it('rejects an unknown category before generating or creating a material', async () => {
      const { service, create, categoryFindById, counterNext } = buildService({
        categoryFindById: jest.fn().mockReturnValue(query(null)),
      });

      await expect(service.create(dto({ categoryId: CATEGORY_ID }))).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(counterNext).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
    });

    it('rejects a category without a SKU prefix before creating a material', async () => {
      const { service, create, categoryFindById, counterNext } = buildService({
        categoryFindById: jest.fn().mockReturnValue(
          query({ _id: CATEGORY_ID, name: 'Без кода', skuPrefix: '' }),
        ),
      });

      await expect(service.create(dto({ categoryId: CATEGORY_ID }))).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(counterNext).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
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
      const { service, findById } = buildService({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.update('507f1f77bcf86cd799439011', { sku: 'M-0001' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(findById).toHaveBeenCalled();
    });
  });
});
