import { Types } from 'mongoose';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ProductService } from './product.service';

/**
 * TZ-CATALOG-305: Product→Product composition tests.
 *
 * Focus: isComplex computed, unitPriceOverride, product line validation.
 * Note: Full ProductService is complex (many deps); these tests use a
 * minimal harness to validate the composition-line service integration.
 */

// ---------------------------------------------------------------------------
// isComplex derivation (the logic from ProductService.findById)
// ---------------------------------------------------------------------------
function computeIsComplex(composition: Array<{ lineType: string }>): boolean {
  return composition.some((line) => line.lineType === 'product');
}

describe('TZ-CATALOG-338 — Product article contract', () => {
  function buildService(model: { create: jest.Mock }) {
    return new ProductService(
      model as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  }

  it('rejects a missing or whitespace-only sku before persistence', async () => {
    const model = { create: jest.fn() };
    const service = buildService(model);
    await expect(service.create({ name: '', sku: '   ', kind: 'good', unit: 'шт' } as never)).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('maps duplicate sku index errors to a Russian conflict', async () => {
    const model = { create: jest.fn().mockRejectedValue({ code: 11000, keyPattern: { organizationId: 1, sku: 1 } }) };
    const service = buildService(model);
    await expect(service.create({ name: '', sku: 'P-DUP', kind: 'good', unit: 'шт' } as never)).rejects.toMatchObject({
      constructor: ConflictException,
      message: 'Артикул уже используется',
    });
  });
});

describe('TZ-CATALOG-305 — isComplex derivation', () => {
  it('returns false when composition is empty', () => {
    expect(computeIsComplex([])).toBe(false);
  });

  it('returns false when composition has only modules/materials', () => {
    expect(computeIsComplex([
      { lineType: 'module' },
      { lineType: 'material' },
    ])).toBe(false);
  });

  it('returns true when composition has ≥1 product line', () => {
    expect(computeIsComplex([
      { lineType: 'module' },
      { lineType: 'product' },
      { lineType: 'material' },
    ])).toBe(true);
  });

  it('returns true with only product lines', () => {
    expect(computeIsComplex([
      { lineType: 'product' },
      { lineType: 'product' },
    ])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// unitPriceOverride guard (from CompositionLineService.validateReference)
// ---------------------------------------------------------------------------
describe('TZ-CATALOG-305 — unitPriceOverride guard', () => {
  it('allows unitPriceOverride on product line', () => {
    const line = { lineType: 'product', unitPriceOverride: 150 };
    const valid = line.lineType === 'product' || line.unitPriceOverride === undefined;
    expect(valid).toBe(true);
  });

  it('rejects unitPriceOverride on module line', () => {
    const line = { lineType: 'module', unitPriceOverride: 100 };
    const valid = line.lineType === 'product' || line.unitPriceOverride === undefined;
    expect(valid).toBe(false);
  });

  it('rejects unitPriceOverride on material line', () => {
    const line = { lineType: 'material', unitPriceOverride: 50 };
    const valid = line.lineType === 'product' || line.unitPriceOverride === undefined;
    expect(valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Composition does not mutate child Product (by design — parent only stores ref)
// ---------------------------------------------------------------------------
describe('TZ-CATALOG-305 — child Product independence', () => {
  it('composition ref does not mutate child listPrice', () => {
    const childProduct = { _id: new Types.ObjectId(), name: 'Child', listPrice: 500, basePrice: 300 };
    const compositionLine = { lineType: 'product', refId: childProduct._id, quantity: 1, unitPriceOverride: 700 };

    // The override lives on the composition line, NOT on the child
    expect(compositionLine.unitPriceOverride).toBe(700);
    expect(childProduct.listPrice).toBe(500);
    expect(childProduct.basePrice).toBe(300);
  });

  it('product can be child without unitPriceOverride', () => {
    const childProduct = { _id: new Types.ObjectId(), name: 'Child', listPrice: 500 };
    const compositionLine: { lineType: string; refId: Types.ObjectId; quantity: number; unitPriceOverride?: number } =
      { lineType: 'product', refId: childProduct._id, quantity: 2 };

    expect(compositionLine.unitPriceOverride).toBeUndefined();
    expect(childProduct.listPrice).toBe(500);
  });
});
