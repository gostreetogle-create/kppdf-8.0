import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { StorageItemsPage } from './storage-items.page';
import { storageItemName } from './storage-items.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';

describe('StorageItemsPage (PiGroupWorkspace)', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  const baseUrl = '/api';
  const storageItemsUrl = `${baseUrl}/storage-items`;
  const warehousesUrl = `${baseUrl}/warehouses`;
  const materialsUrl = `${baseUrl}/materials`;

  const routeQuerySubject = new BehaviorSubject<{ get: (k: string) => string | null }>({
    get: () => null,
  });

  function flushInit(warehouses: unknown[] = []): void {
    httpMock
      .expectOne((r) => r.url.startsWith(storageItemsUrl) && r.method === 'GET')
      .flush({ items: [], total: 0 });
    httpMock
      .expectOne((r) => r.url.startsWith(warehousesUrl) && r.method === 'GET')
      .flush(warehouses);
    httpMock
      .expectOne((r) => r.url.startsWith(materialsUrl) && r.method === 'GET')
      .flush({ items: [] });
  }

  function flushPendingStorage(): void {
    for (const req of httpMock.match(
      (r) => r.url.startsWith(storageItemsUrl) && r.method === 'GET',
    )) {
      req.flush({ items: [], total: 0 });
    }
  }

  beforeEach(async () => {
    routeQuerySubject.next({ get: () => null });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: ActivatedRoute, useValue: { queryParamMap: routeQuerySubject.asObservable() } },
      ],
    })
      .overrideComponent(StorageItemsPage, {
        set: { imports: [PiGroupWorkspaceComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component and flushes HTTP requests', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads warehouses and builds filter chips (≤8)', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit([
      { _id: 'w1', name: 'Основной' },
      { _id: 'w2', name: 'Резервный' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      warehouses: () => unknown[];
      sectionChips: () => { id: string }[];
      useWarehouseSelect: () => boolean;
    };
    expect(comp.warehouses().length).toBe(2);
    expect(comp.useWarehouseSelect()).toBe(false);
    expect(comp.sectionChips().map((c) => c.id)).toEqual(['all', 'w1', 'w2']);
  });

  it('selectedWarehouse starts empty', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();
    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { (): string };
      activeChipId: () => string;
    };
    expect(comp.selectedWarehouse()).toBe('');
    expect(comp.activeChipId()).toBe('all');
  });

  it('listParams включает materialId из query-параметра (TZ-MATERIALS-308)', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();

    const comp = fixture.componentInstance as unknown as {
      materialId: { (): string; set: (v: string) => void };
      listParams: () => Record<string, string>;
    };
    comp.materialId.set('mat-1');
    expect(comp.materialId()).toBe('mat-1');
    expect(comp.listParams()).toEqual({ materialId: 'mat-1' });
    flushPendingStorage();
  });

  it('listParams включает warehouseId из query', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();

    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { (): string; set: (v: string) => void };
      listParams: () => Record<string, string>;
      activeChipId: () => string;
    };
    comp.selectedWarehouse.set('w1');
    expect(comp.selectedWarehouse()).toBe('w1');
    expect(comp.listParams()).toEqual({ warehouseId: 'w1' });
    expect(comp.activeChipId()).toBe('w1');
    flushPendingStorage();
  });

  it('storageItemName отображает имя материала (populated materialId)', () => {
    const name = storageItemName({
      _id: 'si1',
      warehouseId: 'w1',
      materialId: { _id: 'm1', name: 'Стекло 4мм', unit: 'м2' },
      quantity: 5,
      reservedQty: 0,
      minQuantity: 0,
      isActive: true,
    });
    expect(name).toBe('Стекло 4мм');
  });

  it('storageItemName отображает имя продукта когда materialId отсутствует', () => {
    const name = storageItemName({
      _id: 'si2',
      warehouseId: 'w1',
      productId: { _id: 'p1', name: 'Столешница' },
      quantity: 5,
      reservedQty: 0,
      minQuantity: 0,
      isActive: true,
    });
    expect(name).toBe('Столешница');
  });

  it('onWarehouseChange navigates with warehouseId query', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();

    const comp = fixture.componentInstance as unknown as {
      onWarehouseChange: (e: Event) => void;
    };
    const select = document.createElement('select');
    const opt = document.createElement('option');
    opt.value = 'w1';
    select.appendChild(opt);
    select.value = 'w1';
    comp.onWarehouseChange({ target: select } as unknown as Event);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('listParams returns empty when no warehouse selected', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();
    const comp = fixture.componentInstance as unknown as {
      listParams: () => Record<string, string>;
    };
    expect(comp.listParams()).toEqual({});
  });

  it('renders group workspace TOC in the template', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushInit();

    const rootEl = fixture.nativeElement as HTMLElement;
    expect(rootEl.querySelector('app-pi-group-workspace')).toBeTruthy();
    expect(rootEl.querySelector('[data-test="group-toc"]')).toBeTruthy();
  });
});
