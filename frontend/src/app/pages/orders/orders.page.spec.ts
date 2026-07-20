import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

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

  const fakeOrders: Order[] = [
    { _id: 'o1', number: 'ORD-001', status: 'draft', priority: 'normal', items: [], createdAt: '2026-01-01' } as Order,
    { _id: 'o2', number: 'ORD-002', status: 'confirmed', priority: 'high', items: [], createdAt: '2026-01-02' } as Order,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

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
        { provide: PiDialogService, useValue: { open: () => ({} as never) } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(OrdersPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

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

    const comp = fixture.componentInstance as unknown as { data: () => Order[]; total: () => number };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });
});
