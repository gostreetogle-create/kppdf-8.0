import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PiStorageItemsService, PiWarehousesService, type Warehouse } from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { WarehousesPage } from './warehouses.page';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog.component';

describe('WarehousesPage (W1)', () => {
  let fixture: ComponentFixture<WarehousesPage>;
  let api: { list: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock; setDefault: jest.Mock };
  let storageItemsApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };

  const rows: Warehouse[] = [
    { _id: 'w1', name: 'Металл', type: 'main', isActive: true, isDefault: true },
    { _id: 'w2', name: 'Дерево', type: 'main', isActive: false, description: 'Листовые материалы' },
  ];

  beforeEach(async () => {
    api = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      setDefault: jest.fn().mockReturnValue(of({ ok: true, data: rows[1] })),
    };
    storageItemsApi = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [], total: 0 } })),
    };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [WarehousesPage],
      providers: [
        provideRouter([]),
        { provide: PiWarehousesService, useValue: api },
        { provide: PiStorageItemsService, useValue: storageItemsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WarehousesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads, searches by name, and renders active state', () => {
    expect(fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]').length).toBe(2);
    const search = fixture.nativeElement.querySelector('[data-test="warehouse-search"]') as HTMLInputElement;
    search.value = 'металл';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Активен');
  });

  it('opens create and delete confirmation actions', () => {
    const ref = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    (fixture.nativeElement.querySelector('[data-test="warehouse-create"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(WarehouseFormDialogComponent, expect.objectContaining({ data: {} }));
    (fixture.nativeElement.querySelector('[data-test="warehouse-delete"]') as HTMLButtonElement).click();
    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.any(Object));
  });

  it('shows the default badge only for the default row and makes another row default on click', async () => {
    expect(fixture.nativeElement.querySelectorAll('[data-test="warehouse-default-badge"]').length).toBe(1);
    const makeDefaultButtons = fixture.nativeElement.querySelectorAll(
      '[data-test="warehouse-make-default"]',
    );
    expect(makeDefaultButtons.length).toBe(1);

    (makeDefaultButtons[0] as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(api.setDefault).toHaveBeenCalledWith('w2');
    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('shows a ▸/▾ chevron and expands a preview of storage items on row click (TZ-NX-HUB-04)', async () => {
    storageItemsApi.list.mockReturnValue(
      of({
        ok: true,
        data: { items: [{ _id: 'si1', warehouseId: 'w1', name: 'Профиль 40x40', quantity: 12, reservedQty: 0, minQuantity: 0, isActive: true }], total: 1 },
      }),
    );
    const row = fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]')[0] as HTMLElement;
    expect(row.querySelector('[data-test="warehouse-row-chevron"]')?.textContent?.trim()).toBe('▸');
    expect(fixture.nativeElement.querySelector('[data-test="warehouse-row-expand"]')).toBeFalsy();

    row.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(storageItemsApi.list).toHaveBeenCalledWith({ warehouseId: 'w1' });
    expect(row.querySelector('[data-test="warehouse-row-chevron"]')?.textContent?.trim()).toBe('▾');
    const expandEl = fixture.nativeElement.querySelector('[data-test="warehouse-row-expand"]') as HTMLElement;
    expect(expandEl.textContent).toContain('Профиль 40x40');
    expect(expandEl.textContent).toContain('12');

    row.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="warehouse-row-expand"]')).toBeFalsy();
  });

  it('shows an honest empty state when the warehouse has no storage items', async () => {
    const row = fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]')[0] as HTMLElement;
    row.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const expandEl = fixture.nativeElement.querySelector('[data-test="warehouse-row-expand"]') as HTMLElement;
    expect(expandEl.textContent).toContain('Нет остатков');
  });

  it('the "Все остатки склада" chip deep-links to /storage-items with warehouseId (TZ-NX-HUB-04)', async () => {
    const row = fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]')[0] as HTMLElement;
    row.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[data-test="warehouse-expand-all-link"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/storage-items?warehouseId=w1');
  });

  it('does not toggle expand when clicking a row action (stopPropagation)', async () => {
    const ref = { closed: () => undefined } as unknown as DialogRef<unknown>;
    dialog.open.mockReturnValue(ref);
    const editButtons = fixture.nativeElement.querySelectorAll('[data-test="warehouse-edit"]');
    (editButtons[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelectorAll('[data-test="warehouse-row"]')[0] as HTMLElement;
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });

  it('has no wide text buttons for edit/delete/make-default (icon actions only, TZ-NX-HUB-04)', () => {
    const table = fixture.nativeElement.querySelector('[data-test="warehouses-table"]') as HTMLElement;
    expect(table.textContent).not.toContain('Изменить');
    expect(table.textContent).not.toContain('Удалить');
    expect(table.textContent).not.toContain('Сделать по умолчанию');
  });
});
