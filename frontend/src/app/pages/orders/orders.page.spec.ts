import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { OrdersPage } from './orders.page';
import { OrdersService, Order } from './orders.service';
import { CounterpartyService } from '../../shared/services/pi-counterparty.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * Spec v3 — TZ-232.D sentinel #3. The page's `localAdapter.list()` is
 * SYNCHRONOUS (`of({ok: true, data: ...})`), so we delegate HTTP-
 * resource mocking to the wrapper's TestBed registers — there is no
 * outgoing HTTP request that needs flushing in this spec layer.
 */
describe('OrdersPage (post-TZ-232.D sentinel #3 v3)', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({ closed: of(undefined) }) };
  const routerSpy = { navigate: jest.fn().mockResolvedValue(true) };

  const fakeOrders: Order[] = [
    {
      _id: 'o1',
      number: 'ORD-001',
      status: 'draft',
      priority: 'normal',
      items: [],
      date: '2026-01-01',
      counterpartyId: 'cp1',
    } as Order,
    {
      _id: 'o2',
      number: 'ORD-002',
      status: 'confirmed',
      priority: 'high',
      items: [],
      date: '2026-01-02',
      counterpartyId: 'cp2',
    } as Order,
  ];

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    routerSpy.navigate.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: OrdersService,
          useValue: {
            list: () => of({ ok: true, data: fakeOrders }),
            findById: (id: string) => of({ ok: true, data: { _id: id } as Order }),
            create: (p: Partial<Order>) => of({ ok: true, data: { ...p, _id: 'new' } as Order }),
            update: (id: string, p: Partial<Order>) =>
              of({ ok: true, data: { _id: id, ...p } as Order }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: CounterpartyService,
          useValue: { list: () => of({ ok: true, data: { items: [], total: 0 } }) },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(OrdersPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('mounts cleanly with no errors', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has a localAdapter that emits the wrapper-expected envelope shape', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      localAdapter: { list: (p: { page: number; limit: number }) => { subscribe: (fn: (v: unknown) => void) => unknown } };
    };
    let captured: unknown = undefined;
    comp.localAdapter?.list({ page: 1, limit: 20, search: '' }).subscribe((v) => {
      captured = v;
    });
    // Synchronous `of()` should have captured a SilentResult envelope.
    expect(captured).toBeDefined();
  });

  it('create button triggers openCreate dialog', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('onCreateDocument navigates to /doc-constructor/builder with source params', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onCreateDocument: (row: Order) => void;
    };
    comp.onCreateDocument(fakeOrders[0]);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/doc-constructor/builder'], {
      queryParams: { source: 'order', sourceId: 'o1' },
    });
  });

  it('onDelete opens destructive AlertDialogComponent', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { onDelete: (row: Order) => void };
    comp.onDelete(fakeOrders[0]);

    expect(dialogSpy.open).toHaveBeenCalled();
    const lastCall = dialogSpy.open.mock.calls[dialogSpy.open.mock.calls.length - 1];
    const opts = lastCall?.[1] as { data?: { variant?: string } } | undefined;
    expect(opts?.data?.variant).toBe('destructive');
  });

  it('onSortChange mirrors pi-table emits into page sortKey/sortDir signals', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onSortChange: (event: { key: string; dir: 'asc' | 'desc' | null }) => void;
      sortKeySig: () => string | null;
      sortDirSig: () => string | null;
    };
    comp.onSortChange({ key: 'total', dir: 'asc' });
    expect(comp.sortKeySig()).toBe('total');
    expect(comp.sortDirSig()).toBe('asc');
    comp.onSortChange({ key: 'total', dir: null });
    expect(comp.sortKeySig()).toBeNull();
  });
});
