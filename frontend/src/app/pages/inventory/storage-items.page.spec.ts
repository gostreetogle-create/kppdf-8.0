import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { StorageItemsPage } from './storage-items.page';
import { StorageItemsService, StorageItem } from './storage-items.service';
import { WarehousesService } from './warehouses.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('StorageItemsPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const storageUrl = `${baseUrl}/storage-items`;
  const warehousesUrl = `${baseUrl}/warehouses`;

  const fakeItems: StorageItem[] = [
    {
      _id: 'si1',
      quantity: 100,
      reservedQty: 0,
      minQuantity: 10,
      isActive: true,
      warehouseId: 'w1',
      productId: 'p1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StorageItem,
    {
      _id: 'si2',
      quantity: 50,
      reservedQty: 10,
      minQuantity: 20,
      isActive: true,
      warehouseId: 'w1',
      productId: 'p2',
      product: { _id: 'p2', name: 'ЛДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StorageItem,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url.startsWith(storageUrl) && r.method === 'GET';

  const matchWarehousesGet = (r: { url: string; method: string }): boolean =>
    r.url === warehousesUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: StorageItemsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: WarehousesService,
          useValue: { list: () => of({ ok: true, data: [] }) },
        },
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

  it('fires an initial GET /api/storage-items on creation', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: fakeItems, total: 2 });
    httpMock.expectOne(matchWarehousesGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => StorageItem[];
      totalItems: () => number;
      loading: () => boolean;
    };

    expect(comp.items().length).toBe(2);
    expect(comp.totalItems()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    httpMock.expectOne(matchWarehousesGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no storage items', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    httpMock.expectOne(matchWarehousesGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => StorageItem[];
      totalItems: () => number;
    };
    expect(comp.items().length).toBe(0);
    expect(comp.totalItems()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    httpMock.expectOne(matchWarehousesGet).flush([]);
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('clearFilters resets selected warehouse', async () => {
    const fixture = TestBed.createComponent(StorageItemsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: fakeItems, total: 2 });
    httpMock.expectOne(matchWarehousesGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      selectedWarehouse: { set: (v: string) => void };
      clearFilters: () => void;
    };

    comp.selectedWarehouse.set('w1');
    comp.clearFilters();
    expect(comp.selectedWarehouse()).toBe('');
  });
});
