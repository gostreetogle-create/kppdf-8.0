import { Types } from 'mongoose';
import { ShipmentService } from './shipment.service';

function query<T>(value: T) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('ShipmentService TZ-SUPPLY-312', () => {
  function createService() {
    const model = {
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };
    const service = new ShipmentService(
      model as never,
      { next: jest.fn() } as never,
      { create: jest.fn() } as never,
      { findAll: jest.fn(), fulfill: jest.fn() } as never,
      { run: jest.fn() } as never,
    );
    return { service, model };
  }

  it('excludes soft-deleted shipments and applies organization scope to list', async () => {
    const { service, model } = createService();
    model.find.mockReturnValue(query([]));
    const organizationId = new Types.ObjectId().toString();

    await service.findAll(undefined, undefined, undefined, organizationId);

    expect(model.find).toHaveBeenCalledWith({
      deletedAt: null,
      organizationId: new Types.ObjectId(organizationId),
    });
  });

  it('rejects backwards status transitions', async () => {
    const { service } = createService();
    const save = jest.fn();
    jest.spyOn(service, 'findById').mockResolvedValue({ status: 'delivered', save } as never);

    await expect(
      service.update(new Types.ObjectId().toString(), { status: 'in_transit' } as never, null),
    ).rejects.toThrow('Нельзя перевести отгрузку');
    expect(save).not.toHaveBeenCalled();
  });

  it('soft-deletes a shipment within the current organization', async () => {
    const { service, model } = createService();
    const id = new Types.ObjectId();
    const organizationId = new Types.ObjectId().toString();
    jest.spyOn(service, 'findById').mockResolvedValue({ _id: id } as never);

    await service.remove(id.toString(), organizationId);

    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: id, organizationId: new Types.ObjectId(organizationId) },
      { $set: { deletedAt: expect.any(Date), isActive: false } },
    );
  });
});
