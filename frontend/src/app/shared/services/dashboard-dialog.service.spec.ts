import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DashboardDialogService } from './dashboard-dialog.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import type { Order } from '../../pages/orders/orders.service';

describe('DashboardDialogService', () => {
  let dialog: { open: jest.Mock };

  beforeEach(() => {
    dialog = {
      open: jest.fn().mockReturnValue({
        closed: signal(undefined),
        close: jest.fn(),
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        DashboardDialogService,
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { error: jest.fn() } },
      ],
    });
  });

  it('opens the existing order dialog with the unchanged order payload', async () => {
    const service = TestBed.inject(DashboardDialogService);
    const order = { _id: 'o1', number: 'ORD-1', status: 'ready' } as Order;

    service.openOrderEdit(order, TestBed.inject(Injector), jest.fn());
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'OrderFormDialogComponent' }),
      expect.objectContaining({ data: order, width: 'lg' }),
    );
  });

  it('opens the existing product dialog with the unchanged id payload', async () => {
    const service = TestBed.inject(DashboardDialogService);

    service.openProductEdit('p1', TestBed.inject(Injector), jest.fn());
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ProductFormDialogComponent' }),
      expect.objectContaining({ data: { id: 'p1' }, width: 'lg' }),
    );
  });
});
