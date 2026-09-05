import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PiWarehousesService, type Warehouse } from '@kppdf/data-access';
import { AlertDialogComponent, PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { WarehousesPage } from './warehouses.page';
import { WarehouseFormDialogComponent } from './warehouse-form-dialog.component';

describe('WarehousesPage (W1)', () => {
  let fixture: ComponentFixture<WarehousesPage>;
  let api: { list: jest.Mock; create: jest.Mock; update: jest.Mock; remove: jest.Mock };
  let dialog: { open: jest.Mock };

  const rows: Warehouse[] = [
    { _id: 'w1', name: 'Металл', type: 'main', isActive: true },
    { _id: 'w2', name: 'Дерево', type: 'main', isActive: false, description: 'Листовые материалы' },
  ];

  beforeEach(async () => {
    api = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: rows })),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [WarehousesPage],
      providers: [
        { provide: PiWarehousesService, useValue: api },
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
});
