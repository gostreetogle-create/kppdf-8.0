import { Types } from 'mongoose';
import { CatalogGraphService } from './catalog-graph.service';

type Query = { select: jest.Mock; lean: jest.Mock; exec: jest.Mock };
type MockModel = { findById: jest.Mock; find: jest.Mock };
function query<T>(value: T): Query { return { select: jest.fn().mockReturnThis(), lean: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(value) }; }
function mockModel(): MockModel { return { findById: jest.fn().mockReturnValue(query(null)), find: jest.fn().mockReturnValue(query([])) }; }
function buildService() { const productModel = mockModel(); const moduleModel = mockModel(); const materialModel = mockModel(); return { service: new CatalogGraphService(productModel as never, moduleModel as never, materialModel as never), productModel, moduleModel, materialModel }; }
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
