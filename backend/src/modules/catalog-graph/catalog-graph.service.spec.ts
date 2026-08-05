import { Types } from 'mongoose';
import { CatalogGraphService } from './catalog-graph.service';

type Query = { select: jest.Mock; lean: jest.Mock; exec: jest.Mock };
type MockModel = { findById: jest.Mock; find: jest.Mock };
function query<T>(value: T): Query { return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(value) }; }
function mockModel(): MockModel { return { findById: jest.fn().mockReturnValue(query(null)), find: jest.fn().mockReturnValue(query([])) }; }
function buildService() {
  const productModel = mockModel();
  const moduleModel = mockModel();
  const materialModel = mockModel();
  return { service: new CatalogGraphService(productModel as never, moduleModel as never, materialModel as never), productModel, moduleModel, materialModel };
}
function id(): string { return new Types.ObjectId().toHexString(); }
function setFindById(model: MockModel, values: Map<string, Record<string, unknown> | null>): void { model.findById.mockImplementation((value: string) => query(values.get(String(value)) ?? null)); }

describe('CatalogGraphService (TZ-CATALOG-303)', () => {
  it('rejects self-reference for the same entity type', async () => {
    const { service } = buildService(); const value = id();
    await expect(service.assertNoCycleAndDepth(value, 'module', { lineType: 'module', refId: value })).rejects.toThrow(/self-reference/);
  });
  it('allows a material leaf', async () => {
    const { service, productModel, moduleModel } = buildService(); productModel.find.mockReturnValue(query([])); moduleModel.find.mockReturnValue(query([]));
    await expect(service.assertNoCycleAndDepth(id(), 'module', { lineType: 'material', refId: id() })).resolves.toBeUndefined();
  });
  it('rejects a module cycle', async () => {
    const { service, productModel, moduleModel } = buildService(); const parent = id(); const child = id(); productModel.find.mockReturnValue(query([])); moduleModel.find.mockReturnValue(query([])); setFindById(moduleModel, new Map([[child, { composition: [{ lineType: 'module', refId: parent, quantity: 1 }] }]]));
    await expect(service.assertNoCycleAndDepth(parent, 'module', { lineType: 'module', refId: child })).rejects.toThrow(/Цикл/);
  });
  it('allows a total depth of eight', async () => {
    const { service, productModel, moduleModel } = buildService(); const root = id(); const chain = Array.from({ length: 8 }, id); productModel.find.mockReturnValue(query([])); moduleModel.find.mockReturnValue(query([])); const values = new Map<string, Record<string, unknown>>(); chain.forEach((value, index) => values.set(value, { composition: index === chain.length - 1 ? [] : [{ lineType: 'module', refId: chain[index + 1], quantity: 1 }] })); setFindById(moduleModel, values);
    await expect(service.assertNoCycleAndDepth(root, 'product', { lineType: 'module', refId: chain[0] })).resolves.toBeUndefined();
  });
  it('rejects a total depth of nine with HTTP 422 exception', async () => {
    const { service, productModel, moduleModel } = buildService(); const root = id(); const chain = Array.from({ length: 9 }, id); productModel.find.mockReturnValue(query([])); moduleModel.find.mockReturnValue(query([])); const values = new Map<string, Record<string, unknown>>(); chain.forEach((value, index) => values.set(value, { composition: index === chain.length - 1 ? [] : [{ lineType: 'module', refId: chain[index + 1], quantity: 1 }] })); setFindById(moduleModel, values);
    await expect(service.assertNoCycleAndDepth(root, 'product', { lineType: 'module', refId: chain[0] })).rejects.toMatchObject({ status: 422 });
  });
  it('rejects a product-to-product cycle for the future line type', async () => {
    const { service, productModel, moduleModel } = buildService(); const parent = id(); const child = id(); moduleModel.find.mockReturnValue(query([])); productModel.find.mockReturnValue(query([])); setFindById(productModel, new Map([[child, { composition: [{ lineType: 'product', refId: parent, quantity: 1 }] }]]));
    await expect(service.assertNoCycleAndDepth(parent, 'product', { lineType: 'product', refId: child })).rejects.toThrow(/Цикл/);
  });
});

describe('CatalogGraphService (TZ-CATALOG-310)', () => {
  it('returns product backlinks with stable pagination', async () => {
    const { service, productModel } = buildService();
    const target = id();
    productModel.find.mockReturnValue(query([
      { _id: new Types.ObjectId(), name: 'A product', composition: [{ refId: new Types.ObjectId(target), lineType: 'product', quantity: 2, unit: 'шт', sortOrder: 1 }] },
      { _id: new Types.ObjectId(), name: 'B product', composition: [{ refId: new Types.ObjectId(target), lineType: 'product', quantity: 1, unit: 'шт', sortOrder: 0 }] },
    ]));
    const result = await service.getWhereUsed('product', target, { page: 2, limit: 1 });
    expect(result).toMatchObject({ total: 2, page: 2, limit: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].relation).toBe('product');
  });

  it('returns module backlinks from both canonical composition and legacy links', async () => {
    const { service, productModel, moduleModel } = buildService();
    const target = id();
    productModel.find.mockReturnValue(query([{ _id: new Types.ObjectId(), name: 'Legacy product', composition: [], productModuleIds: [new Types.ObjectId(target)] }]));
    moduleModel.find.mockReturnValue(query([{ _id: new Types.ObjectId(), name: 'Parent module', composition: [{ refId: new Types.ObjectId(target), lineType: 'module', quantity: 3 }] }]));
    const result = await service.getWhereUsed('module', target);
    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.kind)).toEqual(['module', 'product']);
    expect(result.items.map((item) => item.quantity)).toEqual([3, 1]);
  });

  it('returns material backlinks from module legacy rows and product composition', async () => {
    const { service, productModel, moduleModel } = buildService();
    const target = id();
    moduleModel.find.mockReturnValue(query([{ _id: new Types.ObjectId(), name: 'Module', composition: [], materials: [{ materialId: new Types.ObjectId(target), quantity: 4, unit: 'кг', sortOrder: 2 }] }]));
    productModel.find.mockReturnValue(query([{ _id: new Types.ObjectId(), name: 'Product', composition: [{ refId: new Types.ObjectId(target), lineType: 'material', quantity: 1, unit: 'шт' }] }]));
    const result = await service.getWhereUsed('material', target);
    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.kind)).toEqual(['module', 'product']);
    expect(result.items[0].quantity).toBe(4);
  });

  it('returns work-type backlinks and tolerates orphan edges without child lookup', async () => {
    const { service, moduleModel } = buildService();
    const target = id();
    moduleModel.find.mockReturnValue(query([{ _id: new Types.ObjectId(), name: 'Routing module', workTypes: [{ workTypeId: new Types.ObjectId(target), sortOrder: 4 }] }]));
    const result = await service.getWhereUsed('workType', target);
    expect(result).toMatchObject({ total: 1, page: 1, limit: 20 });
    expect(result.items[0]).toMatchObject({ relation: 'workType', kind: 'module', sortOrder: 4 });
  });

  it('adds organization scope for owned product backlinks and rejects invalid scope', async () => {
    const { service, productModel } = buildService();
    const target = id();
    productModel.find.mockReturnValue(query([]));
    const organizationId = id();
    await service.getWhereUsed('product', target, { organizationId });
    expect(productModel.find).toHaveBeenCalledWith(expect.objectContaining({ $and: expect.any(Array) }));
    await expect(service.getWhereUsed('product', target, { organizationId: 'not-an-object-id' })).rejects.toThrow('Invalid organizationId');
  });
});
