import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiMaterialsService,
  PiStorageItemsService,
  type Material,
  type StorageItem,
  type Warehouse,
} from '@kppdf/data-access';
import {
  PiDialogService,
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
  type DialogRef,
} from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { MaterialFormDialogComponent } from '../registries/dialogs/material-form-dialog.component';
import { StorageAdjustDialogComponent } from './storage-adjust-dialog.component';
import {
  StoragePutOnStockDialogComponent,
  type StoragePutOnStockDialogData,
} from './storage-put-on-stock-dialog.component';

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

  describe('StoragePutOnStockDialogComponent (TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD)', () => {
    let fixture: ComponentFixture<StoragePutOnStockDialogComponent>;
    let ref: ReturnType<typeof refMock>;
    let storageApi: { createForMaterial: jest.Mock };
    let materialsApi: { list: jest.Mock };
    let dialog: { open: jest.Mock };

    const foundMaterial: Material = { _id: 'm1', name: 'Лист стальной', article: 'ЛС-40', unit: 'кг' };

    async function setup(
      data: StoragePutOnStockDialogData = { warehouses: [warehouse] },
    ): Promise<void> {
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
            of({ ok: true, data: { items: [foundMaterial], total: 1, page: 1, limit: 10 } }),
          ),
      };
      dialog = { open: jest.fn() };
      await TestBed.configureTestingModule({
        imports: [StoragePutOnStockDialogComponent],
        providers: [
          { provide: PI_DIALOG_DATA, useValue: data },
          {
            provide: PI_DIALOG_REF,
            useValue: ref as unknown as DialogRef<unknown>,
          },
          { provide: PiStorageItemsService, useValue: storageApi },
          { provide: PiMaterialsService, useValue: materialsApi },
          { provide: PiToastService, useValue: { success: jest.fn() } },
          { provide: PiDialogService, useValue: dialog },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(StoragePutOnStockDialogComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    afterEach(() => {
      fixture?.destroy();
      TestBed.resetTestingModule();
      jest.useRealTimers();
    });

    it('has no plain <select> for material — search input + accent «+» instead', async () => {
      await setup();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('#put-material')).toBeNull();
      expect(element.querySelector('[data-test="put-material-search"]')).not.toBeNull();
      const createBtn = element.querySelector('[data-test="put-material-create"]') as HTMLButtonElement;
      expect(createBtn).not.toBeNull();
      expect(createBtn.getAttribute('aria-label')).toBe('Создать материал');
    });

    it('debounced search filters by name/article and only after the min query length', async () => {
      await setup();
      jest.useFakeTimers();

      fixture.componentInstance.onMaterialQuery('л');
      expect(materialsApi.list).not.toHaveBeenCalled();

      fixture.componentInstance.onMaterialQuery('лист');
      jest.advanceTimersByTime(299);
      expect(materialsApi.list).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(materialsApi.list).toHaveBeenCalledWith({ search: 'лист', limit: 10 });
    });

    it('picking a search result shows the chip and posts the live put-on-stock payload', async () => {
      await setup();
      jest.useFakeTimers();

      fixture.componentInstance.onMaterialQuery('лист');
      jest.advanceTimersByTime(300);
      jest.useRealTimers();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      const element = fixture.nativeElement as HTMLElement;
      (
        element.querySelector('[data-test="put-material-pick-m1"]') as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(element.querySelector('[data-test="put-material-chip"]')?.textContent).toContain(
        'Лист стальной',
      );
      expect(element.querySelector('[data-test="put-material-search"]')).toBeNull();

      const quantity = element.querySelector('[data-test="put-quantity"]') as HTMLInputElement;
      quantity.value = '12';
      quantity.dispatchEvent(new Event('input'));
      const minimum = element.querySelector('[data-test="put-minimum"]') as HTMLInputElement;
      minimum.value = '5';
      minimum.dispatchEvent(new Event('input'));
      const zone = element.querySelector('[data-test="put-zone"]') as HTMLInputElement;
      zone.value = 'A-01';
      zone.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      (element.querySelector('[data-test="put-submit"]') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(storageApi.createForMaterial).toHaveBeenCalledWith('m1', {
        warehouseId: 'w1',
        quantity: 12,
        minQuantity: 5,
        zoneName: 'A-01',
      });
      expect(ref.close).toHaveBeenCalledWith(baseItem);
    });

    it('clearing a picked material restores the search field', async () => {
      await setup();
      fixture.componentInstance.pickMaterial(foundMaterial);
      fixture.detectChanges();

      (
        fixture.nativeElement.querySelector('[data-test="put-material-clear"]') as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.materialId()).toBeNull();
      expect(
        fixture.nativeElement.querySelector('[data-test="put-material-search"]'),
      ).not.toBeNull();
    });

    it('deep-linked materialId/materialName prefill the chip without requiring a search', async () => {
      await setup({ warehouses: [warehouse], materialId: 'm9', materialName: 'Профиль 40x40' });

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('[data-test="put-material-chip"]')?.textContent).toContain(
        'Профиль 40x40',
      );
      expect(fixture.componentInstance.materialId()).toBe('m9');
    });

    it('accent «+» opens MaterialFormDialog and auto-selects the created material', async () => {
      await setup();
      const created: Material = { _id: 'm7', name: 'Уголок 25x25', unit: 'шт' };
      const closed = signal<Material | null | undefined>(undefined);
      const dialogRef = { closed } as unknown as DialogRef<Material | null | undefined>;
      dialog.open.mockReturnValue(dialogRef);

      (
        fixture.nativeElement.querySelector('[data-test="put-material-create"]') as HTMLButtonElement
      ).click();

      expect(dialog.open).toHaveBeenCalledWith(
        MaterialFormDialogComponent,
        expect.objectContaining({ data: { mode: 'create', allowKindSelect: true } }),
      );

      closed.set(created);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.componentInstance.materialId()).toBe('m7');
      expect(
        fixture.nativeElement.querySelector('[data-test="put-material-chip"]')?.textContent,
      ).toContain('Уголок 25x25');
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
