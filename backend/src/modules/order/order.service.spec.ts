import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrderService } from './order.service';
import { OrderStatus } from './order.schema';

const COUNTERPARTY = new Types.ObjectId().toString();
const PRODUCT = new Types.ObjectId().toString();

/** Shape of a stored OrderItem — unitPrice may be absent (strip-commerce). */
interface MockOrderItem {
  productId: Types.ObjectId;
  productName?: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  total: number;
}

/** Minimal mock Mongoose document (toObject-free). */
function orderDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    number: 'ORD-0001',
    counterpartyId: new Types.ObjectId(COUNTERPARTY),
    date: new Date(),
    status: 'draft',
    total: 0,
    items: [] as MockOrderItem[],
    notes: undefined,
    priority: 'normal',
    save: jest.fn().mockImplementation(function (this: unknown) {
      return Promise.resolve(this);
    }),
    ...overrides,
  };
}

/** Minimal mock Mongoose query wrapper (matching project convention). */
function mockQuery<T>(value: T) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createService(overrides: Record<string, unknown> = {}) {
  // `model` is BOTH a constructor (`new this.model(...)`) and a static
  // query namespace (find/findById/updateOne) — same dual shape as Mongoose.
  const model = jest.fn() as jest.Mock & {
    find: jest.Mock;
    findById: jest.Mock;
    updateOne: jest.Mock;
  };
  // `new this.model(payload)` must APPLY the payload onto a fresh doc
  // (mongoose semantics) — the service reads `doc.total`/`doc.items` after
  // construction. Mock merges payload over the base doc shape.
  model.mockImplementation((payload: Record<string, unknown>) => ({
    ...orderDoc(),
    ...payload,
    save: jest.fn().mockResolvedValue(undefined),
  }));
  model.find = jest.fn();
  model.findById = jest.fn();
  model.updateOne = jest.fn();
  const counter = { next: jest.fn().mockResolvedValue('ORD-0001') };
  const reservationService = { create: jest.fn(), release: jest.fn() };
  const shipmentService = { create: jest.fn() };
  const sessionRunner = { run: jest.fn() };
  const dependencies = {
    model,
    counter,
    reservationService,
    shipmentService,
    sessionRunner,
    ...overrides,
  };
  return {
    service: new OrderService(
      dependencies.model as never,
      dependencies.counter as never,
      dependencies.reservationService as never,
      dependencies.shipmentService as never,
      dependencies.sessionRunner as never,
    ),
    model: dependencies.model as jest.Mock & {
      find: jest.Mock;
      findById: jest.Mock;
      updateOne: jest.Mock;
    },
    counter: dependencies.counter as { next: jest.Mock },
    sessionRunner: dependencies.sessionRunner as { run: jest.Mock },
  };
}

function validCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    counterpartyId: COUNTERPARTY,
    items: [
      {
        productId: PRODUCT,
        productName: 'Стенд напольный',
        productSku: 'SKU-100',
        quantity: 2,
        unit: 'шт',
        unitPrice: 5000,
      },
    ],
    ...overrides,
  };
}

describe('OrderService — TZ-ORDERS-301', () => {
  describe('create (from accepted quote — strip commerce)', () => {
    it('generates the number via counter when omitted', async () => {
      const { service, counter } = createService();

      const result = await service.create(validCreateDto() as never);
      expect(counter.next).toHaveBeenCalledWith('Order', 'ORD');
      expect(result.number).toBe('ORD-0001');
      expect(result.save).toHaveBeenCalled();
    });

    it('computes total from items (qty × unitPrice) when prices ARE provided', async () => {
      const { service } = createService();

      const result = await service.create(validCreateDto() as never);
      expect(result).toMatchObject({ total: 10000 });
      expect(result.items[0]).toMatchObject({ quantity: 2, unitPrice: 5000, total: 10000 });
    });

    it('STRIPS COMMERCE: unitPrice omitted → item total and order total stay 0, inline snapshot kept', async () => {
      // Conversion path (QuotationService.convertToOrder) sends items WITHOUT
      // unitPrice — the order must NOT recompute commerce from the quote.
      const { service } = createService();

      const result = await service.create(
        validCreateDto({
          items: [
            {
              productId: PRODUCT,
              productName: 'Стенд напольный',
              productSku: 'SKU-100',
              quantity: 3,
              unit: 'шт',
              // no unitPrice → strip-commerce
            },
          ],
        }) as never,
      );
      expect(result.total).toBe(0);
      expect(result.items[0].total).toBe(0);
      // SNAPSHOT survives.
      expect(result.items[0]).toMatchObject({
        productName: 'Стенд напольный',
        productSku: 'SKU-100',
      });
    });

    it('stores the inline product snapshot (productName/productSku) at create time', async () => {
      const { service } = createService();

      const result = await service.create(
        validCreateDto({
          items: [
            {
              productId: PRODUCT,
              productName: 'Старое название',
              productSku: 'SKU-OLD',
              quantity: 1,
              unitPrice: 100,
            },
          ],
        }) as never,
      );
      expect(result.items[0]).toMatchObject({
        productName: 'Старое название',
        productSku: 'SKU-OLD',
      });
      expect(result.items[0].productId).toBeInstanceOf(Types.ObjectId);
    });
  });

  describe('findAll / findById', () => {
    it('returns [] for an INVALID counterpartyId filter (no DB hit)', async () => {
      const { service, model } = createService();

      await expect(service.findAll('not-an-object-id')).resolves.toEqual([]);
      expect(model.find).not.toHaveBeenCalled();
    });

    it('builds the filter and returns populated docs', async () => {
      const { service, model } = createService();
      const docs = [orderDoc({}), orderDoc({})];
      model.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      });

      const result = await service.findAll(COUNTERPARTY, 'confirmed');
      expect(model.find).toHaveBeenCalledWith({
        counterpartyId: new Types.ObjectId(COUNTERPARTY),
        status: 'confirmed',
      });
      expect(result).toBe(docs);
    });

    it('findById throws 404 on an invalid id before any query', async () => {
      const { service, model } = createService();

      await expect(service.findById('nope')).rejects.toBeInstanceOf(NotFoundException);
      expect(model.findById).not.toHaveBeenCalled();
    });

    it('findById throws 404 when the doc is missing', async () => {
      const { service, model } = createService();
      model.findById.mockReturnValue(mockQuery(null));

      await expect(service.findById(new Types.ObjectId().toString())).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update (frozen after production)', () => {
    it('BLOCKS updates once the order is in_production/ready/shipped/delivered/cancelled', async () => {
      const { service, model } = createService();
      for (const status of [
        'in_production',
        'ready',
        'shipped',
        'delivered',
        'cancelled',
      ] as OrderStatus[]) {
        model.findById.mockReturnValue(mockQuery(orderDoc({ status })));
        await expect(
          service.update(new Types.ObjectId().toString(), { notes: 'меняю' } as never),
        ).rejects.toBeInstanceOf(BadRequestException);
      }
      expect(model.findById).toHaveBeenCalledTimes(5);
    });

    it('ALLOWS updates for draft/confirmed orders and mutates fields', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'confirmed' });
      model.findById.mockReturnValue(mockQuery(doc));

      const result = await service.update(doc._id.toString(), {
        notes: 'новая заметка',
        priority: 'urgent',
      } as never);
      expect(doc.notes).toBe('новая заметка');
      expect(doc.priority).toBe('urgent');
      expect(doc.save).toHaveBeenCalled();
      expect(result).toBe(doc);
    });
  });

  describe('remove', () => {
    it('SOFT-DELETES an order (sets deletedAt)', async () => {
      const { service, model } = createService();
      const doc = orderDoc({});
      model.findById.mockReturnValue(mockQuery(doc));
      // remove() calls `.updateOne(...).exec()`.
      model.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

      await service.remove(doc._id.toString());
      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: doc._id },
        { $set: { deletedAt: expect.any(Date) } },
      );
    });
  });
});
