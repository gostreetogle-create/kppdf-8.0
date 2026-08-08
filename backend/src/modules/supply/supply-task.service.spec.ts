import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SupplyTaskService } from './supply-task.service';

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
  };
  const service = new SupplyTaskService(model as never);
  return { service, model };
}

describe('SupplyTaskService (TZ-SUPPLY-301)', () => {
  const ORDER = new Types.ObjectId().toString();
  const USER = new Types.ObjectId().toString();

  it('create stores draft task with order + qty', async () => {
    const { service, model } = createService();
    const doc = { _id: new Types.ObjectId(), status: 'draft' };
    model.create.mockResolvedValue(doc);
    const res = await service.create({
      orderId: ORDER,
      qty: 3,
      title: 'Труба 40×40',
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        qty: 3,
        title: 'Труба 40×40',
        status: 'draft',
      }),
    );
    expect(res).toBe(doc);
  });

  it('create rejects without material/module/title', async () => {
    const { service } = createService();
    await expect(
      service.create({ orderId: ORDER, qty: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirm sets confirmedBy + confirmedAt and status', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId().toString();
    const doc = {
      _id: id,
      status: 'draft' as const,
      save: jest.fn().mockImplementation(function (this: {
        status: string;
        confirmedBy?: Types.ObjectId;
        confirmedAt?: Date;
      }) {
        return Promise.resolve(this);
      }),
    };
    model.findOne.mockReturnValue(mockQuery(doc));
    const res = await service.confirm(id, USER);
    expect(res.status).toBe('confirmed');
    expect(res.confirmedBy?.toString()).toBe(USER);
    expect(res.confirmedAt).toBeInstanceOf(Date);
  });

  it('confirm rejects when not draft', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId().toString();
    model.findOne.mockReturnValue(
      mockQuery({
        _id: id,
        status: 'ordered',
        save: jest.fn(),
      }),
    );
    await expect(service.confirm(id, USER)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('markOrdered requires confirmed', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId().toString();
    const doc = {
      _id: id,
      status: 'confirmed' as const,
      save: jest.fn().mockImplementation(function (this: { status: string }) {
        return Promise.resolve(this);
      }),
    };
    model.findOne.mockReturnValue(mockQuery(doc));
    const res = await service.markOrdered(id);
    expect(res.status).toBe('ordered');
  });

  it('findById 404', async () => {
    const { service, model } = createService();
    model.findOne.mockReturnValue(mockQuery(null));
    await expect(
      service.findById(new Types.ObjectId().toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
