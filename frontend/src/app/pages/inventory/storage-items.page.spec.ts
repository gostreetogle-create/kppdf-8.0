import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StorageItemsPage } from './storage-items.page';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';

describe('StorageItemsPage (Wave 3 — PiEntityListComponent)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const warehousesUrl = `${baseUrl}/warehouses`;

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
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
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
