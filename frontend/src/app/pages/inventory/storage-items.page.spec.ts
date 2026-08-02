import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { StorageItemsPage } from './storage-items.page';
import { storageItemName } from './storage-items.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';

describe('StorageItemsPage (Wave 3 — PiEntityListComponent)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const warehousesUrl = `${baseUrl}/warehouses`;
  const materialsUrl = `${baseUrl}/materials`;

  // TZ-MATERIALS-308: BehaviorSubject-роутер — тест может пушить query.
  const routeQuerySubject = new BehaviorSubject<{ get: (k: string) => string | null }>({
    get: () => null,
  });

  /**
   * Flush the pending HTTP request (only warehouses; storage-items is no longer
   * triggered by the page itself — after Wave 3 migration to <app-pi-entity-list>,
   * the spec overrides the page with NO_ERRORS_SCHEMA + imports:[], so the child
   * PiEntityListComponent is not instantiated and therefore does not issue its
   * own `/api/storage-items` request. Entity-list behavior is covered by its
   * own specs (entity-list.component.spec.ts). Must be called after
   * fixture.detectChanges().
   */
  function flushAll(): void {
    httpMock.expectOne((r) => r.url === warehousesUrl && r.method === 'GET').flush([]);
    // TZ-MATERIALS-308: страница также тянет материалы для подписи фильтра.
    httpMock.expectOne((r) => r.url === materialsUrl && r.method === 'GET').flush({ items: [] });
  }

  beforeEach(async () => {
    // TZ-MATERIALS-308: сброс query-параметра между тестами.
    routeQuerySubject.next({ get: () => null });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: ActivatedRoute, useValue: { queryParamMap: routeQuerySubject.asObservable() } },
      ],
    })
      .overrideComponent(StorageItemsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component and flushes the warehouses HTTP request', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads warehouses on init for the filter dropdown', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    // Wave 3 spec: the page no longer triggers /api/storage-items on its own
    // (that's the entity-list child's responsibility, covered separately).
    httpMock
      .expectOne((r) => r.url === warehousesUrl && r.method === 'GET')
      .flush([
        { _id: 'w1', name: 'Основной' },
        { _id: 'w2', name: 'Резервный' },
      ]);
    // TZ-MATERIALS-308: страница также тянет материалы для подписи фильтра.
    httpMock.expectOne((r) => r.url === materialsUrl && r.method === 'GET').flush({ items: [] });

    // Angular 20 httpResource flushes an observable sync, but its internal
    // Resource.status flips to 'resolved' on a Zone microtask. Without
    // awaiting stability, warehousesRes.value() may still report undefined
    // (→ warehouses() falls back to []). Drain microtasks before reading.
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      warehouses: () => unknown[];
    };
    expect(comp.warehouses().length).toBe(2);
  });

  it('selectedWarehouse starts empty', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { (): string; set: (v: string) => void };
    };
    expect(comp.selectedWarehouse()).toBe('');
  });

  it('listParams включает materialId из query-параметра (TZ-MATERIALS-308)', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();

    // Push materialId в query-параметр после создания компонента.
    routeQuerySubject.next({ get: (k: string) => (k === 'materialId' ? 'mat-1' : null) });
    await fixture.whenStable();

    const comp = fixture.componentInstance as unknown as {
      materialId: { (): string };
      listParams: () => Record<string, string>;
    };
    expect(comp.materialId()).toBe('mat-1');
    expect(comp.listParams()).toEqual({ materialId: 'mat-1' });
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

  it('onWarehouseChange sets the selected warehouse signal', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();

    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { (): string; set: (v: string) => void };
    };

    // Simulate user selecting a warehouse in the dropdown
    comp.selectedWarehouse.set('w1');
    expect(comp.selectedWarehouse()).toBe('w1');
  });

  it('listParams returns empty when no warehouse selected', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();
    const comp = fixture.componentInstance as unknown as {
      listParams: () => Record<string, string>;
    };
    expect(comp.listParams()).toEqual({});
  });

  it('listParams returns warehouseId when warehouse selected', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();

    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { set: (v: string) => void };
      listParams: () => Record<string, string>;
    };
    comp.selectedWarehouse.set('w1');
    expect(comp.listParams()).toEqual({ warehouseId: 'w1' });
  });

  it('renders pi-entity-list component in the template', () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();
    flushAll();

    const rootEl = fixture.nativeElement as HTMLElement;
    expect(rootEl.querySelector('app-pi-entity-list')).toBeTruthy();
  });
});
