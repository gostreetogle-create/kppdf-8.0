import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DashboardStatsPage } from './dashboard-stats.page';
import { Order } from '../orders/orders.service';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-DASHBOARD-401 — home overview (stats), not Combine kanban.
 *
 * httpResource sync: flushEffects → expectOne → flush → tickMicrotask → detectChanges.
 */

const baseUrl = '/api';
const ordersUrl = `${baseUrl}/orders`;
const inventoryUrl = `${baseUrl}/inventory`;

function orderOf(overrides: Partial<Order> = {}): Order {
  return {
    _id: 'o1',
    number: 'ORD-1',
    status: 'confirmed',
    counterpartyId: 'cp1',
    siteId: 'site1',
    priority: 'normal',
    items: [],
    ...overrides,
  };
}

const emptyPulse = {
  totalWarehouses: 0,
  totalActiveItems: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
  totalMovementsLast30d: 0,
};

const samplePulse = {
  totalWarehouses: 2,
  totalActiveItems: 12,
  outOfStockCount: 1,
  lowStockCount: 3,
  totalMovementsLast30d: 7,
};

describe('DashboardStatsPage (TZ-DASHBOARD-401)', () => {
  let httpMock: HttpTestingController;

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  function flushEffects(): void {
    TestBed.flushEffects();
  }

  async function flushInitial(
    orders: Order[],
    pulse: typeof samplePulse = samplePulse,
  ): Promise<void> {
    flushEffects();
    httpMock.expectOne((r) => r.url === ordersUrl && r.method === 'GET').flush(orders);
    httpMock.expectOne((r) => r.url === inventoryUrl && r.method === 'GET').flush(pulse);
    await tickMicrotask();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    })
      .overrideComponent(DashboardStatsPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows RU loading while resources pending', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    flushEffects();

    expect(
      fixture.nativeElement.querySelector('[data-test="overview-loading"]')?.textContent,
    ).toContain('Загрузка');

    // Drain pending requests so verify() passes
    httpMock.expectOne((r) => r.url === ordersUrl).flush([]);
    httpMock.expectOne((r) => r.url === inventoryUrl).flush(emptyPulse);
    await tickMicrotask();
  });

  it('renders order KPI counts from GET /orders', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    await flushInitial([
      orderOf({ _id: 'a', status: 'draft' }),
      orderOf({ _id: 'b', status: 'confirmed' }),
      orderOf({ _id: 'c', status: 'in_production' }),
      orderOf({ _id: 'd', status: 'ready' }),
      orderOf({
        _id: 'e',
        status: 'confirmed',
        plannedDate: '2000-01-01',
      }),
    ]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="overview-counter-new"]')?.textContent).toContain('3');
    expect(root.querySelector('[data-test="overview-counter-inProgress"]')?.textContent).toContain(
      '1',
    );
    expect(root.querySelector('[data-test="overview-counter-ready"]')?.textContent).toContain('1');
    expect(root.querySelector('[data-test="overview-counter-overdue"]')?.textContent).toContain(
      '1',
    );
    expect(root.querySelector('[data-test="overview-orders-section"]')).toBeTruthy();
    expect(root.querySelector('[data-test="overview-link-combine"]')).toBeTruthy();
  });

  it('renders warehouse pulse from GET /inventory aggregate', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    await flushInitial([], samplePulse);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="overview-wh-warehouses"]')?.textContent).toContain('2');
    expect(root.querySelector('[data-test="overview-wh-positions"]')?.textContent).toContain('12');
    expect(root.querySelector('[data-test="overview-wh-lowStock"]')?.textContent).toContain('3');
    expect(root.querySelector('[data-test="overview-wh-movements"]')?.textContent).toContain('7');
  });

  it('shows RU empty when orders and warehouse pulse are quiet', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    await flushInitial([], emptyPulse);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('[data-test="overview-empty"]');
    expect(empty?.textContent).toContain('Пока нет заказов');
  });

  it('shows RU error when orders request fails', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    flushEffects();
    httpMock
      .expectOne((r) => r.url === ordersUrl && r.method === 'GET')
      .flush({ message: 'Нет доступа' }, { status: 403, statusText: 'Forbidden' });
    httpMock.expectOne((r) => r.url === inventoryUrl && r.method === 'GET').flush(emptyPulse);
    await tickMicrotask();
    fixture.detectChanges();

    const err = fixture.nativeElement.querySelector('[data-test="overview-error"]');
    expect(err).toBeTruthy();
    expect(err?.getAttribute('role')).toBe('alert');
  });

  it('does not render kanban board markers on home', async () => {
    const fixture = TestBed.createComponent(DashboardStatsPage);
    fixture.detectChanges();
    await flushInitial([orderOf()]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-test="combine-board"]')).toBeNull();
    expect(root.querySelector('cdk-drop-list')).toBeNull();
    expect(root.querySelector('[data-test="overview-sections"]')?.textContent).toContain('Проект');
  });
});
