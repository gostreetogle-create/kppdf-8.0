import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SupplyRequestService } from './supply-request.service';

function mockQuery<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createService() {
  const model = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    db: {
      collection: jest.fn(),
    },
  };
  const supplyTasks = {
    create: jest.fn(),
    findOpenByOrderMaterial: jest.fn(),
  };
  const service = new SupplyRequestService(model as never, supplyTasks as never);
  return { service, model, supplyTasks };
}

const savedDoc = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(),
  status: 'in_progress',
  priority: 'normal',
  qty: 1,
  save: jest.fn().mockImplementation(function (this: Record<string, unknown>) {
    return Promise.resolve(this);
  }),
  ...overrides,
});

describe('SupplyRequestService (TZ-SUPPLY-305)', () => {
  it('create stores a request with defaults and material snapshot', async () => {
    const { service, model } = createService();
    const materialId = new Types.ObjectId();
    model.db.collection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ name: 'Подшипник', article: '6205', unit: 'шт' }),
    });
    model.create.mockResolvedValue([savedDoc()]);

    await service.create({ materialId: materialId.toString(), qty: 4 });

    expect(model.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          materialId,
          title: 'Подшипник',
          article: '6205',
          unit: 'шт',
          qty: 4,
          status: 'in_progress',
          priority: 'normal',
        }),
      ],
      { session: undefined },
    );
  });

  it('create allows an empty draft for the quick-order form', async () => {
    const { service, model } = createService();
    model.create.mockResolvedValue([savedDoc({ qty: 1 })]);

    await service.create({ qty: 1 });

    expect(model.create).toHaveBeenCalledWith(
      [expect.objectContaining({ qty: 1, status: 'in_progress', priority: 'normal' })],
      { session: undefined },
    );
  });

  it('update refreshes snapshot when material changes', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId();
    const newMaterialId = new Types.ObjectId();
    model.findOne.mockReturnValue(
      mockQuery(savedDoc({ _id: id, materialId: new Types.ObjectId() })),
    );
    model.db.collection.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        name: 'Фреза D6',
        article: 'FR-D6',
        unit: 'шт',
      }),
    });

    await service.update(id.toString(), { materialId: newMaterialId.toString() });

    const doc = await model.findOne().exec();
    expect(doc.materialId).toEqual(newMaterialId);
    expect(doc.title).toBe('Фреза D6');
    expect(doc.article).toBe('FR-D6');
    expect(doc.unit).toBe('шт');
  });

  it('markOrdered without order/material only sets status (no spawn)', async () => {
    const { service, model, supplyTasks } = createService();
    const id = new Types.ObjectId();
    model.findOne.mockReturnValue(mockQuery(savedDoc({ _id: id })));

    const res = await service.markOrdered(id.toString());

    expect(res.status).toBe('ordered');
    expect(res.linkedSupplyTaskId).toBeUndefined();
    expect(supplyTasks.create).not.toHaveBeenCalled();
  });

  it('markOrdered is idempotent when a registry task is already linked', async () => {
    const { service, model, supplyTasks } = createService();
    const id = new Types.ObjectId();
    const linkedTaskId = new Types.ObjectId();
    model.findOne.mockReturnValue(
      mockQuery(
        savedDoc({
          _id: id,
          orderId: new Types.ObjectId(),
          materialId: new Types.ObjectId(),
          linkedSupplyTaskId: linkedTaskId,
        }),
      ),
    );

    const res = await service.markOrdered(id.toString());

    expect(res.status).toBe('ordered');
    expect(res.linkedSupplyTaskId).toEqual(linkedTaskId);
    expect(supplyTasks.create).not.toHaveBeenCalled();
  });

  it('markOrdered reuses an existing open registry task when the link is missing', async () => {
    const { service, model, supplyTasks } = createService();
    const id = new Types.ObjectId();
    const orderId = new Types.ObjectId();
    const materialId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    model.findOne.mockReturnValue(
      mockQuery(savedDoc({ _id: id, orderId, materialId, qty: 7, title: 'Труба' })),
    );
    supplyTasks.findOpenByOrderMaterial.mockResolvedValue({ _id: taskId });

    const res = await service.markOrdered(id.toString(), '6a87612801719b34e2728ac1');

    expect(supplyTasks.findOpenByOrderMaterial).toHaveBeenCalledWith(
      orderId.toString(),
      materialId.toString(),
      '6a87612801719b34e2728ac1',
    );
    expect(supplyTasks.create).not.toHaveBeenCalled();
    expect(res.linkedSupplyTaskId).toEqual(taskId);
  });

  it('markOrdered with order+material spawns a SupplyTask and links it', async () => {
    const { service, model, supplyTasks } = createService();
    const id = new Types.ObjectId();
    const orderId = new Types.ObjectId();
    const materialId = new Types.ObjectId();
    const taskId = new Types.ObjectId();
    model.findOne.mockReturnValue(
      mockQuery(savedDoc({ _id: id, orderId, materialId, qty: 7, title: 'Труба' })),
    );
    supplyTasks.create.mockResolvedValue({ _id: taskId });

    const res = await service.markOrdered(id.toString());

    expect(supplyTasks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: orderId.toString(),
        materialId: materialId.toString(),
        qty: 7,
        title: 'Труба',
      }),
      undefined,
      'ordered',
    );
    expect(res.linkedSupplyTaskId).toEqual(taskId);
    expect(res.status).toBe('ordered');
  });

  it('remove soft-deletes', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId();
    model.findOne.mockReturnValue(mockQuery(savedDoc({ _id: id })));

    await service.remove(id.toString());

    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $set: { deletedAt: expect.any(Date) } },
    );
  });

  it('findById 404 for unknown id', async () => {
    const { service, model } = createService();
    model.findOne.mockReturnValue(mockQuery(null));
    await expect(
      service.findById(new Types.ObjectId().toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
