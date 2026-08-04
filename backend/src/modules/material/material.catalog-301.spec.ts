import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';

function query<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function buildService() {
  const materialModel = {
    create: jest.fn().mockResolvedValue({}),
    findById: jest.fn(),
  } as any;
  const categoryModel = { findById: jest.fn() } as any;
  const counter = { next: jest.fn() } as any;
  return {
    service: new MaterialService(materialModel, categoryModel, counter),
    materialModel,
  };
}

describe('TZ-CATALOG-301 Material fields', () => {
  it('passes all catalog fields through create', async () => {
    const { service, materialModel } = buildService();

    await service.create({
      name: 'Лист Ст3',
      unit: 'кг',
      materialKind: 'raw',
      assortment: 'Лист',
      standardRef: 'ГОСТ 19903-2015',
      materialGrade: 'Ст3',
      weightKg: 12.5,
    });

    expect(materialModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        materialKind: 'raw',
        assortment: 'Лист',
        standardRef: 'ГОСТ 19903-2015',
        materialGrade: 'Ст3',
        weightKg: 12.5,
      }),
    );
  });

  it('accepts valid catalog DTO values', async () => {
    const errors = await validate(
      plainToInstance(CreateMaterialDto, {
        name: 'Покупной насос',
        unit: 'шт',
        materialKind: 'purchased',
        weightKg: 1.5,
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it('rejects an unknown materialKind and negative weightKg', async () => {
    const errors = await validate(
      plainToInstance(CreateMaterialDto, {
        name: 'Некорректная позиция',
        unit: 'шт',
        materialKind: 'unknown',
        weightKg: -1,
      }),
    );

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['materialKind', 'weightKg']),
    );
  });
});
