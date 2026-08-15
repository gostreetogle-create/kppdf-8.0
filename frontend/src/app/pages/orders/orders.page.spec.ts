import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { OrdersPage } from './orders.page';
import { OrdersService, Order } from './orders.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('OrdersPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/orders`;
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const queryParamSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({
    get: () => null,
  });

  const fakeOrders: Order[] = [
    {
      _id: 'o1',
      number: 'ORD-001',
      status: 'draft',
      priority: 'normal',
      items: [],
      createdAt: '2026-01-01',
    } as Order,
    {
      _id: 'o2',
      number: 'ORD-002',
      status: 'confirmed',
      priority: 'high',
      items: [],
      createdAt: '2026-01-02',
    } as Order,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    queryParamSubject.next({ get: () => null });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([{ path: 'orders/:id', children: [] }]),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamSubject.asObservable() } },
        {
          provide: OrdersService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fires an initial GET /api/orders on creation', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Order[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no orders', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => Order[];
      total: () => number;
    };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('applies an initial ?q= to the existing search filter', async () => {
    queryParamSubject.next({ get: (key) => (key === 'q' ? 'ORD-002' : null) });
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: () => string;
      filteredRows: () => Order[];
    };
    expect(comp.searchQuery()).toBe('ORD-002');
    expect(comp.filteredRows().map((row) => row.number)).toEqual(['ORD-002']);
  });

  it('clears the deep-link filter when q is removed', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeOrders);
    await tickMicrotask();
    fixture.detectChanges();

    queryParamSubject.next({ get: (key) => (key === 'q' ? 'ORD-002' : null) });
    fixture.detectChanges();
    queryParamSubject.next({ get: () => null });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      searchQuery: () => string;
      filteredRows: () => Order[];
    };
    expect(comp.searchQuery()).toBe('');
    expect(comp.filteredRows()).toHaveLength(2);
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('HUB-302 defines operational columns without commercial total', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      cols: { key: string; label: string }[];
    };
    expect(comp.cols.map((col) => col.key)).toEqual([
      'number',
      'date',
      'counterpartyId',
      'siteId',
      'status',
      'priority',
      'items',
      'quotationId',
      'readyForWork',
    ]);
    expect(comp.cols.map((col) => col.label)).not.toContain('Сумма');
  });

  it('HUB-302 calculates X/Y readiness and honest empty state', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      readinessLabel: (row: Order) => string;
    };
    expect(
      comp.readinessLabel({
        _id: 'o1',
        number: 'ORD-1',
        status: 'draft',
        items: [
          { productId: 'p1', quantity: 1, unitPrice: 0, readyForWork: true },
          { productId: 'p2', quantity: 1, unitPrice: 0 },
        ],
      }),
    ).toBe('1 из 2');
    expect(comp.readinessLabel({ _id: 'o2', number: 'ORD-2', status: 'draft', items: [] })).toBe(
      '—',
    );
  });

  it('HUB-302 renders read-only Deal/Composition expand and supports keyboard toggle', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      {
        ...fakeOrders[0],
        counterpartyId: { _id: 'cp1', name: 'ООО Заказчик' },
        siteId: { _id: 'site1', name: 'Цех', address: 'ул. Мира, 1' },
        quotationId: { _id: 'q1', number: 'QTN-1', isStub: true },
        items: [{ productId: 'p1', productName: 'Изделие', quantity: 2, unitPrice: 0 }],
      },
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('[data-test="table-row-o1"]') as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.getAttribute('aria-expanded')).toBe('false');

    const link = fixture.nativeElement.querySelector('[data-test="order-link-o1"]') as HTMLElement;
    link.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-content"]')).toBeFalsy();

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-content"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-deal-block"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="order-composition-block"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('ООО Заказчик');
    expect(fixture.nativeElement.textContent).toContain('Изделие');
    expect(dialogSpy.open).not.toHaveBeenCalled();

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });

  it('HUB-302 toggles one read-only expansion and does not call write services', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      expandedId: () => string | null;
      onRowClick: (row: Order) => void;
      proposalLabelOf: (row: Order) => string;
    };
    const row: Order = {
      _id: 'o1',
      number: 'ORD-1',
      status: 'draft',
      quotationId: { _id: 'q1', number: 'QTN-1', isStub: true },
      items: [{ productId: 'p1', productName: 'Изделие', quantity: 2, unitPrice: 0 }],
    };

    comp.onRowClick(row);
    expect(comp.expandedId()).toBe('o1');
    expect(comp.proposalLabelOf(row)).toBe('№QTN-1 · заглушка');
    comp.onRowClick(row);
    expect(comp.expandedId()).toBeNull();
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });
});
