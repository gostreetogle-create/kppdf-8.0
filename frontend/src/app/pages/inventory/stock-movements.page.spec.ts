import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { StockMovementsPage } from './stock-movements.page';
import { StockMovementsService, StockMovement } from './stock-movements.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('StockMovementsPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/stock-movements`;

  const fakeMovements: StockMovement[] = [
    {
      _id: 'sm1',
      type: 'in',
      qty: 10,
      date: '2026-01-01',
      productId: 'p1',
      warehouseId: 'w1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StockMovement,
    {
      _id: 'sm2',
      type: 'out',
      qty: 5,
      date: '2026-01-02',
      productId: 'p1',
      warehouseId: 'w1',
      product: { _id: 'p1', name: 'ДСП' },
      warehouse: { _id: 'w1', name: 'Основной' },
    } as StockMovement,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url.startsWith(listUrl) && r.method === 'GET';

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
          provide: StockMovementsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            create: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(StockMovementsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/stock-movements on creation', async () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: fakeMovements, total: 2 });
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => StockMovement[];
      totalItems: () => number;
      loading: () => boolean;
    };

    expect(comp.items().length).toBe(2);
    expect(comp.totalItems()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no movements', async () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: [], total: 0 });
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      items: () => StockMovement[];
      totalItems: () => number;
    };
    expect(comp.items().length).toBe(0);
    expect(comp.totalItems()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('clearFilters resets selected type', async () => {
    const fixture = TestBed.createComponent(StockMovementsPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush({ items: fakeMovements, total: 2 });
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      selectedType: { set: (v: string) => void };
      clearFilters: () => void;
    };

    comp.selectedType.set('in');
    comp.clearFilters();
    expect(comp.selectedType()).toBe('');
  });
});
