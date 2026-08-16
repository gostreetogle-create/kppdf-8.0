import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { DashboardDialogService } from './dashboard-dialog.service';
import { PiDialogService } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { ProductsService } from './products.service';
import type { Order } from '../../pages/orders/orders.service';
import type { Product } from './products.service';

describe('DashboardDialogService', () => {
  let dialog: { open: jest.Mock };
  let toast: { error: jest.Mock };
  let products: { findById: jest.Mock };

  const loadedProduct = {
    _id: '64a1b2c3d4e5f678901234ab',
    name: 'Стол',
    kind: 'good',
    unit: 'шт',
  } as Product;

  beforeEach(() => {
    dialog = {
      open: jest.fn().mockReturnValue({
        closed: signal(undefined),
        close: jest.fn(),
      }),
    };
    toast = { error: jest.fn() };
    products = {
      findById: jest.fn().mockReturnValue(of({ ok: true, data: loadedProduct })),
    };
    TestBed.configureTestingModule({
      providers: [
        DashboardDialogService,
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
        { provide: ProductsService, useValue: products },
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

  it('loads the product by id and opens the dialog with the full Product (_id)', async () => {
    const service = TestBed.inject(DashboardDialogService);

    service.openProductEdit(loadedProduct._id, TestBed.inject(Injector), jest.fn());
    await Promise.resolve();
    await Promise.resolve();

    expect(products.findById).toHaveBeenCalledWith(loadedProduct._id);
    expect(dialog.open).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ProductFormDialogComponent' }),
      expect.objectContaining({ data: loadedProduct, width: 'lg' }),
    );
  });

  it('does not open a dialog with a bare { id } when findById fails', async () => {
    products.findById.mockReturnValue(
      of({
        ok: false,
        error: new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
      }),
    );
    const service = TestBed.inject(DashboardDialogService);

    service.openProductEdit(loadedProduct._id, TestBed.inject(Injector), jest.fn());
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('toasts in Russian and skips the API when the product id is missing', () => {
    const service = TestBed.inject(DashboardDialogService);

    service.openProductEdit('undefined', TestBed.inject(Injector), jest.fn());

    expect(products.findById).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Изделие не найдено: не указан идентификатор');
  });
});
