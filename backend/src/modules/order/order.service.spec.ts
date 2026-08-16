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
  /** TZ-COMBINE-402 */
  lineId?: string;
  boardLane?: 'prep' | 'design' | 'shop' | 'to_ship' | 'shipped';
  /** TZ-DASHBOARD-400: ход изделия (может отсутствовать у старых заказов). */
  status?: 'pending' | 'in_production' | 'ready' | 'shipped';
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
    moduleLanes: [] as Array<{
      lineId: string;
      moduleId: Types.ObjectId;
      lane: 'prep' | 'design' | 'shop' | 'to_ship' | 'shipped';
    }>,
    markModified: jest.fn(),
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
    markModified: jest.fn(),
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
    shipmentModel,
    ...overrides,
  };
  return {
    service: new OrderService(
      dependencies.model as never,
      (dependencies.shipmentModel as { create: jest.Mock }) as never,
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
    shipmentModel: dependencies.shipmentModel as { create: jest.Mock },
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

    it('DEFAULT status = draft when omitted (TZ-OPS-315)', async () => {
      const { service } = createService();

      const result = await service.create(validCreateDto() as never);
      expect(result.status).toBe('draft');
    });

    it('TZ-COMBINE-402: create assigns lineId + boardLane prep + status pending', async () => {
      const { service } = createService();

      const result = await service.create(validCreateDto() as never);
      expect(result.items[0].lineId).toEqual(expect.any(String));
      expect(result.items[0].lineId.length).toBeGreaterThan(8);
      expect(result.items[0]).toMatchObject({
        boardLane: 'prep',
        status: 'pending',
      });
    });

    it('ALLOWS explicit confirmed on create (TZ-OPS-315)', async () => {
      const { service } = createService();

      const result = await service.create(
        validCreateDto({ status: 'confirmed' }) as never,
      );
      expect(result.status).toBe('confirmed');
      expect(result.save).toHaveBeenCalled();
    });

    it('BLOCKS create directly in shipped/delivered/cancelled/in_production/ready — no mutation (TZ-OPS-315)', async () => {
      const { service, model } = createService();

      for (const status of [
        'shipped',
        'delivered',
        'cancelled',
        'in_production',
        'ready',
      ] as const) {
        await expect(
          service.create(validCreateDto({ status }) as never),
        ).rejects.toMatchObject({
          message: expect.stringContaining(
            'Заказ нельзя создать сразу в статусе',
          ) as never,
        });
      }
      // Guard сработал до создания документа (model-конструктор не вызывался).
      expect(model).toHaveBeenCalledTimes(0);
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

    it('backfills stable legacy lineId + boardLane from status on findById (TZ-COMBINE-402)', async () => {
      const { service, model } = createService();
      const orderId = new Types.ObjectId();
      const doc = orderDoc({
        _id: orderId,
        items: [
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            total: 0,
            status: 'in_production',
          },
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            total: 0,
            status: 'ready',
          },
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            total: 0,
            status: 'shipped',
          },
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            total: 0,
            // pending / missing status → prep
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      const result = await service.findById(orderId.toString());
      expect(result.items[0].lineId).toBe(`legacy-0-${orderId.toString()}`);
      expect(result.items[0].boardLane).toBe('shop');
      expect(result.items[1].lineId).toBe(`legacy-1-${orderId.toString()}`);
      expect(result.items[1].boardLane).toBe('to_ship');
      expect(result.items[2].boardLane).toBe('shipped');
      expect(result.items[3].boardLane).toBe('prep');
      expect(doc.markModified).toHaveBeenCalledWith('items');
      expect(doc.save).toHaveBeenCalled();
    });

    it('does not re-save when lineId and boardLane already present (TZ-COMBINE-402)', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        items: [
          {
            productId: new Types.ObjectId(PRODUCT),
            quantity: 1,
            total: 0,
            lineId: 'already-there',
            boardLane: 'design',
            status: 'pending',
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.findById(doc._id.toString());
      expect(doc.items[0].lineId).toBe('already-there');
      expect(doc.items[0].boardLane).toBe('design');
      expect(doc.save).not.toHaveBeenCalled();
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

  describe('status transition graph (TZ-SWEEP-401)', () => {
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
        ...overrides,
      });
    }

    it('BLOCKS PATCH to shipped/delivered/cancelled with RU message, no mutation', async () => {
      const { service, model } = createService();
      for (const to of ['shipped', 'delivered', 'cancelled']) {
        const doc = orderWithItem({ status: 'draft' });
        model.findById.mockReturnValueOnce(mockQuery(doc));
        await expect(
          service.update(doc._id.toString(), { status: to } as never),
        ).rejects.toMatchObject({
          message: 'Отгрузка — через действие «Отгрузить»; отмена — «Отменить заказ».',
        });
        expect(doc.status).toBe('draft');
        expect(doc.save).not.toHaveBeenCalled();
      }
      expect(model.findById).toHaveBeenCalledTimes(3);
    });

    it('BLOCKS PATCH out of a hard-frozen status (shipped → ready)', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'shipped' });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), { status: 'ready' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.status).toBe('shipped');
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('ALLOWS status-only PATCH in_production → ready (no composition required)', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'in_production' });
      model.findById.mockReturnValue(mockQuery(doc));

      const result = await service.update(doc._id.toString(), { status: 'ready' } as never);
      expect(doc.status).toBe('ready');
      expect(result).toBe(doc);
      expect(doc.save).toHaveBeenCalled();
    });

    it('ALLOWS step-back PATCH ready → in_production', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'ready' });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.update(doc._id.toString(), { status: 'in_production' } as never);
      expect(doc.status).toBe('in_production');
    });

    it('BLOCKS PATCH ready + notes — freeze состава не обходится статусом', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'in_production' });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), { status: 'ready', notes: 'нельзя' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.status).toBe('in_production');
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('ship() creates Shipment, sets order status and marks every item shipped', async () => {
      const { service, model, sessionRunner, shipmentModel } = createService();
      const doc = orderWithItem({ status: 'ready' });
      model.findById.mockReturnValue(mockQuery(doc));
      sessionRunner.run.mockImplementation(async (fn: (s: unknown) => Promise<unknown>) =>
        fn({}),
      );
      const shipmentId = new Types.ObjectId();
      shipmentModel.create.mockResolvedValue([{ _id: shipmentId }]);

      const { order, shipmentId: createdId } = await service.ship(doc._id.toString());

      expect(order.status).toBe('shipped');
      expect(createdId).toBe(shipmentId.toString());
      expect(order.shipmentIds?.map((s) => s.toString())).toContain(shipmentId.toString());
      expect(order.items.every((item) => item.status === 'shipped')).toBe(true);
      expect(order.save).toHaveBeenCalled();
    });

    it('setItemStatus shipped on a draft order → 400 (ship() owns that transition)', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'draft' });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.setItemStatus(doc._id.toString(), '0', 'shipped'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.items[0].status).toBeUndefined();
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('setItemStatus ready on a line WITHOUT status field writes the value, no throw', async () => {
      const { service, model } = createService();
      const doc = orderWithItem({ status: 'in_production' });
      model.findById.mockReturnValueOnce(mockQuery(doc)).mockReturnValueOnce(mockQuery(doc));

      const result = await service.setItemStatus(doc._id.toString(), '0', 'ready');
      expect(doc.items[0].status).toBe('ready');
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

  describe('TZ-COMBINE-403 patchLineBoardLane + rollupOrderStatus', () => {
    function line(
      lane: MockOrderItem['boardLane'],
      lineId = 'line-a',
    ): MockOrderItem {
      return {
        lineId,
        boardLane: lane,
        productId: new Types.ObjectId(PRODUCT),
        quantity: 1,
        unitPrice: 0,
        total: 0,
        status: 'pending',
      };
    }

    it('rejects lane=shipped via PATCH with RU message', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'confirmed',
        items: [line('prep')],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchLineBoardLane(doc._id.toString(), 'line-a', 'shipped'),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Отгружены') as never,
      });
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('rejects unknown lineId with 404 NotFound (HTTP-contract)', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'draft',
        items: [line('prep', 'line-a')],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchLineBoardLane(doc._id.toString(), 'nope', 'shop'),
      ).rejects.toMatchObject({
        message: expect.stringContaining('not found') as never,
      });
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('writes boardLane + derived status and rollups Order.status', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'draft',
        items: [line('prep')],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchLineBoardLane(doc._id.toString(), 'line-a', 'shop');
      expect(doc.items[0]).toMatchObject({
        boardLane: 'shop',
        status: 'in_production',
      });
      expect(doc.status).toBe('in_production');
      expect(doc.markModified).toHaveBeenCalledWith('items');
      expect(doc.save).toHaveBeenCalled();
    });

    it('rollup: all prep keeps draft', () => {
      const { service } = createService();
      const doc = orderDoc({
        status: 'draft',
        items: [line('prep', 'a'), line('prep', 'b')],
      });
      service.rollupOrderStatus(doc as never);
      expect(doc.status).toBe('draft');
    });

    it('rollup: first leave prep → confirmed', () => {
      const { service } = createService();
      const doc = orderDoc({
        status: 'draft',
        items: [line('design', 'a'), line('prep', 'b')],
      });
      service.rollupOrderStatus(doc as never);
      expect(doc.status).toBe('confirmed');
    });

    it('rollup: any shop → in_production', () => {
      const { service } = createService();
      const doc = orderDoc({
        status: 'confirmed',
        items: [line('shop', 'a'), line('to_ship', 'b')],
      });
      service.rollupOrderStatus(doc as never);
      expect(doc.status).toBe('in_production');
    });

    it('rollup: all to_ship → ready', () => {
      const { service } = createService();
      const doc = orderDoc({
        status: 'in_production',
        items: [line('to_ship', 'a'), line('to_ship', 'b')],
      });
      service.rollupOrderStatus(doc as never);
      expect(doc.status).toBe('ready');
    });

    it('rollup: all prep after leave stays confirmed (monotonic, no draft)', () => {
      const { service } = createService();
      const doc = orderDoc({
        status: 'ready',
        items: [line('prep', 'a'), line('prep', 'b')],
      });
      service.rollupOrderStatus(doc as never);
      expect(doc.status).toBe('confirmed');
    });

    it('rollup: never sets shipped; hard-frozen unchanged', () => {
      const { service } = createService();
      const shipped = orderDoc({
        status: 'shipped',
        items: [line('to_ship', 'a')],
      });
      service.rollupOrderStatus(shipped as never);
      expect(shipped.status).toBe('shipped');

      const cancelled = orderDoc({
        status: 'cancelled',
        items: [line('shop', 'a')],
      });
      service.rollupOrderStatus(cancelled as never);
      expect(cancelled.status).toBe('cancelled');
    });

    it('blocks deleting a non-prep line via update items shrink', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'confirmed',
        items: [
          line('prep', 'keep'),
          {
            ...line('shop', 'drop'),
            status: 'in_production',
          },
        ],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.update(doc._id.toString(), {
          items: [
            {
              productId: PRODUCT,
              quantity: 1,
              unitPrice: 0,
            },
          ],
        } as never),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Комплектация') as never,
      });
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('allows deleting a prep line via update items shrink', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'draft',
        items: [line('prep', 'keep'), line('prep', 'drop')],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.update(doc._id.toString(), {
        items: [
          {
            productId: PRODUCT,
            quantity: 1,
            unitPrice: 0,
          },
        ],
      } as never);
      expect(doc.items).toHaveLength(1);
      expect(doc.items[0].lineId).toBe('keep');
      expect(doc.save).toHaveBeenCalled();
    });
  });

  describe('TZ-COMBINE-406 patchModuleLane + module lane rollup', () => {
    const MODULE_A = new Types.ObjectId();
    const MODULE_B = new Types.ObjectId();

    function line(
      lane: MockOrderItem['boardLane'],
      lineId = 'line-a',
    ): MockOrderItem {
      return {
        lineId,
        boardLane: lane,
        productId: new Types.ObjectId(PRODUCT),
        quantity: 1,
        unitPrice: 0,
        total: 0,
        status: 'pending',
      };
    }

    it('rejects lane=shipped via module PATCH with RU message', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'confirmed', items: [line('prep')] });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchModuleLane(
          doc._id.toString(),
          'line-a',
          MODULE_A.toString(),
          'shipped',
        ),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Отгружены') as never,
      });
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('rejects unknown lineId with 404', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'draft', items: [line('prep', 'line-a')] });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchModuleLane(doc._id.toString(), 'nope', MODULE_A.toString(), 'shop'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('rejects invalid moduleId with 400', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'draft', items: [line('prep')] });
      model.findById.mockReturnValue(mockQuery(doc));

      await expect(
        service.patchModuleLane(doc._id.toString(), 'line-a', 'not-an-id', 'shop'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(doc.save).not.toHaveBeenCalled();
    });

    it('upserts a sparse moduleLane entry keyed by (lineId, moduleId)', async () => {
      const { service, model } = createService();
      const doc = orderDoc({ status: 'draft', items: [line('prep')] });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchModuleLane(
        doc._id.toString(),
        'line-a',
        MODULE_A.toString(),
        'shop',
      );
      expect(doc.moduleLanes).toHaveLength(1);
      expect(doc.moduleLanes[0]).toEqual(
        expect.objectContaining({ lineId: 'line-a', lane: 'shop' }),
      );
      expect(doc.moduleLanes[0].moduleId.equals(MODULE_A)).toBe(true);

      await service.patchModuleLane(
        doc._id.toString(),
        'line-a',
        MODULE_A.toString(),
        'to_ship',
      );
      expect(doc.moduleLanes).toHaveLength(1);
      expect(doc.moduleLanes[0].lane).toBe('to_ship');
    });

    it('rollup follows min: parent band = earliest module lane, last module leave → ready', async () => {
      const { service, model } = createService();
      const doc = orderDoc({
        status: 'confirmed',
        items: [line('to_ship', 'line-a')],
      });
      model.findById.mockReturnValue(mockQuery(doc));

      await service.patchModuleLane(
        doc._id.toString(),
        'line-a',
        MODULE_A.toString(),
        'shop',
      );
      expect(doc.status).toBe('in_production');

      await service.patchModuleLane(
        doc._id.toString(),
        'line-a',
        MODULE_A.toString(),
        'to_ship',
      );
      expect(doc.status).toBe('ready');
    });

    it('effectiveLineLane: no moduleLanes → boardLane; with lanes → min', () => {
      const { service } = createService();
      const doc = orderDoc({
        items: [line('to_ship', 'line-a')],
        moduleLanes: [
          { lineId: 'line-a', moduleId: MODULE_A, lane: 'design' },
          { lineId: 'line-a', moduleId: MODULE_B, lane: 'shop' },
        ],
      });

      expect(service.effectiveLineLane(doc as never, doc.items[0] as never)).toBe(
        'design',
      );

      const bare = orderDoc({ items: [line('design', 'line-b')] });
      expect(service.effectiveLineLane(bare as never, bare.items[0] as never)).toBe(
        'design',
      );
    });
  });
});
