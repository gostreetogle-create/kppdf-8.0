import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CombineItemCard, CombineColumn, DashboardPage } from './dashboard.page';
import { BoardLane, Order, OrderItem } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';
import { DashboardDialogService } from '../../shared/services/dashboard-dialog.service';

/**
 * TZ-COMBINE-404 — Комбайн как доска изделий:
 *  - колонки = boardLane (prep…shipped) + RU title + helper
 *  - карточки = flat OrderItem; фильтр по orderId
 *  - fallback boardLane из item.status
 *  - клик badge/title → openOrderEdit
 *
 * DnD / patchLane write-path → TZ-COMBINE-405.
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

describe('DashboardPage (TZ-COMBINE-404)', () => {
  let httpMock: HttpTestingController;
  let dialogs: { openOrderEdit: jest.Mock; openProductEdit: jest.Mock };

  async function flushInitial(orders: Order[]): Promise<void> {
    const req = httpMock.expectOne((r) => r.url === listUrl && r.method === 'GET');
    req.flush(orders);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogs = { openOrderEdit: jest.fn(), openProductEdit: jest.fn() };
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: DashboardDialogService, useValue: dialogs },
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
});
