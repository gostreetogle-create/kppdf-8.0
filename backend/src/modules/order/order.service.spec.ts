import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrderService } from './order.service';
import { OrderStatus } from './order.schema';

const COUNTERPARTY = new Types.ObjectId().toString();
const SITE = new Types.ObjectId().toString();
const PRODUCT = new Types.ObjectId().toString();
const ORGANIZATION = new Types.ObjectId().toString();

/** Shape of a stored OrderItem — unitPrice may be absent (strip-commerce). */
interface MockOrderItem {
  productId: Types.ObjectId;
  productName?: string;
  productSku?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  total: number;
  readyForWork?: boolean;
  readyAt?: Date;
  readyByUserId?: Types.ObjectId;
}

/** Minimal mock Mongoose document (toObject-free). */
function orderDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId(),
    number: 'ORD-0001',
    counterpartyId: new Types.ObjectId(COUNTERPARTY),
    siteId: new Types.ObjectId(SITE) as Types.ObjectId | undefined,
    quotationId: undefined as Types.ObjectId | undefined,
    plannedDate: undefined as Date | undefined,
    date: new Date(),
    status: 'draft',
    total: 0,
    items: [] as MockOrderItem[],
    notes: undefined,
    priority: 'normal',
    materialsSource: 'own' as 'own' | 'customer',
    estimateDayOverrides: [] as Array<{
      orderItemIndex: number;
      moduleId: Types.ObjectId;
      workTypeId: Types.ObjectId;
      days: number;
    }>,
    estimateStartOffsets: [] as Array<{
      orderItemIndex: number;
      moduleId: Types.ObjectId;
      workTypeId: Types.ObjectId;
      offsetDays: number;
    }>,
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
  const shipmentModel = { create: jest.fn() };
  const reservationService = { create: jest.fn(), release: jest.fn() };
  const shipmentService = { create: jest.fn() };
  const sessionRunner = { run: jest.fn() };
  const sites = {
    assertBelongsTo: jest.fn().mockResolvedValue({ _id: SITE }),
    ensureDefaultForCounterparty: jest.fn(),
    findByCounterparty: jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(SITE) }]),
  };
  // TZ-ORDERS-306: stub КП пишется в quotations, а «наша фирма» приходит из
  // OrganizationService.findCurrent — те же зависимости, что у сервиса.
  const quotationModel = {
    findById: jest.fn(),
    create: jest.fn().mockImplementation((payload: Record<string, unknown>) =>
      Promise.resolve({ _id: new Types.ObjectId(), ...payload }),
    ),
  };
  const organizations = {
    findCurrent: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(ORGANIZATION) }),
  };
  const dependencies = {
    model,
    counter,
    reservationService,
    shipmentService,
    sessionRunner,
    sites,
    quotationModel,
    organizations,
    ...overrides,
  };
  return {
    service: new OrderService(
      dependencies.model as never,
      shipmentModel as never,
      dependencies.counter as never,
      dependencies.reservationService as never,
      dependencies.shipmentService as never,
      dependencies.sessionRunner as never,
      dependencies.sites as never,
      dependencies.quotationModel as never,
      dependencies.organizations as never,
    ),
    model: dependencies.model as jest.Mock & {
      find: jest.Mock;
      findById: jest.Mock;
      updateOne: jest.Mock;
    },
    counter: dependencies.counter as { next: jest.Mock },
    sessionRunner: dependencies.sessionRunner as { run: jest.Mock },
    sites: dependencies.sites as {
      assertBelongsTo: jest.Mock;
      findByCounterparty: jest.Mock;
    },
    quotationModel: dependencies.quotationModel as { findById: jest.Mock; create: jest.Mock },
    organizations: dependencies.organizations as { findCurrent: jest.Mock },
  };
}

function validCreateDto(overrides: Record<string, unknown> = {}) {
  return {
    counterpartyId: COUNTERPARTY,
    siteId: SITE,
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
    it('BLOCKS composition updates once the order is in_production/ready/shipped/delivered/cancelled', async () => {
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

  describe('update plan fields + siteId heal (TZ-PRODUCTION-331)', () => {
    it('ALLOWS plannedDate on ready', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'ready', siteId: new Types.ObjectId(SITE) });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.update(doc._id.toString(), {
        plannedDate: '2026-08-20T12:00:00.000Z',
      } as never);
      expect(doc.plannedDate).toEqual(new Date('2026-08-20T12:00:00.000Z'));
      expect(doc.save).toHaveBeenCalled();
    });

    it('ALLOWS priority on in_production', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'in_production', siteId: new Types.ObjectId(SITE) });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.update(doc._id.toString(), { priority: 'urgent' } as never);
      expect(doc.priority).toBe('urgent');
      expect(doc.save).toHaveBeenCalled();
    });

    it('BLOCKS notes on ready', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'ready', siteId: new Types.ObjectId(SITE) });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), { notes: 'нельзя' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('BLOCKS plannedDate on shipped', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'shipped', siteId: new Types.ObjectId(SITE) });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), {
          plannedDate: '2026-08-20T12:00:00.000Z',
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('heals missing siteId then saves patchEstimateDays', async () => {
      const siteOid = new Types.ObjectId(SITE);
      const { service, model, sites } = createService();
      sites.findByCounterparty.mockResolvedValue([{ _id: siteOid }]);
      const doc = orderDoc({
        status: 'ready',
        siteId: undefined,
        items: [{ productId: new Types.ObjectId(PRODUCT), quantity: 1, total: 0 }],
        estimateDayOverrides: [],
      });
      model.findById.mockReturnValue(mockQuery(doc));
      const moduleId = new Types.ObjectId();
      const workTypeId = new Types.ObjectId();

      await service.patchEstimateDays(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: moduleId.toString(),
        workTypeId: workTypeId.toString(),
        days: 4,
      });

      expect(sites.findByCounterparty).toHaveBeenCalled();
      expect(doc.siteId).toEqual(siteOid);
      expect(doc.estimateDayOverrides).toHaveLength(1);
      expect(doc.save).toHaveBeenCalled();
    });

    it('throws RU when missing siteId and Counterparty has no Site', async () => {
      const { service, model, sites } = createService();
      sites.findByCounterparty.mockResolvedValue([]);
      const doc = orderDoc({ status: 'ready', siteId: undefined });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), {
          plannedDate: '2026-08-20T12:00:00.000Z',
        } as never),
      ).rejects.toMatchObject({
        message: 'У заказа нет площадки (siteId) — создайте объект у контрагента',
      });
      expect(doc.save).not.toHaveBeenCalled();
    });
  });

  describe('materials source (TZ-ORDERS-305)', () => {
    it('stores own/customer source and updates it without hard blocking', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'confirmed', materialsSource: 'own' });
      model.findById.mockReturnValue(mockQuery(doc));
      const result = await service.update(doc._id.toString(), { materialsSource: 'customer' } as never);
      expect(doc.materialsSource).toBe('customer');
      expect(result).toBe(doc);
    });
  });

  describe('line readiness (TZ-ORDERS-304)', () => {
    it('preserves readiness metadata when an ordinary item update omits the flag', async () => {
      const { service, model } = createService();
      const readyAt = new Date('2026-08-08T10:00:00.000Z');
      const readyByUserId = new Types.ObjectId();
      const doc = orderDoc({
        status: 'confirmed',
        items: [{ productId: new Types.ObjectId(), quantity: 1, total: 0, readyForWork: true, readyAt, readyByUserId }],
      });
      model.findById.mockReturnValue(mockQuery(doc));
      await service.update(doc._id.toString(), { items: [{ productId: doc.items[0].productId.toString(), quantity: 2 }] } as never);
      expect(doc.items[0].readyForWork).toBe(true);
      expect(doc.items[0].readyAt).toBe(readyAt);
      expect(doc.items[0].readyByUserId).toBe(readyByUserId);
    });

    it('clears readiness metadata when explicitly toggled off', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'confirmed',
        items: [{ productId: new Types.ObjectId(), quantity: 1, total: 0, readyForWork: true, readyAt: new Date(), readyByUserId: new Types.ObjectId() }],
      });
      model.findById.mockReturnValue(mockQuery(doc));
      await service.update(doc._id.toString(), { items: [{ productId: doc.items[0].productId.toString(), quantity: 2, readyForWork: false }] } as never);
      expect(doc.items[0].readyForWork).toBe(false);
      expect(doc.items[0].readyAt).toBeUndefined();
      expect(doc.items[0].readyByUserId).toBeUndefined();
    });

    it('toggles one line without changing the whole order status', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'confirmed', items: [{ productId: new Types.ObjectId(), quantity: 1, total: 0 }] });
      model.findById.mockReturnValueOnce(mockQuery(doc)).mockReturnValueOnce(mockQuery(doc));
      const result = await service.setLineReady(doc._id.toString(), '0', true, new Types.ObjectId().toString());
      expect(doc.items[0].readyForWork).toBe(true);
      expect(doc.items[0].readyAt).toBeInstanceOf(Date);
      expect(doc.status).toBe('confirmed');
      expect(result).toBe(doc);
    });
  });

  describe('stub proposal (TZ-ORDERS-306)', () => {
    function orderWithLines(overrides: Record<string, unknown> = {}) {
      return orderDoc({
        items: [
          {
            productId: new Types.ObjectId(PRODUCT),
            productName: 'Стенд напольный',
            productSku: 'SKU-100',
            quantity: 2,
            unit: 'шт',
            unitPrice: 5000,
            total: 10000,
          },
        ],
        ...overrides,
      });
    }

    it('creates a draft stub КП from the order lines and links both sides', async () => {
      const { service, model, quotationModel, organizations, counter } = createService();
      const doc = orderWithLines();
      model.findById.mockReturnValue(mockQuery(doc));
      counter.next.mockResolvedValue('QTN-0007');

      const { quotation, created } = await service.ensureStubProposal(doc._id.toString(), {
        organizationId: ORGANIZATION,
      });

      expect(created).toBe(true);
      expect(organizations.findCurrent).toHaveBeenCalledWith({ organizationId: ORGANIZATION });
      const [payload] = quotationModel.create.mock.calls[0] as [Record<string, unknown>];
      expect(payload).toMatchObject({
        number: 'QTN-0007',
        status: 'draft',
        isStub: true,
        sourceOrderId: doc._id,
        counterpartyId: doc.counterpartyId,
        total: 10000,
      });
      expect((payload.items as unknown[])[0]).toMatchObject({
        productSku: 'SKU-100',
        quantity: 2,
        unitPrice: 5000,
        total: 10000,
      });
      // Обратная связь: заказ теперь знает своё КП.
      expect(doc.quotationId).toBe(quotation._id);
      expect(doc.save).toHaveBeenCalled();
    });

    it('IS IDEMPOTENT: an order that already has a КП returns it without creating another', async () => {
      const { service, model, quotationModel } = createService();
      const existing = { _id: new Types.ObjectId(), number: 'QTN-0001' };
      const doc = orderWithLines({ quotationId: existing._id });
      model.findById.mockReturnValue(mockQuery(doc));
      quotationModel.findById.mockReturnValue(mockQuery(existing));

      const result = await service.ensureStubProposal(doc._id.toString());

      expect(result).toEqual({ quotation: existing, created: false });
      expect(quotationModel.create).not.toHaveBeenCalled();
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('recreates the stub when quotationId points at a deleted КП', async () => {
      const { service, model, quotationModel } = createService();
      const doc = orderWithLines({ quotationId: new Types.ObjectId() });
      model.findById.mockReturnValue(mockQuery(doc));
      quotationModel.findById.mockReturnValue(mockQuery(null));

      const { created } = await service.ensureStubProposal(doc._id.toString());

      expect(created).toBe(true);
      expect(quotationModel.create).toHaveBeenCalledTimes(1);
    });

    it('refuses an order with no lines — an empty КП is useless for a document', async () => {
      const { service, model, quotationModel } = createService();
      const doc = orderDoc({ items: [] });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(service.ensureStubProposal(doc._id.toString())).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(quotationModel.create).not.toHaveBeenCalled();
    });

    it('refuses a cancelled order', async () => {
      const { service, model, quotationModel } = createService();
      const doc = orderWithLines({ status: 'cancelled' });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(service.ensureStubProposal(doc._id.toString())).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(quotationModel.create).not.toHaveBeenCalled();
    });

    it('propagates the «наша фирма не настроена» error instead of guessing an organization', async () => {
      const { service, model, quotationModel, organizations } = createService();
      const doc = orderWithLines();
      model.findById.mockReturnValue(mockQuery(doc));
      organizations.findCurrent.mockRejectedValue(
        new NotFoundException('Наша организация не настроена'),
      );

      await expect(service.ensureStubProposal(doc._id.toString())).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(quotationModel.create).not.toHaveBeenCalled();
    });
  });

  describe('patchEstimateDays (TZ-PRODUCTION-309)', () => {
    const MODULE = new Types.ObjectId();
    const WORK_TYPE = new Types.ObjectId();

    function orderWithItem(overrides: Record<string, unknown> = {}) {
      return orderDoc({
        items: [
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ],
        estimateDayOverrides: [],
        ...overrides,
      });
    }

    it('upserts an override by composite key', async () => {
      const { service, model } = createService();
      const doc = orderWithItem();
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchEstimateDays(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: MODULE.toString(),
        workTypeId: WORK_TYPE.toString(),
        days: 5,
      });

      expect(doc.estimateDayOverrides).toHaveLength(1);
      expect(doc.estimateDayOverrides[0]).toEqual(
        expect.objectContaining({
          orderItemIndex: 0,
          days: 5,
        }),
      );
      expect(doc.estimateDayOverrides[0].moduleId.equals(MODULE)).toBe(true);
      expect(doc.estimateDayOverrides[0].workTypeId.equals(WORK_TYPE)).toBe(true);
      expect(doc.save).toHaveBeenCalled();
    });

    it('updates existing override on same composite key', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({
        estimateDayOverrides: [
          {
            orderItemIndex: 0,
            moduleId: MODULE,
            workTypeId: WORK_TYPE,
            days: 3,
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchEstimateDays(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: MODULE.toString(),
        workTypeId: WORK_TYPE.toString(),
        days: 7,
      });

      expect(doc.estimateDayOverrides).toHaveLength(1);
      expect(doc.estimateDayOverrides[0].days).toBe(7);
    });

    it('clears override when days is null', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({
        estimateDayOverrides: [
          {
            orderItemIndex: 0,
            moduleId: MODULE,
            workTypeId: WORK_TYPE,
            days: 3,
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchEstimateDays(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: MODULE.toString(),
        workTypeId: WORK_TYPE.toString(),
        days: null,
      });

      expect(doc.estimateDayOverrides).toHaveLength(0);
    });

    it('rejects unknown order line index', async () => {
      const { service, model } = createService();
      const doc = orderWithItem();
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchEstimateDays(doc._id.toString(), {
          orderItemIndex: 9,
          moduleId: MODULE.toString(),
          workTypeId: WORK_TYPE.toString(),
          days: 2,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('patchEstimateStart (TZ-PRODUCTION-316)', () => {
    const MODULE = new Types.ObjectId();
    const WORK_TYPE = new Types.ObjectId();

    function orderWithItem(overrides: Record<string, unknown> = {}) {
      return orderDoc({
        items: [
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ],
        estimateStartOffsets: [],
        ...overrides,
      });
    }

    it('upserts a start offset by composite key', async () => {
      const { service, model } = createService();
      const doc = orderWithItem();
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchEstimateStart(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: MODULE.toString(),
        workTypeId: WORK_TYPE.toString(),
        offsetDays: 3,
      });

      expect(doc.estimateStartOffsets).toHaveLength(1);
      expect(doc.estimateStartOffsets[0]).toEqual(
        expect.objectContaining({
          orderItemIndex: 0,
          offsetDays: 3,
        }),
      );
      expect(doc.estimateStartOffsets[0].moduleId.equals(MODULE)).toBe(true);
      expect(doc.save).toHaveBeenCalled();
    });

    it('clears offset when offsetDays is null', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({
        estimateStartOffsets: [
          {
            orderItemIndex: 0,
            moduleId: MODULE,
            workTypeId: WORK_TYPE,
            offsetDays: 2,
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchEstimateStart(doc._id.toString(), {
        orderItemIndex: 0,
        moduleId: MODULE.toString(),
        workTypeId: WORK_TYPE.toString(),
        offsetDays: null,
      });

      expect(doc.estimateStartOffsets).toHaveLength(0);
    });

    it('rejects negative offsetDays', async () => {
      const { service, model } = createService();
      const doc = orderWithItem();
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchEstimateStart(doc._id.toString(), {
          orderItemIndex: 0,
          moduleId: MODULE.toString(),
          workTypeId: WORK_TYPE.toString(),
          offsetDays: -1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
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
