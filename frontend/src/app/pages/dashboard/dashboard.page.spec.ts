import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideRouter, Router } from '@angular/router';

import {
  CombineItemCard,
  CombineColumn,
  CombineModuleDrag,
  CombineModuleRow,
  COMBINE_CHIP_DRAG_PREVIEW_CLASS,
  DashboardPage,
} from './dashboard.page';
import { BoardLane, ModuleLane, Order, OrderItem } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { DashboardDialogService } from '../../shared/services/dashboard-dialog.service';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-COMBINE-404 — item cards by boardLane + filter.
 * TZ-COMBINE-405 — CDK DnD → patchLane; freeze on first shop; ship-whole gate.
 */

const baseUrl = '/api';
const listUrl = `${baseUrl}/orders`;

function itemOf(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    productId: 'p1',
    productName: 'Изделие А',
    quantity: 2,
    unit: 'шт',
    unitPrice: 100,
    ...overrides,
  };
}

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

function dropEvent(card: CombineItemCard, targetLane: BoardLane): CdkDragDrop<BoardLane> {
  return {
    previousIndex: 0,
    currentIndex: 0,
    item: { data: card } as CdkDrag<CombineItemCard>,
    container: {
      id: targetLane,
      data: targetLane,
    } as unknown as CdkDragDrop<BoardLane>['container'],
    previousContainer: {
      id: card.boardLane,
      data: card.boardLane,
    } as unknown as CdkDragDrop<BoardLane>['previousContainer'],
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
  } as CdkDragDrop<BoardLane>;
}

function moduleDropEvent(drag: CombineModuleDrag, targetLane: BoardLane): CdkDragDrop<BoardLane> {
  return {
    previousIndex: 0,
    currentIndex: 0,
    item: { data: drag } as CdkDrag<CombineModuleDrag>,
    container: {
      id: targetLane,
      data: targetLane,
    } as unknown as CdkDragDrop<BoardLane>['container'],
    previousContainer: {
      id: drag.lane,
      data: drag.lane,
    } as unknown as CdkDragDrop<BoardLane>['previousContainer'],
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
  } as CdkDragDrop<BoardLane>;
}

/** DialogRef closed with value already — onDialogCloseOnce fires on first effect. */
function closedDialogRef(value: unknown): DialogRef<boolean> {
  const v = signal<unknown>(value);
  return {
    closed: computed(() => v()),
    close: (x?: unknown) => v.set(x),
  } as unknown as DialogRef<boolean>;
}

describe('DashboardPage (TZ-COMBINE-404/405)', () => {
  let httpMock: HttpTestingController;
  let dialogs: { openOrderEdit: jest.Mock; openProductEdit: jest.Mock; openModuleEdit: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { error: jest.Mock; success: jest.Mock };

  async function flushInitial(
    orders: Order[],
    modulesByProductId: Record<string, unknown[]> = {},
  ): Promise<void> {
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    req.flush(orders);
    await new Promise<void>((r) => setTimeout(r, 0));
    TestBed.flushEffects();

    /** TZ-COMBINE-410 prefetch: drain GET /modules?productId=… */
    const productIds = [
      ...new Set(
        orders
          .flatMap((o) => (o.items ?? []).map((i) => i.productId))
          .filter((id): id is string => !!id),
      ),
    ];
    const pending = httpMock.match(
      (r) => r.method === 'GET' && r.url.startsWith(`${baseUrl}/modules`),
    );
    for (const m of pending) {
      const url = m.request.urlWithParams || m.request.url;
      const productId =
        productIds.find((pid) => url.includes(`productId=${pid}`)) ?? productIds[0] ?? '';
      m.flush(modulesByProductId[productId] ?? []);
    }
  }

  beforeEach(async () => {
    dialogs = { openOrderEdit: jest.fn(), openProductEdit: jest.fn(), openModuleEdit: jest.fn() };
    dialog = { open: jest.fn() };
    toast = { error: jest.fn(), success: jest.fn() };
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: DashboardDialogService, useValue: dialogs },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    })
      .overrideComponent(DashboardPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('exposes five boardLane columns with RU titles and helpers', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    void httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');

    const page = fixture.componentInstance as unknown as { columns: CombineColumn[] };
    expect(page.columns.map((c) => c.id)).toEqual(['prep', 'design', 'shop', 'to_ship', 'shipped']);
    expect(page.columns.map((c) => c.title)).toEqual([
      'Комплектация',
      'Проектирование',
      'В цехе',
      'К отгрузке',
      'Отгружены',
    ]);
    for (const col of page.columns) {
      expect(col.helper.trim().length).toBeGreaterThan(0);
    }
  });

  it('flattens OrderItems into cards grouped by boardLane', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        _id: 'o1',
        number: 'ORD-1',
        items: [
          itemOf({
            lineId: 'L1',
            boardLane: 'prep',
            productName: 'Стол',
          }),
          itemOf({
            lineId: 'L2',
            boardLane: 'shop',
            productId: 'p2',
            productName: 'Стул',
          }),
        ],
      }),
      orderOf({
        _id: 'o2',
        number: 'ORD-2',
        items: [
          itemOf({
            lineId: 'L3',
            boardLane: 'design',
            productId: 'p3',
            productName: 'Шкаф',
          }),
        ],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      columnCards: (id: BoardLane) => CombineItemCard[];
      itemCards: () => CombineItemCard[];
    };

    expect(page.itemCards()).toHaveLength(3);
    expect(page.columnCards('prep').map((c) => c.productName)).toEqual(['Стол']);
    expect(page.columnCards('shop').map((c) => c.productName)).toEqual(['Стул']);
    expect(page.columnCards('design').map((c) => c.productName)).toEqual(['Шкаф']);
    expect(page.columnCards('prep')[0]!.orderNumber).toBe('ORD-1');
  });

  it('derives boardLane from item.status when lane is missing', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        items: [
          itemOf({ status: 'pending', productName: 'A' }),
          itemOf({ status: 'in_production', productId: 'p2', productName: 'B' }),
          itemOf({ status: 'ready', productId: 'p3', productName: 'C' }),
          itemOf({ status: 'shipped', productId: 'p4', productName: 'D' }),
        ],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      columnCards: (id: BoardLane) => CombineItemCard[];
      boardLaneOf: (item: OrderItem) => BoardLane;
    };

    expect(page.columnCards('prep').map((c) => c.productName)).toEqual(['A']);
    expect(page.columnCards('shop').map((c) => c.productName)).toEqual(['B']);
    expect(page.columnCards('to_ship').map((c) => c.productName)).toEqual(['C']);
    expect(page.columnCards('shipped').map((c) => c.productName)).toEqual(['D']);
    expect(page.boardLaneOf(itemOf({ status: 'pending' }))).toBe('prep');
  });

  it('filters cards by orderId («Все заказы» = empty)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        _id: 'o1',
        number: 'ORD-1',
        items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'One' })],
      }),
      orderOf({
        _id: 'o2',
        number: 'ORD-2',
        items: [
          itemOf({
            lineId: 'L2',
            boardLane: 'prep',
            productId: 'p2',
            productName: 'Two',
          }),
        ],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      filterOrderId: { set: (v: string) => void; (): string };
      columnCards: (id: BoardLane) => CombineItemCard[];
      itemCards: () => CombineItemCard[];
    };

    expect(page.itemCards()).toHaveLength(2);

    page.filterOrderId.set('o2');
    fixture.detectChanges();
    expect(page.itemCards().map((c) => c.productName)).toEqual(['Two']);
    expect(page.columnCards('prep')).toHaveLength(1);

    page.filterOrderId.set('');
    fixture.detectChanges();
    expect(page.itemCards()).toHaveLength(2);
  });

  it('openOrder delegates to DashboardDialogService.openOrderEdit', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const order = orderOf({
      items: [itemOf({ lineId: 'L1', boardLane: 'prep' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      openOrder: (o: Order) => void;
    };
    page.openOrder(order);

    expect(dialogs.openOrderEdit).toHaveBeenCalledWith(
      order,
      expect.anything(),
      expect.any(Function),
    );
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
        itemOf({ productId: 'p1', status: 'ready' }),
        itemOf({ productId: 'p2', status: 'shipped' }),
        itemOf({ productId: 'p3', readyForWork: true }),
        itemOf({ productId: 'p4' }),
      ],
    });
    expect(page.readinessLabel(mixed)).toBe('2 из 4');
  });

  it('drop to design PATCHes lane and applies server order', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Стол' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };
    const card = page.columnCards('prep')[0]!;
    page.dropItem(dropEvent(card, 'design'));

    expect(page.data()[0]!.items![0]!.boardLane).toBe('design');

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/lane` && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ lane: 'design' });
    req.flush(
      orderOf({
        items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Стол' })],
      }),
    );

    expect(page.columnCards('design').map((c) => c.productName)).toEqual(['Стол']);
    expect(page.columnCards('prep')).toHaveLength(0);
  });

  it('ok:false on patchLane rolls lane back and toasts', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Стол' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };
    page.dropItem(dropEvent(page.columnCards('prep')[0]!, 'design'));

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/lane` && r.method === 'PATCH',
    );
    req.flush({ message: 'Нельзя сменить колонку' }, { status: 400, statusText: 'Bad Request' });

    expect(toast.error).toHaveBeenCalledWith('Нельзя сменить колонку');
    expect(page.data()[0]!.items![0]!.boardLane).toBe('prep');
  });

  it('first drop into shop opens freeze modal; Cancel aborts PATCH', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'confirmed',
      items: [
        itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'A' }),
        itemOf({ lineId: 'L2', boardLane: 'design', productId: 'p2', productName: 'B' }),
      ],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
      isFirstShopEntry: (o: Order) => boolean;
    };

    expect(page.isFirstShopEntry(page.data()[0]!)).toBe(true);

    dialog.open.mockReturnValue(closedDialogRef(undefined)); // Cancel
    page.dropItem(dropEvent(page.columnCards('prep')[0]!, 'shop'));

    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.anything());
    const data = (dialog.open.mock.calls[0]![1] as { data?: { title?: string } }).data;
    expect(data?.title).toContain('Состав заказа будет заморожен');

    TestBed.flushEffects();
    expect(httpMock.match((r) => r.method === 'PATCH')).toHaveLength(0);
    expect(page.data()[0]!.items![0]!.boardLane).toBe('prep');
  });

  it('first shop OK continues with patchLane', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'confirmed',
      items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'A' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };

    dialog.open.mockReturnValue(closedDialogRef(true));
    page.dropItem(dropEvent(page.columnCards('prep')[0]!, 'shop'));
    TestBed.flushEffects();

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/lane` && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ lane: 'shop' });
    req.flush(
      orderOf({
        status: 'in_production',
        items: [itemOf({ lineId: 'L1', boardLane: 'shop', productName: 'A' })],
      }),
    );
    expect(page.columnCards('shop')).toHaveLength(1);
  });

  it('drop into shipped when lines not ready toasts and does not ship', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      items: [
        itemOf({ lineId: 'L1', boardLane: 'to_ship', productName: 'Ready' }),
        itemOf({ lineId: 'L2', boardLane: 'shop', productId: 'p2', productName: 'Not yet' }),
      ],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      countNotShipReady: (o: Order) => number;
      data: () => Order[];
    };

    expect(page.countNotShipReady(page.data()[0]!)).toBe(1);
    page.dropItem(dropEvent(page.columnCards('to_ship')[0]!, 'shipped'));

    expect(toast.error).toHaveBeenCalledWith('Ещё 1 изделий не готовы');
    expect(dialog.open).not.toHaveBeenCalled();
    expect(httpMock.match((r) => r.method === 'POST' || r.method === 'PATCH')).toHaveLength(0);
  });

  it('drop into shipped when all to_ship opens confirmShip and POSTs /ship', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'ready',
      items: [
        itemOf({ lineId: 'L1', boardLane: 'to_ship', productName: 'A' }),
        itemOf({ lineId: 'L2', boardLane: 'to_ship', productId: 'p2', productName: 'B' }),
      ],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };

    dialog.open.mockReturnValue(closedDialogRef(true));
    page.dropItem(dropEvent(page.columnCards('to_ship')[0]!, 'shipped'));

    expect(dialog.open).toHaveBeenCalledWith(AlertDialogComponent, expect.anything());
    expect((dialog.open.mock.calls[0]![1] as { data?: { title?: string } }).data?.title).toContain(
      'ORD-1',
    );

    TestBed.flushEffects();
    const shipReq = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/ship` && r.method === 'POST',
    );
    expect(shipReq.request.body).toEqual({});
    shipReq.flush(
      orderOf({
        status: 'shipped',
        items: [
          itemOf({ lineId: 'L1', boardLane: 'shipped', status: 'shipped' }),
          itemOf({ lineId: 'L2', boardLane: 'shipped', productId: 'p2', status: 'shipped' }),
        ],
      }),
    );

    expect(httpMock.match((r) => r.url.includes('/lane') && r.method === 'PATCH')).toHaveLength(0);
    expect(page.data()[0]!.status).toBe('shipped');
  });

  it('ship confirm-cancel does not POST ship', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'ready',
      items: [itemOf({ lineId: 'L1', boardLane: 'to_ship' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };

    dialog.open.mockReturnValue(closedDialogRef(undefined));
    page.dropItem(dropEvent(page.columnCards('to_ship')[0]!, 'shipped'));
    TestBed.flushEffects();

    expect(httpMock.match((r) => r.method === 'POST' || r.method === 'PATCH')).toHaveLength(0);
    expect(page.data()[0]!.status).toBe('ready');
  });

  it('drop design→prep (reverse) PATCHes lane without freeze/ship gates', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'confirmed',
      items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Стол' })],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      data: () => Order[];
    };

    page.dropItem(dropEvent(page.columnCards('design')[0]!, 'prep'));
    expect(page.data()[0]!.items![0]!.boardLane).toBe('prep');

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/lane` && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ lane: 'prep' });
    req.flush(
      orderOf({
        status: 'draft',
        items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Стол' })],
      }),
    );

    expect(page.columnCards('prep')).toHaveLength(1);
    expect(page.columnCards('design')).toHaveLength(0);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('drop card without lineId toasts and does not PATCH (guard)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      items: [itemOf({ boardLane: 'prep', productName: 'Стол' })], // no lineId
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
    };

    const card = page.columnCards('prep')[0]!;
    expect(card.lineId).toContain('legacy-'); // synthetic card key survives
    page.dropItem(dropEvent(card, 'design'));

    expect(toast.error).toHaveBeenCalledWith('У изделия нет lineId — обновите заказ и повторите.');
    expect(httpMock.match((r) => r.method === 'PATCH')).toHaveLength(0);
  });

  it('drop prep→shop when order already in shop skips freeze modal', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      status: 'in_production',
      items: [
        itemOf({ lineId: 'L1', boardLane: 'shop', productId: 'p1', productName: 'In shop' }),
        itemOf({ lineId: 'L2', boardLane: 'prep', productId: 'p2', productName: 'To move' }),
      ],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      columnCards: (id: BoardLane) => CombineItemCard[];
      isFirstShopEntry: (o: Order) => boolean;
    };

    expect(page.isFirstShopEntry(order)).toBe(false);
    page.dropItem(dropEvent(page.columnCards('prep')[0]!, 'shop'));

    expect(dialog.open).not.toHaveBeenCalled();
    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L2/lane` && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ lane: 'shop' });
    req.flush(
      orderOf({
        status: 'in_production',
        items: [
          itemOf({ lineId: 'L1', boardLane: 'shop', productId: 'p1', productName: 'In shop' }),
          itemOf({ lineId: 'L2', boardLane: 'shop', productId: 'p2', productName: 'To move' }),
        ],
      }),
    );
  });

  it('lineEffectiveLane: min по moduleLanes, иначе boardLane (TZ-COMBINE-406/407)', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const page = fixture.componentInstance as unknown as {
      lineEffectiveLane: (o: Order, i: OrderItem) => BoardLane;
    };
    void httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');

    const item = itemOf({ lineId: 'L1', boardLane: 'to_ship' });
    const order = orderOf({
      items: [item],
      moduleLanes: [
        { lineId: 'L1', moduleId: 'm1', lane: 'design' },
        { lineId: 'L1', moduleId: 'm2', lane: 'shop' },
      ],
    });
    expect(page.lineEffectiveLane(order, item)).toBe('design');

    const bare = orderOf({ items: [itemOf({ lineId: 'L2', boardLane: 'prep' })] });
    expect(page.lineEffectiveLane(bare, bare.items![0]!)).toBe('prep');
  });

  it('card follows min lane: boardLane to_ship + module shop → карточка в shop (TZ-COMBINE-407)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        items: [itemOf({ lineId: 'L1', boardLane: 'to_ship', productName: 'Дверь' })],
        moduleLanes: [{ lineId: 'L1', moduleId: 'm1', lane: 'shop' }],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      columnCards: (id: BoardLane) => CombineItemCard[];
    };
    expect(page.columnCards('shop').map((c) => c.productName)).toEqual(['Дверь']);
    expect(page.columnCards('to_ship')).toHaveLength(0);
  });

  it('divergedModules: модуль с lane != эффективной полосы → ghost (TZ-COMBINE-407)', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    const page = fixture.componentInstance as unknown as {
      divergedModules: (o: Order, i: OrderItem) => ModuleLane[];
    };
    void httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');

    const item = itemOf({ lineId: 'L1', boardLane: 'design' });
    const order = orderOf({
      items: [item],
      moduleLanes: [
        { lineId: 'L1', moduleId: 'm1', lane: 'design' },
        { lineId: 'L1', moduleId: 'm2', lane: 'shop' },
      ],
    });
    const ghosts = page.divergedModules(order, item);
    expect(ghosts.map((g) => g.moduleId)).toEqual(['m2']);
    expect(ghosts[0]!.lane).toBe('shop');
  });

  it('dropModule PATCHes /modules/:moduleId/lane и применяет ответ сервера (TZ-COMBINE-407)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    const order = orderOf({
      items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Дверь' })],
      moduleLanes: [{ lineId: 'L1', moduleId: 'm1', lane: 'design' }],
    });
    await flushInitial([order]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      data: () => Order[];
    };
    const drag: CombineModuleDrag = {
      kind: 'module',
      orderId: 'o1',
      lineId: 'L1',
      moduleId: 'm1',
      lane: 'design',
    };
    page.dropItem(moduleDropEvent(drag, 'shop'));

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/modules/m1/lane` && r.method === 'PATCH',
    );
    expect(req.request.body).toEqual({ lane: 'shop' });
    req.flush(
      orderOf({
        items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Дверь' })],
        moduleLanes: [{ lineId: 'L1', moduleId: 'm1', lane: 'shop' }],
      }),
    );
    expect(page.data()[0]!.moduleLanes![0]!.lane).toBe('shop');
  });

  it('prefetch модули по productId и наполняет moduleRows (TZ-COMBINE-407/410)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial(
      [
        orderOf({
          items: [
            itemOf({ lineId: 'L1', boardLane: 'prep', productId: 'p1', productName: 'Дверь' }),
          ],
        }),
      ],
      {
        p1: [
          { _id: 'm1', name: 'Каркас', workTypes: [], materials: [] },
          { _id: 'm2', name: 'Полотно', workTypes: [], materials: [] },
        ],
      },
    );
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      toggleExpand: (c: CombineItemCard) => void;
      isExpanded: (c: CombineItemCard) => boolean;
      moduleRows: (c: CombineItemCard) => CombineModuleRow[];
      columnCards: (id: BoardLane) => CombineItemCard[];
    };

    const card = page.columnCards('prep')[0]!;
    const rows = page.moduleRows(card);
    expect(rows.map((r) => r.name)).toEqual(['Каркас', 'Полотно']);
    expect(rows.map((r) => r.lane)).toEqual(['prep', 'prep']);
    page.toggleExpand(card);
    expect(page.isExpanded(card)).toBe(true);
  });

  it('TZ-COMBINE-409: itemCards is the product-row list (not column-first UI)', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        items: [
          itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Мангал' }),
          itemOf({ lineId: 'L2', boardLane: 'shop', productId: 'p2', productName: 'Стеллаж' }),
        ],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      itemCards: () => CombineItemCard[];
      laneIndicatorActive: (c: CombineItemCard, lane: BoardLane) => boolean;
    };
    const rows = page.itemCards();
    expect(rows.map((c) => c.productName)).toEqual(['Мангал', 'Стеллаж']);
    expect(page.laneIndicatorActive(rows[0]!, 'prep')).toBe(true);
    expect(page.laneIndicatorActive(rows[0]!, 'shop')).toBe(false);
    expect(page.laneIndicatorActive(rows[1]!, 'shop')).toBe(true);
  });

  it('TZ-COMBINE-409: expand scopes 5 drop cells to the line', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial(
      [
        orderOf({
          items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Забор' })],
        }),
      ],
      {
        p1: [{ _id: 'm1', name: 'Столб', workTypes: [], materials: [] }],
      },
    );
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      itemCards: () => CombineItemCard[];
      toggleExpand: (c: CombineItemCard) => void;
      rowConnectedLists: (c: CombineItemCard) => string[];
      rowDropListId: (c: CombineItemCard, lane: BoardLane) => string;
      modulesInLane: (c: CombineItemCard, lane: BoardLane) => CombineModuleRow[];
      columns: CombineColumn[];
    };

    const card = page.itemCards()[0]!;
    page.toggleExpand(card);
    const lists = page.rowConnectedLists(card);
    expect(lists).toHaveLength(5);
    expect(lists).toEqual(page.columns.map((c) => page.rowDropListId(card, c.id)));
    expect(lists.every((id) => id.startsWith(card.key + '::'))).toBe(true);
    expect(lists).not.toContain('prep');

    expect(page.modulesInLane(card, 'design').map((r) => r.name)).toEqual(['Столб']);
    expect(page.modulesInLane(card, 'prep')).toHaveLength(0);
  });

  it('TZ-COMBINE-410: empty catalog modules → whole-product chip in effective lane', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial(
      [
        orderOf({
          items: [itemOf({ lineId: 'L1', boardLane: 'design', productName: 'Мангал' })],
        }),
      ],
      { p1: [] },
    );
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      itemCards: () => CombineItemCard[];
      showWholeProductChip: (c: CombineItemCard, lane: BoardLane) => boolean;
      laneIndicatorActive: (c: CombineItemCard, lane: BoardLane) => boolean;
      isOrderBoundary: (c: CombineItemCard, i: number) => boolean;
      expandPanelId: (c: CombineItemCard) => string;
      dropItem: (e: CdkDragDrop<BoardLane>) => void;
      data: () => Order[];
    };

    const card = page.itemCards()[0]!;
    expect(page.showWholeProductChip(card, 'design')).toBe(true);
    expect(page.showWholeProductChip(card, 'prep')).toBe(false);
    expect(page.laneIndicatorActive(card, 'design')).toBe(true);
    expect(page.laneIndicatorActive(card, 'shop')).toBe(false);
    expect(page.isOrderBoundary(card, 0)).toBe(false);
    expect(page.expandPanelId(card)).toContain('combine-expand-');
    expect(fixture.nativeElement.querySelector('[data-testid="combine-order-group"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="combine-row-order-number"]')?.textContent,
    ).toContain('№');

    page.dropItem(dropEvent(card, 'prep'));
    const patch = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/orders/o1/lines/L1/lane` && r.method === 'PATCH',
    );
    expect(patch.request.body).toEqual({ lane: 'prep' });
    patch.flush({
      ...page.data()[0]!,
      items: [itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Мангал' })],
    });
  });

  it('TZ-COMBINE-411: no order group header; boundary margin on orderId change', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        _id: 'o1',
        number: 'ORD-1',
        items: [
          itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'A' }),
          itemOf({ lineId: 'L2', boardLane: 'prep', productId: 'p2', productName: 'B' }),
        ],
      }),
      orderOf({
        _id: 'o2',
        number: 'ORD-2',
        items: [itemOf({ lineId: 'L3', boardLane: 'design', productId: 'p3', productName: 'C' })],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      itemCards: () => CombineItemCard[];
      isOrderBoundary: (c: CombineItemCard, i: number) => boolean;
    };
    const cards = page.itemCards();
    expect(page.isOrderBoundary(cards[0]!, 0)).toBe(false);
    expect(page.isOrderBoundary(cards[1]!, 1)).toBe(false);
    expect(page.isOrderBoundary(cards[2]!, 2)).toBe(true);

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid="combine-order-group"]')).toBeNull();
    expect(root.textContent).not.toContain('Заказ №');

    const rows = root.querySelectorAll('[data-testid="combine-product-row"]');
    expect(rows.length).toBe(3);
    expect(rows[0]!.getAttribute('data-order-boundary')).toBeNull();
    expect(rows[1]!.getAttribute('data-order-boundary')).toBeNull();
    expect(rows[2]!.getAttribute('data-order-boundary')).toBe('true');
    expect(rows[2]!.classList.contains('mt-3')).toBe(true);

    const list = root.querySelector('[data-testid="combine-product-rows"]');
    expect(list?.classList.contains('gap-0')).toBe(true);

    const orderBtns = root.querySelectorAll('[data-testid="combine-row-order-number"]');
    expect(orderBtns.length).toBe(3);
    expect(orderBtns[0]!.textContent?.trim()).toBe('№ORD-1');
    expect(orderBtns[2]!.textContent?.trim()).toBe('№ORD-2');
  });

  it('TZ-COMBINE-414: name/qty/indicators → expand; pencil → editProduct; fuse intact', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    await flushInitial([
      orderOf({
        _id: 'o1',
        number: 'ORD-1',
        items: [
          itemOf({ lineId: 'L1', boardLane: 'prep', productName: 'Alpha' }),
          itemOf({ lineId: 'L2', boardLane: 'prep', productId: 'p2', productName: 'Beta' }),
        ],
      }),
      orderOf({
        _id: 'o2',
        number: 'ORD-2',
        items: [
          itemOf({ lineId: 'L3', boardLane: 'design', productId: 'p3', productName: 'Gamma' }),
        ],
      }),
    ]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const page = fixture.componentInstance as unknown as {
      itemCards: () => CombineItemCard[];
      isExpanded: (c: CombineItemCard) => boolean;
      isOrderGroupStart: (c: CombineItemCard, i: number) => boolean;
      isOrderGroupEnd: (c: CombineItemCard, i: number) => boolean;
      editModule: (id: string) => void;
    };
    const cards = page.itemCards();
    expect(page.isOrderGroupStart(cards[0]!, 0)).toBe(true);
    expect(page.isOrderGroupEnd(cards[0]!, 0)).toBe(false);
    expect(page.isOrderGroupStart(cards[1]!, 1)).toBe(false);
    expect(page.isOrderGroupEnd(cards[1]!, 1)).toBe(true);
    expect(page.isOrderGroupStart(cards[2]!, 2)).toBe(true);
    expect(page.isOrderGroupEnd(cards[2]!, 2)).toBe(true);

    const root = fixture.nativeElement as HTMLElement;
    const nameBtn = root.querySelector(
      '[data-testid="combine-row-product-name"]',
    ) as HTMLButtonElement;
    expect(nameBtn).toBeTruthy();
    expect(nameBtn.classList.contains('hover:underline')).toBe(true);
    expect(nameBtn.getAttribute('aria-expanded')).toBe('false');
    expect(nameBtn.getAttribute('aria-controls')).toBeTruthy();
    nameBtn.click();
    fixture.detectChanges();
    expect(dialogs.openProductEdit).not.toHaveBeenCalled();
    expect(page.isExpanded(cards[0]!)).toBe(true);
    expect(nameBtn.getAttribute('aria-expanded')).toBe('true');

    nameBtn.click();
    fixture.detectChanges();
    expect(page.isExpanded(cards[0]!)).toBe(false);

    const qtyBtn = root.querySelector('[data-testid="combine-row-qty"]') as HTMLButtonElement;
    qtyBtn.click();
    fixture.detectChanges();
    expect(page.isExpanded(cards[0]!)).toBe(true);
    expect(dialogs.openProductEdit).not.toHaveBeenCalled();

    const indicatorsBtn = root.querySelector(
      '[data-testid="combine-lane-indicators"]',
    ) as HTMLButtonElement;
    indicatorsBtn.click();
    fixture.detectChanges();
    expect(page.isExpanded(cards[0]!)).toBe(false);

    const pencilBtn = root.querySelector(
      '[data-testid="combine-row-product-edit"]',
    ) as HTMLButtonElement;
    expect(pencilBtn).toBeTruthy();
    pencilBtn.click();
    expect(dialogs.openProductEdit).toHaveBeenCalledWith(
      'p1',
      expect.anything(),
      expect.any(Function),
    );
    expect(page.isExpanded(cards[0]!)).toBe(false);

    const expandBtn = root.querySelector('[data-testid="combine-row-expand"]') as HTMLButtonElement;
    expandBtn.click();
    fixture.detectChanges();
    expect(page.isExpanded(cards[0]!)).toBe(true);

    const rows = root.querySelectorAll('[data-testid="combine-product-row"]');
    expect(rows[0]!.classList.contains('rounded-t-sm')).toBe(true);
    expect(rows[0]!.classList.contains('border-t-0')).toBe(false);
    expect(rows[1]!.classList.contains('border-t-0')).toBe(true);
    expect(rows[1]!.classList.contains('rounded-b-sm')).toBe(true);
    expect(rows[2]!.classList.contains('mt-3')).toBe(true);
    expect(rows[0]!.classList.contains('border-rule-strong')).toBe(true);

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    page.editModule('mod-42');
    expect(navSpy).not.toHaveBeenCalled();
    expect(dialogs.openModuleEdit).toHaveBeenCalledWith(
      'mod-42',
      expect.anything(),
      expect.any(Function),
    );
  });

  it('TZ-COMBINE-413: chip DnD preview class is solid (not ghost)', () => {
    expect(COMBINE_CHIP_DRAG_PREVIEW_CLASS).toBe('combine-chip-drag-preview');
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    void httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    const page = fixture.componentInstance as unknown as {
      chipDragPreviewClass: string;
    };
    expect(page.chipDragPreviewClass).toBe(COMBINE_CHIP_DRAG_PREVIEW_CLASS);
  });
});
