import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiMaterialsService,
  PiStorageItemsService,
  type StorageItem,
  type Warehouse,
} from '@kppdf/data-access';
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { StorageAdjustDialogComponent } from './storage-adjust-dialog.component';
import { StoragePutOnStockDialogComponent } from './storage-put-on-stock-dialog.component';

describe('Warehouse W2 dialogs', () => {
  const warehouse: Warehouse = {
    _id: 'w1',
    name: 'Металл',
    type: 'main',
    isActive: true,
  };
  const baseItem: StorageItem = {
    _id: 'si1',
    warehouseId: 'w1',
    warehouse,
    materialId: { _id: 'm1', name: 'Лист стальной' },
    quantity: 10,
    reservedQty: 0,
    minQuantity: 3,
    isActive: true,
  };

  function makeItem(overrides: Partial<StorageItem> = {}): StorageItem {
    return { ...baseItem, ...overrides };
  }

  function refMock(): { closed: ReturnType<typeof signal>; close: jest.Mock } {
    return { closed: signal<unknown>(undefined), close: jest.fn() };
  }

  describe('StoragePutOnStockDialogComponent', () => {
    let fixture: ComponentFixture<StoragePutOnStockDialogComponent>;
    let ref: ReturnType<typeof refMock>;
    let storageApi: { createForMaterial: jest.Mock };
    let materialsApi: { list: jest.Mock };

    beforeEach(async () => {
      ref = refMock();
      storageApi = {
        createForMaterial: jest
          .fn()
          .mockReturnValue(of({ ok: true, data: baseItem })),
      };
      materialsApi = {
        list: jest
          .fn()
          .mockReturnValue(
            of({
              ok: true,
              data: {
                items: [{ _id: 'm1', name: 'Лист стальной', unit: 'кг' }],
                total: 1,
                page: 1,
                limit: 100,
              },
            }),
          ),
      };
      await TestBed.configureTestingModule({
        imports: [StoragePutOnStockDialogComponent],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: { warehouses: [warehouse] } },
          {
            provide: PI_DIALOG_REF,
            useValue: ref as unknown as DialogRef<unknown>,
          },
          { provide: PiStorageItemsService, useValue: storageApi },
          { provide: PiMaterialsService, useValue: materialsApi },
          { provide: PiToastService, useValue: { success: jest.fn() } },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(StoragePutOnStockDialogComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture?.destroy();
      TestBed.resetTestingModule();
    });

    it('selects a material and posts the live put-on-stock payload', async () => {
      const element = fixture.nativeElement as HTMLElement;
      const material = element.querySelector(
        '[data-test="put-material"]',
      ) as HTMLSelectElement;
      material.value = 'm1';
      material.dispatchEvent(new Event('change'));
      const quantity = element.querySelector(
        '[data-test="put-quantity"]',
      ) as HTMLInputElement;
      quantity.value = '12';
      quantity.dispatchEvent(new Event('input'));
      const minimum = element.querySelector(
        '[data-test="put-minimum"]',
      ) as HTMLInputElement;
      minimum.value = '5';
      minimum.dispatchEvent(new Event('input'));
      const zone = element.querySelector(
        '[data-test="put-zone"]',
      ) as HTMLInputElement;
      zone.value = 'A-01';
      zone.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      (
        element.querySelector('[data-test="put-submit"]') as HTMLButtonElement
      ).click();
      await fixture.whenStable();

      expect(storageApi.createForMaterial).toHaveBeenCalledWith('m1', {
        warehouseId: 'w1',
        quantity: 12,
        minQuantity: 5,
        zoneName: 'A-01',
      });
      expect(ref.close).toHaveBeenCalledWith(baseItem);
    });
  });

  describe('StorageAdjustDialogComponent', () => {
    let fixture: ComponentFixture<StorageAdjustDialogComponent>;
    let ref: ReturnType<typeof refMock>;
    let storageApi: { adjust: jest.Mock };

    beforeEach(async () => {
      ref = refMock();
      storageApi = {
        adjust: jest
          .fn()
          .mockReturnValue(of({ ok: true, data: makeItem({ quantity: 8 }) })),
      };
      await TestBed.configureTestingModule({
        imports: [StorageAdjustDialogComponent],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: { item: baseItem } },
          {
            provide: PI_DIALOG_REF,
            useValue: ref as unknown as DialogRef<unknown>,
          },
          { provide: PiStorageItemsService, useValue: storageApi },
          { provide: PiToastService, useValue: { success: jest.fn() } },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(StorageAdjustDialogComponent);
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture?.destroy();
      TestBed.resetTestingModule();
    });

    it('posts a negative delta and closes with the reduced server quantity', async () => {
      const element = fixture.nativeElement as HTMLElement;
      const delta = element.querySelector(
        '[data-test="adjust-delta"]',
      ) as HTMLInputElement;
      delta.value = '-2';
      delta.dispatchEvent(new Event('input'));
      const reason = element.querySelector(
        '[data-test="adjust-reason"]',
      ) as HTMLTextAreaElement;
      reason.value = 'Инвентаризация';
      reason.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(
        element.querySelector('[data-test="adjust-preview"]')?.textContent,
      ).toContain('8');
      (
        element.querySelector(
          '[data-test="adjust-submit"]',
        ) as HTMLButtonElement
      ).click();
      await fixture.whenStable();

      expect(storageApi.adjust).toHaveBeenCalledWith('si1', {
        delta: -2,
        reason: 'Инвентаризация',
      });
      expect(ref.close).toHaveBeenCalledWith(makeItem({ quantity: 8 }));
    });
  });
});
