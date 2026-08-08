import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { QuotationService } from './quotation.service';
import { QuotationStatus } from './quotation.schema';

const COUNTERPARTY = new Types.ObjectId().toString();
const ORG = new Types.ObjectId().toString();

/** Minimal mock Mongoose document (toObject-free). */
function quotationDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    number: 'QTN-0001',
    organizationId: new Types.ObjectId(ORG),
    counterpartyId: new Types.ObjectId(COUNTERPARTY),
    date: new Date(),
    status: 'draft',
    total: 0,
    items: [] as Array<Record<string, unknown>>,
    familyRole: 'solo' as string,
    familyVersion: 1,
    orgMarkupPercent: undefined as number | undefined,
    masterId: undefined as Types.ObjectId | undefined,
    convertedOrderId: undefined as string | undefined,
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
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createService(overrides: Record<string, unknown> = {}) {
  const model = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  };
  const counter = { next: jest.fn().mockResolvedValue('QTN-0001') };
  const contractService = { create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }) };
  const orderService = { create: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }) };
  const sites = {
    ensureDefaultForCounterparty: jest
      .fn()
      .mockResolvedValue({ _id: new Types.ObjectId() }),
  };
  const dependencies = { model, counter, contractService, orderService, sites, ...overrides };
  return {
    service: new QuotationService(
      dependencies.model as never,
      dependencies.counter as never,
      dependencies.contractService as never,
      dependencies.orderService as never,
      dependencies.sites as never,
    ),
    model: dependencies.model as {
      findOne: jest.Mock;
      find: jest.Mock;
      findById: jest.Mock;
      create: jest.Mock;
      updateOne: jest.Mock;
    },
    counter: dependencies.counter as { next: jest.Mock },
    contractService: dependencies.contractService as { create: jest.Mock },
    orderService: dependencies.orderService as { create: jest.Mock },
    sites: dependencies.sites as { ensureDefaultForCounterparty: jest.Mock },
  };
}

function validCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    organizationId: ORG,
    counterpartyId: COUNTERPARTY,
    items: [
      {
        productId: new Types.ObjectId().toString(),
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

describe('QuotationService — SALES-301 (КП thin UI)', () => {
  describe('create (snapshot semantics)', () => {
    it('stores the productName/productSku SNAPSHOT verbatim from the DTO', async () => {
      const { service, model } = createService();
      model.create.mockResolvedValue(quotationDoc({}));

      const dto = validCreateDto({
        items: [
          {
            productId: new Types.ObjectId().toString(),
            productName: 'Старое название бренда',
            productSku: 'SKU-OLD',
            quantity: 3,
            unit: 'шт',
            unitPrice: 100,
          },
        ],
      });
      await service.create(dto as never);

      const created = model.create.mock.calls[0][0];
      expect(created.items[0]).toMatchObject({
        productName: 'Старое название бренда',
        productSku: 'SKU-OLD',
        quantity: 3,
        unit: 'шт',
        unitPrice: 100,
        total: 300,
      });
      // Ref stored as raw ObjectId — display MUST use the inline snapshot.
      expect(created.items[0].productId).toBeInstanceOf(Types.ObjectId);
    });

    it('NO-MUTATION-ON-CATALOG-CHANGE: create does NOT look up the product (no $lookup / no populate at write time)', async () => {
      const { service, model } = createService();
      model.create.mockResolvedValue(quotationDoc({}));

      await service.create(validCreateDto() as never);
      expect(model.findOne).not.toHaveBeenCalled();
      expect(model.findById).not.toHaveBeenCalled();
    });

    it('generates the number via counter when omitted', async () => {
      const { service, model, counter } = createService();
      model.create.mockResolvedValue(quotationDoc({}));

      await service.create(validCreateDto({ number: undefined }) as never);
      expect(counter.next).toHaveBeenCalledWith('Quotation', 'QTN');
      expect(model.create.mock.calls[0][0]).toMatchObject({ number: 'QTN-0001' });
    });

    it('applies a PERCENT discount to the computed total', async () => {
      const { service, model } = createService();
      model.create.mockResolvedValue(quotationDoc({}));

      await service.create(
        validCreateDto({ discountType: 'percent', discountPercent: 10 }) as never,
      );
      expect(model.create.mock.calls[0][0]).toMatchObject({ total: 9000 });
    });

    it('applies an AMOUNT discount to the computed total', async () => {
      const { service, model } = createService();
      model.create.mockResolvedValue(quotationDoc({}));

      await service.create(
        validCreateDto({ discountType: 'amount', discountAmount: 2500 }) as never,
      );
      expect(model.create.mock.calls[0][0]).toMatchObject({ total: 7500 });
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
      const docs = [quotationDoc({}), quotationDoc({})];
      // Call order in the service: find → populate → populate → populate → sort → exec.
      model.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      });

      const result = await service.findAll(COUNTERPARTY, 'sent');
      expect(model.find).toHaveBeenCalledWith({
        counterpartyId: new Types.ObjectId(COUNTERPARTY),
        status: 'sent',
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

    it('findById returns the STORED inline snapshot even if the live product ref changed', async () => {
      // Immutability contract (plan §S1): display layer must NOT $lookup the
      // live Product — the inline productName/productSku snapshot is truth.
      const { service, model } = createService();
      const doc = quotationDoc({
        items: [
          {
            productId: new Types.ObjectId(),
            productName: 'Старое название бренда', // snapshot at creation time
            productSku: 'SKU-OLD',
            quantity: 1,
            unitPrice: 100,
            total: 100,
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      const result = await service.findById(doc._id.toString());
      expect(result.items[0].productName).toBe('Старое название бренда');
      expect(result.items[0].productSku).toBe('SKU-OLD');
    });
  });

  describe('update / duplicate', () => {
    it('update recomputes the total from items + discount', async () => {
      const { service, model } = createService();
      const doc = quotationDoc({
        status: 'draft',
        discountType: 'percent',
        discountPercent: 20,
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.update(doc._id.toString(), {
        items: [
          {
            productId: new Types.ObjectId().toString(),
            productName: 'Стенд',
            quantity: 5,
            unit: 'шт',
            unitPrice: 2000,
          },
        ],
      } as never);
      expect(doc.total).toBe(8000); // 5 × 2000 − 20%
      expect(doc.save).toHaveBeenCalled();
    });

    it('duplicate creates a draft copy with a fresh number', async () => {
      const { service, model, counter } = createService();
      const src = quotationDoc({
        number: 'QTN-0001',
        status: 'accepted',
        items: [{ productId: new Types.ObjectId(), quantity: 1, unitPrice: 10, total: 10 }],
      });
      model.findById.mockReturnValue(mockQuery(src));
      counter.next.mockResolvedValueOnce('QTN-0002');
      model.create.mockResolvedValue(quotationDoc({}));

      await service.duplicate(src._id.toString());
      expect(model.create.mock.calls[0][0]).toMatchObject({
        number: 'QTN-0002',
        status: 'draft',
        notes: 'Дубликат QTN-0001',
      });
    });
  });
});

describe('QuotationService — ORDERS-301 (quote → order conversion)', () => {
  describe('convertToOrder', () => {
    it('REJECTS a quotation that is NOT accepted (draft/sent/rejected/cancelled)', async () => {
      const { service, model } = createService();
      for (const status of ['draft', 'sent', 'rejected', 'cancelled'] as QuotationStatus[]) {
        model.findById.mockReturnValue(mockQuery(quotationDoc({ status })));
        await expect(
          service.convertToOrder(new Types.ObjectId().toString()),
        ).rejects.toBeInstanceOf(BadRequestException);
      }
      expect(model.findById).toHaveBeenCalledTimes(4);
    });

    it('REJECTS an already-converted quotation', async () => {
      const { service, model } = createService();
      model.findById.mockReturnValue(mockQuery(quotationDoc({ status: 'converted' })));

      await expect(
        service.convertToOrder(new Types.ObjectId().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('STRIPS COMMERCE: order items carry NO unitPrice/total — only FK + inline snapshot', async () => {
      const { service, model, orderService } = createService();
      model.findById.mockReturnValue(
        mockQuery(
          quotationDoc({
            status: 'accepted',
            items: [
              {
                productId: new Types.ObjectId(),
                productName: 'Стенд напольный',
                productSku: 'SKU-100',
                quantity: 2,
                unit: 'шт',
                unitPrice: 5000,
                total: 10000,
              },
            ],
          }),
        ),
      );
      orderService.create.mockResolvedValue({ _id: new Types.ObjectId() });

      await service.convertToOrder(new Types.ObjectId().toString());

      const orderPayload = orderService.create.mock.calls[0][0];
      expect(orderPayload.counterpartyId).toBe(COUNTERPARTY);
      expect(orderPayload.siteId).toBeDefined();
      expect(orderPayload.status).toBe('draft');
      const item = orderPayload.items[0];
      // COPY: FK is preserved (immutable identifier).
      expect(item.productId).toBeDefined();
      // SNAPSHOT: name/sku survive (inline productSnapshot pattern).
      expect(item.productName).toBe('Стенд напольный');
      expect(item.productSku).toBe('SKU-100');
      // DROP: commerce fields are NOT copied.
      expect(item.unitPrice).toBeUndefined();
    });

    it('marks the quotation converted and records the order id', async () => {
      const { service, model, orderService } = createService();
      const orderId = new Types.ObjectId();
      orderService.create.mockResolvedValue({ _id: orderId });
      const doc = quotationDoc({
        status: 'accepted',
        items: [{ productId: new Types.ObjectId(), quantity: 1, unitPrice: 10, total: 10 }],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.convertToOrder(doc._id.toString());
      expect(doc.status).toBe('converted');
      expect(doc.convertedOrderId).toBe(orderId.toString());
      expect(doc.save).toHaveBeenCalled();
    });

    it('REJECTS convert of a family variant (400)', async () => {
      const { service, model, orderService } = createService();
      model.findById.mockReturnValue(
        mockQuery(
          quotationDoc({
            status: 'accepted',
            familyRole: 'variant',
            masterId: new Types.ObjectId(),
          }),
        ),
      );

      await expect(
        service.convertToOrder(new Types.ObjectId().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(orderService.create).not.toHaveBeenCalled();
    });
  });
});

describe('QuotationService — SALES-303 (KP family)', () => {
  const ORG_B = new Types.ObjectId().toString();
  const ORG_C = new Types.ObjectId().toString();

  describe('attachOrganizations', () => {
    it('promotes solo → master and creates 2 variants (1 master + 2 variant)', async () => {
      const { service, model, counter } = createService();
      const master = quotationDoc({
        familyRole: 'solo',
        familyVersion: 1,
        total: 1000,
        items: [
          {
            productId: new Types.ObjectId(),
            productName: 'Стенд',
            quantity: 2,
            unitPrice: 500,
            total: 1000,
          },
        ],
      });
      const created: unknown[] = [];

      model.findById.mockImplementation((id: Types.ObjectId | string) => {
        const sid = id.toString();
        if (sid === master._id.toString()) return mockQuery(master);
        return mockQuery(null);
      });
      model.findOne.mockReturnValue(mockQuery(null));
      counter.next
        .mockResolvedValueOnce('QTN-0002')
        .mockResolvedValueOnce('QTN-0003');
      model.create.mockImplementation(async (payload: Record<string, unknown>) => {
        const doc = quotationDoc({
          ...payload,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        });
        created.push(doc);
        return doc;
      });
      // getFamily after attach: findById master + find variants
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(created),
      });

      const result = await service.attachOrganizations(master._id.toString(), {
        items: [
          { organizationId: ORG_B, orgMarkupPercent: 5 },
          { organizationId: ORG_C, orgMarkupPercent: 10 },
        ],
      });

      expect(master.familyRole).toBe('master');
      expect(master.save).toHaveBeenCalled();
      expect(model.create).toHaveBeenCalledTimes(2);
      expect(created).toHaveLength(2);
      expect((created[0] as { familyRole: string }).familyRole).toBe('variant');
      expect((created[1] as { familyRole: string }).familyRole).toBe('variant');
      expect(result.master.familyRole).toBe('master');
      expect(result.variants).toHaveLength(2);
    });

    it('is idempotent: second attach of same org does not create another variant', async () => {
      const { service, model } = createService();
      const master = quotationDoc({ familyRole: 'master', familyVersion: 1 });
      const existingVariant = quotationDoc({
        familyRole: 'variant',
        masterId: master._id,
        organizationId: new Types.ObjectId(ORG_B),
        orgMarkupPercent: 5,
      });

      model.findById.mockReturnValue(mockQuery(master));
      model.findOne.mockReturnValue(mockQuery(existingVariant));
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([existingVariant]),
      });

      await service.attachOrganizations(master._id.toString(), {
        items: [{ organizationId: ORG_B, orgMarkupPercent: 12 }],
      });

      expect(model.create).not.toHaveBeenCalled();
      expect(existingVariant.orgMarkupPercent).toBe(12);
      expect(existingVariant.save).toHaveBeenCalled();
    });
  });

  describe('syncFromMaster', () => {
    it('copies master qty/lines to variants and bumps familyVersion', async () => {
      const { service, model } = createService();
      const master = quotationDoc({
        familyRole: 'master',
        familyVersion: 1,
        total: 2000,
        items: [
          {
            productId: new Types.ObjectId(),
            productName: 'Стенд',
            quantity: 4,
            unitPrice: 500,
            total: 2000,
          },
        ],
      });
      const variant = quotationDoc({
        familyRole: 'variant',
        masterId: master._id,
        organizationId: new Types.ObjectId(ORG_B),
        familyVersion: 1,
        total: 1000,
        items: [
          {
            productId: new Types.ObjectId(),
            productName: 'Стенд',
            quantity: 2,
            unitPrice: 500,
            total: 1000,
          },
        ],
      });

      model.findById.mockReturnValue(mockQuery(master));
      // First find = variants for sync; second find (via getFamily) = same
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([variant]),
      });

      const result = await service.syncFromMaster(master._id.toString());

      expect(master.familyVersion).toBe(2);
      expect(master.save).toHaveBeenCalled();
      expect(variant.items[0].quantity).toBe(4);
      expect(variant.total).toBe(2000);
      expect(variant.familyVersion).toBe(2);
      expect(variant.save).toHaveBeenCalled();
      expect(result.familyVersion).toBe(2);
    });
  });

  describe('getFamily', () => {
    it('returns master + variants summary', async () => {
      const { service, model } = createService();
      const master = quotationDoc({ familyRole: 'master', familyVersion: 3, total: 500 });
      const variant = quotationDoc({
        familyRole: 'variant',
        masterId: master._id,
        organizationId: new Types.ObjectId(ORG_B),
        familyVersion: 3,
        orgMarkupPercent: 8,
        total: 500,
      });
      model.findById.mockReturnValue(mockQuery(master));
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([variant]),
      });

      const family = await service.getFamily(master._id.toString());
      expect(family.master.id).toBe(master._id.toString());
      expect(family.variants).toHaveLength(1);
      expect(family.variants[0].orgMarkupPercent).toBe(8);
      expect(family.familyVersion).toBe(3);
    });
  });
});
