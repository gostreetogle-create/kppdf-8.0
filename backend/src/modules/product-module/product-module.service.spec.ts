import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductModuleService, UpsertProductModuleDto, MaterialInModuleDto } from './product-module.service';

const MATERIAL_ID = new Types.ObjectId().toString();
function query<T>(value: T) {
  return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(value) };
}
function graphStub() {
  return { assertNoCycleAndDepth: jest.fn().mockResolvedValue(undefined) };
}
function serviceWith(materials: unknown[]) {
  const model = {
    create: jest.fn().mockResolvedValue({ materials: [] }),
    findById: jest.fn(),
  } as any;
  const productModel = {} as any;
  const materialModel = { find: jest.fn().mockReturnValue(query(materials)) } as any;
  const compositionLines = {
    toStoredLine: jest.fn((dto: any, existing?: any) => ({
      _id: existing?._id ?? new Types.ObjectId(),
      lineType: dto.lineType ?? existing?.lineType ?? 'material',
      refId: new Types.ObjectId(String(dto.refId ?? existing?.refId ?? MATERIAL_ID)),
      quantity: dto.quantity ?? existing?.quantity ?? 1,
      sortOrder: dto.sortOrder ?? existing?.sortOrder ?? 0,
      unit: dto.unit ?? existing?.unit,
      overrideDimensions: dto.overrideDimensions ?? existing?.overrideDimensions,
      isPurchased: dto.isPurchased ?? existing?.isPurchased,
    })),
    validateReference: jest.fn().mockResolvedValue(undefined),
    upsertDeduplicated: jest.fn((_current: unknown[], incoming: unknown) => [incoming]),
    ensureLineLimit: jest.fn(),
    ensureNoDuplicateKeys: jest.fn(),
    dualRead: jest.fn((owner: { composition?: unknown[] }, legacy: unknown[]) =>
      owner.composition?.length ? owner.composition : legacy,
    ),
  };
  return {
    service: new ProductModuleService(model, productModel, materialModel, compositionLines as any, graphStub() as any, {
      previewModuleCost: jest.fn(),
    } as any),
    model,
    materialModel,
  };
}
function legacyMaterialsDto(overrideDimensions?: MaterialInModuleDto['overrideDimensions']): UpsertProductModuleDto {
  return { name: 'Тестовый модуль', article: 'MOD-TEST', materials: [{ materialId: MATERIAL_ID, quantity: 1, overrideDimensions }] };
}

describe('ProductModuleService (TZ-CATALOG-304 + TZ-MATERIALS-309)', () => {
  it('rejects a missing article before creating a module (TZ-CATALOG-338)', async () => {
    const { service, model } = serviceWith([]);
    await expect(service.create({ name: 'Без артикула', article: '   ' })).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('maps duplicate module articles to a Russian conflict (TZ-CATALOG-338)', async () => {
    const { service, model } = serviceWith([]);
    model.create.mockRejectedValueOnce({ code: 11000, keyPattern: { organizationId: 1, article: 1 } });
    await expect(service.create({ name: 'Дубликат', article: 'MOD-DUP' })).rejects.toMatchObject({
      constructor: ConflictException,
      message: 'Артикул уже используется',
    });
  });

  it('rejects non-empty legacy materials[] on create', async () => {
    const { service, model } = serviceWith([]);
    await expect(service.create(legacyMaterialsDto({ length: 900 }))).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('rejects non-empty legacy materials[] on update', async () => {
    const save = jest.fn();
    const doc = { _id: new Types.ObjectId(), save, workTypes: [], materials: [] };
    const { service, materialModel } = serviceWith([]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await expect(service.update('507f1f77bcf86cd799439011', legacyMaterialsDto({ width: 40 }))).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
    expect(materialModel.find).not.toHaveBeenCalled();
  });

  it('allows create when materials is omitted', async () => {
    const { service, model } = serviceWith([]);
    await expect(service.create({ name: 'Empty materials module', article: 'MOD-EMPTY', workTypes: [] })).resolves.toBeDefined();
    expect(model.create).toHaveBeenCalledTimes(1);
  });

  it('allows create when materials is an empty array (treated as omit)', async () => {
    const { service, model } = serviceWith([]);
    await expect(service.create({ name: 'Empty array module', article: 'MOD-EMPTY-ARRAY', materials: [], workTypes: [] })).resolves.toBeDefined();
    expect(model.create).toHaveBeenCalledTimes(1);
  });

  it('persists module↔workType binding days on create (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const { service, model } = serviceWith([]);
    const workTypeId = new Types.ObjectId().toString();
    await service.create({
      name: 'Дни на связке',
      article: 'MOD-DAYS',
      workTypes: [{ workTypeId, estimatedHours: 8, days: 4 }],
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ workTypes: [expect.objectContaining({ estimatedHours: 8, days: 4 })] }),
    );
  });

  it('defaults binding days to null when omitted so Gantt falls back to catalog (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const { service, model } = serviceWith([]);
    const workTypeId = new Types.ObjectId().toString();
    await service.create({ name: 'Без дней', article: 'MOD-NO-DAYS', workTypes: [{ workTypeId, estimatedHours: 8 }] });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ workTypes: [expect.objectContaining({ days: null })] }),
    );
  });

  it('rejects binding days below 1 (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const { service, model } = serviceWith([]);
    const workTypeId = new Types.ObjectId().toString();
    await expect(
      service.create({ name: 'Плохие дни', article: 'MOD-BAD-DAYS', workTypes: [{ workTypeId, days: 0 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('updates module↔workType binding days (TZ-NX-MODULE-WT-DAYS-SOT)', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const workTypeId = new Types.ObjectId().toString();
    const doc = { _id: new Types.ObjectId(), save, workTypes: [], materials: [] };
    const { service } = serviceWith([]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await service.update('507f1f77bcf86cd799439011', { workTypes: [{ workTypeId, days: 2 }] });
    expect(doc.workTypes).toEqual([expect.objectContaining({ days: 2 })]);
    expect(save).toHaveBeenCalled();
  });

  it('rejects immutable length override on composition material line', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc = { _id: new Types.ObjectId(), save, composition: [], materials: [] };
    const { service } = serviceWith([{
      _id: new Types.ObjectId(MATERIAL_ID),
      name: 'Лист',
      dimensions: [{ type: 'length', value: 1000, isImmutable: true }],
    }]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await expect(service.addComposition(String(doc._id), {
      lineType: 'material',
      refId: MATERIAL_ID,
      quantity: 1,
      overrideDimensions: { length: 900 },
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('allows mutable length override on composition material line', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const doc = { _id: new Types.ObjectId(), save, composition: [] as unknown[], materials: [] };
    const { service } = serviceWith([{
      _id: new Types.ObjectId(MATERIAL_ID),
      name: 'Лист',
      dimensions: [{ type: 'length', value: 1000, isImmutable: false }],
    }]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await expect(service.addComposition(String(doc._id), {
      lineType: 'material',
      refId: MATERIAL_ID,
      quantity: 1,
      overrideDimensions: { length: 900 },
    })).resolves.toBeDefined();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rejects product lineType on module composition (TZ-CATALOG-305)', async () => {
    const save = jest.fn();
    const doc = { _id: new Types.ObjectId(), save, composition: [], materials: [] };
    const { service } = serviceWith([]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await expect(service.addComposition(String(doc._id), {
      lineType: 'product' as any,
      refId: new Types.ObjectId().toHexString(),
      quantity: 1,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects product lineType on module composition update (TZ-CATALOG-305)', async () => {
    const save = jest.fn();
    const lineId = new Types.ObjectId().toHexString();
    const doc = { _id: new Types.ObjectId(), save, composition: [{ _id: new Types.ObjectId(lineId), lineType: 'material', refId: new Types.ObjectId(MATERIAL_ID), quantity: 1, sortOrder: 0 }], materials: [] };
    const { service } = serviceWith([]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    await expect(service.updateComposition(String(doc._id), lineId, {
      lineType: 'product' as any,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(save).not.toHaveBeenCalled();
  });

  it('getComposition resolves populated legacy materials.materialId (module composition 500 fix)', async () => {
    const moduleId = new Types.ObjectId();
    const populatedMaterial = {
      _id: new Types.ObjectId(MATERIAL_ID),
      name: 'Лист',
      unit: 'm2',
      dimensions: [],
      materialKind: 'raw',
    };
    const doc = {
      _id: moduleId,
      deletedAt: null,
      composition: [] as unknown[],
      materials: [{ materialId: populatedMaterial, quantity: 2, sortOrder: 0, unit: 'm2' }],
    };
    const { service } = serviceWith([]);
    (service as any).model.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    });
    const lines = await service.getComposition(String(moduleId));
    expect(lines).toHaveLength(1);
    expect(lines[0].refId.toString()).toBe(MATERIAL_ID);
    expect(lines[0].quantity).toBe(2);
  });
});
