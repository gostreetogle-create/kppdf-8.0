import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';

import { DashboardPage } from './dashboard.page';
import { Order } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-SWEEP-401 — write-path Канбана:
 *  - дроп в операционные колонки (draft…ready) → PATCH {status}
 *  - дроп в «Отгружены» → confirm → POST /orders/:id/ship (не PATCH)
 *  - ok:false → карточка возвращается в исходную колонку + toast
 *
 * httpResource sync contract — см. materials.page.spec.ts: GET уходит через
 * flushEffects(), value() обновляется после tickMicrotask().
 */

const baseUrl = '/api';
const listUrl = `${baseUrl}/orders`;

function orderOf(overrides: Partial<Order> = {}): Order {
  return {
    _id: 'o1',
    number: 'ORD-1',
    status: 'in_production',
    counterpartyId: 'cp1',
    siteId: 'site1',
    priority: 'normal',
    items: [],
    ...overrides,
  };
}

function dropEvent(previousData: Order[], containerId: string): CdkDragDrop<Order[]> {
  return {
    previousIndex: 0,
    currentIndex: 0,
    item: {} as CdkDrag<Order[]>,
    container: { id: containerId, data: [] as Order[] } as unknown as CdkDragDrop<
      Order[]
    >['container'],
    previousContainer: { data: previousData } as unknown as CdkDragDrop<
      Order[]
    >['previousContainer'],
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
  } as CdkDragDrop<Order[]>;
}

/** DialogRef, закрытый значением заранее — onDialogCloseOnce сработает на первом эффекте. */
function closedDialogRef(value: unknown): DialogRef<boolean> {
  const v = signal<unknown>(value);
  return {
    closed: computed(() => v()),
    close: (x?: unknown) => v.set(x),
  } as unknown as DialogRef<boolean>;
}

describe('DashboardPage (TZ-SWEEP-401)', () => {
  let httpMock: HttpTestingController;
  let dialog: { open: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };

  async function flushInitial(orders: Order[]): Promise<void> {
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    req.flush(orders);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialog = { open: jest.fn() };
    toast = { error: jest.fn(), success: jest.fn() };
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(DashboardPage, {
        set: { imports: [DatePipe], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('drop in «Готовы» PATCHes {status: ready} and applies the server order', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const order = orderOf({ status: 'in_production' });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropOrder: (e: CdkDragDrop<Order[]>) => void;
      data: () => Order[];
    };
    page.dropOrder(dropEvent([order], 'ready'));

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/orders/o1` && r.method === 'PATCH');
    expect(req.request.body).toEqual({ status: 'ready' });
    req.flush(orderOf({ status: 'ready' }));

    expect(page.data()[0].status).toBe('ready');
  });

  it('drop in «Отгружены» asks confirm and POSTs /orders/:id/ship (never PATCH)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const order = orderOf({ status: 'ready' });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropOrder: (e: CdkDragDrop<Order[]>) => void;
      data: () => Order[];
    };
    dialog.open.mockReturnValue(closedDialogRef(true));
    page.dropOrder(dropEvent([order], 'shipped'));

    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.anything());
    expect((dialog.open.mock.calls[0]![1] as { data?: { title?: string } }).data?.title).toContain(
      'ORD-1',
    );

    // onDialogCloseOnce → ship() уходит после flush эффектов.
    TestBed.flushEffects();
    const shipReq = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/ship` && r.method === 'POST',
    );
    expect(shipReq.request.body).toEqual({});
    shipReq.flush(orderOf({ status: 'shipped' }));

    expect(
      httpMock.match((r) => r.url === `${baseUrl}/orders/o1` && r.method === 'PATCH'),
    ).toHaveLength(0);
    expect(page.data()[0].status).toBe('shipped');
  });

  it('confirm-cancel keeps the card in its column (no ship, no PATCH)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const order = orderOf({ status: 'ready' });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropOrder: (e: CdkDragDrop<Order[]>) => void;
      data: () => Order[];
    };
    dialog.open.mockReturnValue(closedDialogRef(undefined)); // Cancel
    page.dropOrder(dropEvent([order], 'shipped'));

    TestBed.flushEffects();
    expect(httpMock.match((r) => r.method === 'POST' || r.method === 'PATCH')).toHaveLength(0);
    expect(page.data()[0].status).toBe('ready');
  });

  it('ok:false on PATCH rolls the card back to the original column and toasts', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const order = orderOf({ status: 'in_production' });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropOrder: (e: CdkDragDrop<Order[]>) => void;
      data: () => Order[];
    };
    page.dropOrder(dropEvent([order], 'ready'));

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/orders/o1` && r.method === 'PATCH');
    req.flush(
      { message: 'Отгрузка — через действие «Отгрузить»; отмена — «Отменить заказ».' },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    expect(toast.error).toHaveBeenCalledWith(
      'Отгрузка — через действие «Отгрузить»; отмена — «Отменить заказ».',
    );
    expect(page.data()[0].status).toBe('in_production');
  });

  it('readinessLabel counts item.status ∈ {ready, shipped}, never readyForWork', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const page = fixture.componentInstance as unknown as {
      readinessLabel: (o: Order) => string;
    };
    void httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');

    const mixed: Order = orderOf({
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 1, status: 'ready' },
        { productId: 'p2', quantity: 1, unitPrice: 1, status: 'shipped' },
        // readyForWork=true НЕ считается на Канбане (гейт /orders, HUB-304).
        { productId: 'p3', quantity: 1, unitPrice: 1, readyForWork: true },
        { productId: 'p4', quantity: 1, unitPrice: 1 },
      ],
    });
    expect(page.readinessLabel(mixed)).toBe('2 из 4');
  });
});
