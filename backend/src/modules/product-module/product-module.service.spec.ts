import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductModuleService, UpsertProductModuleDto, MaterialInModuleDto } from './product-module.service';

const MATERIAL_ID = new Types.ObjectId().toString();

function query<T>(value: T) {
  return {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function serviceWith(materials: unknown[]) {
  const model = {
    create: jest.fn().mockResolvedValue({ materials }),
    findById: jest.fn(),
  } as any;
  const productModel = {} as any;
  const materialModel = {
    find: jest.fn().mockReturnValue(query(materials)),
  } as any;
  return {
    service: new ProductModuleService(model, productModel, materialModel),
    model,
    materialModel,
  };
}

function dto(overrideDimensions?: MaterialInModuleDto['overrideDimensions']): UpsertProductModuleDto {
  return {
    name: 'Тестовый модуль',
    materials: [
      {
        materialId: MATERIAL_ID,
        quantity: 1,
        overrideDimensions,
      },
    ],
  };
}

describe('ProductModuleService (TZ-MATERIALS-309)', () => {
  it('rejects an override for an immutable length on create', async () => {
    const { service, model } = serviceWith([
      {
        _id: new Types.ObjectId(MATERIAL_ID),
        name: 'Лист',
        dimensions: [{ type: 'length', value: 1000, isImmutable: true }],
      },
    ]);

    await expect(service.create(dto({ length: 900 }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.create).not.toHaveBeenCalled();
  });

  it('allows an override when the matching material dimension is mutable', async () => {
    const { service, model } = serviceWith([
      {
        _id: new Types.ObjectId(MATERIAL_ID),
        name: 'Лист',
        dimensions: [{ type: 'length', value: 1000, isImmutable: false }],
      },
    ]);

    await expect(service.create(dto({ length: 900 }))).resolves.toBeDefined();
    expect(model.create).toHaveBeenCalledTimes(1);
  });

  it('allows an override when the material has no matching immutable dimension', async () => {
    const { service, model } = serviceWith([
      {
        _id: new Types.ObjectId(MATERIAL_ID),
        name: 'Лист',
        dimensions: [{ type: 'width', value: 500, isImmutable: true }],
      },
    ]);

    await expect(service.create(dto({ length: 900 }))).resolves.toBeDefined();
    expect(model.create).toHaveBeenCalledTimes(1);
  });

  it('rejects an override for an immutable width on update before save', async () => {
    const save = jest.fn();
    const doc = {
      _id: new Types.ObjectId(),
      save,
      workTypes: [],
      materials: [],
    };
    const { service, materialModel } = serviceWith([
      {
        _id: new Types.ObjectId(MATERIAL_ID),
        name: 'Профиль',
        dimensions: [{ type: 'width', value: 50, isImmutable: true }],
      },
    ]);
    const model = (service as unknown as { model: { findById: jest.Mock } }).model;
    model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });

    await expect(service.update('507f1f77bcf86cd799439011', dto({ width: 40 }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(save).not.toHaveBeenCalled();
    expect(materialModel.find).toHaveBeenCalledTimes(1);
  });

  it('rejects a module row whose material cannot be found', async () => {
    const { service, model } = serviceWith([]);

    await expect(service.create(dto({ height: 20 }))).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });
});
