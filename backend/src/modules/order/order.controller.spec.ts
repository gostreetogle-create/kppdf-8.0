import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderController } from './order.controller';

function buildController() {
  const service = {
    patchLineBoardLane: jest.fn(),
  };
  return { controller: new OrderController(service as never), service };
}

describe('OrderController PATCH /orders/:id/lines/:lineId/lane', () => {
  it('delegates happy-path shop lane to the service and returns the updated order', async () => {
    const { controller, service } = buildController();
    const updated = { _id: 'order-id', status: 'in_production' };
    service.patchLineBoardLane.mockResolvedValue(updated);

    const result = await controller.patchLineBoardLane('order-id', 'line-a', {
      lane: 'shop',
    } as never);

    expect(service.patchLineBoardLane).toHaveBeenCalledWith('order-id', 'line-a', 'shop');
    expect(result).toBe(updated);
  });

  it('propagates service BadRequest for lane=shipped (HTTP 400)', async () => {
    const { controller, service } = buildController();
    service.patchLineBoardLane.mockRejectedValue(
      new BadRequestException('lane=shipped через PATCH запрещён — только POST /orders/:id/ship.'),
    );

    await expect(
      controller.patchLineBoardLane('order-id', 'line-a', { lane: 'shipped' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.patchLineBoardLane).toHaveBeenCalledWith('order-id', 'line-a', 'shipped');
  });

  it('propagates service NotFound for unknown lineId (HTTP 404)', async () => {
    const { controller, service } = buildController();
    service.patchLineBoardLane.mockRejectedValue(new NotFoundException('Order line nope not found'));

    await expect(
      controller.patchLineBoardLane('order-id', 'nope', { lane: 'shop' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(service.patchLineBoardLane).toHaveBeenCalledWith('order-id', 'nope', 'shop');
  });
});
