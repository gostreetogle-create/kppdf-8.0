import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiMaterialsService,
  PiProductsService,
  PiStockMovementsService,
  type Material,
  type Product,
  type StockMovement,
  type Warehouse,
} from '@kppdf/data-access';
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { StockMovementFormDialogComponent } from './stock-movement-form-dialog.component';

describe('StockMovementFormDialogComponent (NX W3)', () => {
  let fixture: ComponentFixture<StockMovementFormDialogComponent>;
  let ref: { close: jest.Mock; closed: ReturnType<typeof signal> };
  let movementApi: { create: jest.Mock };
  let materialsApi: { list: jest.Mock };
  let productsApi: { list: jest.Mock };

  const warehouses: Warehouse[] = [
    {
      _id: 'w1',
      name: 'Металл',
      type: 'main',
      isActive: true,
      zoneNames: ['A-01'],
    },
  ];
  const materials: Material[] = [
    { _id: 'm1', name: 'Лист стальной', unit: 'кг' },
  ];
  const products: Product[] = [
    { _id: 'p1', name: 'Столешница', unit: 'шт', kind: 'good' },
  ];

  async function setup(
    createResult: unknown = { ok: true, data: { _id: 'sm1' } },
    mode: 'in' | 'out' = 'in',
  ): Promise<void> {
    ref = {
      close: jest.fn(),
      closed: signal<StockMovement | undefined>(undefined),
    };
    movementApi = { create: jest.fn().mockReturnValue(of(createResult)) };
    materialsApi = {
      list: jest
        .fn()
        .mockReturnValue(
          of({
            ok: true,
            data: { items: materials, total: 1, page: 1, limit: 100 },
          }),
        ),
    };
    productsApi = {
      list: jest
        .fn()
        .mockReturnValue(
          of({
            ok: true,
            data: { items: products, total: 1, page: 1, limit: 100 },
          }),
        ),
    };

    await TestBed.configureTestingModule({
      imports: [StockMovementFormDialogComponent],
      providers: [
        { provide: PI_DIALOG_DATA, useValue: { mode, warehouses } },
        {
          provide: PI_DIALOG_REF,
          useValue: ref as unknown as DialogRef<unknown>,
        },
        { provide: PiStockMovementsService, useValue: movementApi },
        { provide: PiMaterialsService, useValue: materialsApi },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiToastService, useValue: { success: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovementFormDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('posts a material receipt with note mapped to documentRef and separate orderId', async () => {
    await setup();
    const component = fixture.componentInstance;
    component.form.patchValue({
      materialId: 'm1',
      qty: 12,
      note: 'Накладная 42',
      orderId: 'order-1',
      zoneName: 'A-01',
    });

    await component.submit();

    expect(movementApi.create).toHaveBeenCalledWith({
      type: 'in',
      warehouseId: 'w1',
      qty: 12,
      materialId: 'm1',
      zoneName: 'A-01',
      documentRef: 'Накладная 42',
      orderId: 'order-1',
    });
    expect(ref.close).toHaveBeenCalled();
  });

  it('posts a product expense without a material target', async () => {
    await setup(undefined, 'out');
    const component = fixture.componentInstance;
    component.onTargetKindChange({
      target: { value: 'product' },
    } as unknown as Event);
    component.form.patchValue({ productId: 'p1', qty: 2 });

    await component.submit();

    expect(movementApi.create).toHaveBeenCalledWith({
      type: 'out',
      warehouseId: 'w1',
      qty: 2,
      productId: 'p1',
    });
    expect(movementApi.create.mock.calls[0][0]).not.toHaveProperty(
      'materialId',
    );
  });

  it('rejects missing XOR target and keeps API untouched', async () => {
    await setup();
    await fixture.componentInstance.submit();

    expect(movementApi.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toContain('ровно один');
  });

  it('keeps the dialog open and shows an API error', async () => {
    await setup({
      ok: false,
      error: new HttpErrorResponse({
        status: 400,
        error: { message: 'Insufficient stock' },
      }),
    });
    fixture.componentInstance.form.patchValue({ materialId: 'm1', qty: 2 });

    await fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(ref.close).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('[data-test="movement-form-error"]'),
    ).toBeTruthy();
  });
});
