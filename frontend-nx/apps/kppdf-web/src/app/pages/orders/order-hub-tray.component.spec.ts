import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  PiCompositionService,
  PiReservationsService,
  PiSupplyRequestsService,
  type CompositionTreeNode,
  type Order,
} from '@kppdf/data-access';
import { OrderHubTrayComponent } from './order-hub-tray.component';

describe('OrderHubTrayComponent (TZ-NX-DEALS-D2-HUB-TRAY)', () => {
  let fixture: ComponentFixture<OrderHubTrayComponent>;
  let compositionApi: { getProductTree: jest.Mock };
  let supplyApi: { list: jest.Mock };
  let reservationsApi: { list: jest.Mock };

  const order: Order = {
    _id: 'order-1',
    number: 'ORD-001',
    status: 'confirmed',
    items: [
      { productId: 'p-1', productName: 'Дверь', quantity: 1, readyForWork: true },
      { productId: 'p-2', productName: 'Окно', quantity: 2, readyForWork: false },
    ],
  };

  async function setup(order_: Order = order): Promise<void> {
    compositionApi = { getProductTree: jest.fn() };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };

    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order_);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the four hub groups: Заказ, Исполнение, Логистика, Документы', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="order-group-order"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-execution"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-logistics"]')).toBeTruthy();
    expect(root.querySelector('[data-test="order-group-documents"]')).toBeTruthy();
  });

  it('loads supply and reservations eagerly on init (row-expand budget, not behind a sub-toggle)', async () => {
    await setup();
    expect(supplyApi.list).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(reservationsApi.list).toHaveBeenCalledWith({ orderId: 'ORD-001' });
    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
  });

  it('shows readiness X из Y from items.readyForWork', async () => {
    await setup();
    const summary = fixture.nativeElement.querySelector('[data-test="order-readiness-summary"]');
    expect(summary.textContent.trim()).toBe('1 из 2');
  });

  it('shows «—» readiness and no composition http for an order without items', async () => {
    await setup({ ...order, items: [] });
    const summary = fixture.nativeElement.querySelector('[data-test="order-readiness-summary"]');
    expect(summary.textContent.trim()).toBe('—');
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="order-composition-panel"]').textContent).toContain(
      'Состав пуст',
    );
    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
  });

  it('shows empty supply copy, not a crash, when there are no supply tasks', async () => {
    await setup();
    const block = fixture.nativeElement.querySelector('[data-test="order-supply-block"]');
    expect(block.textContent).toContain('Нет задач снабжения');
  });

  it('shows supply counters when tasks exist', async () => {
    supplyApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            { _id: 's1', qty: 1, status: 'ordered', priority: 'normal' },
            { _id: 's2', qty: 1, status: 'received', priority: 'normal' },
            { _id: 's3', qty: 1, status: 'requested', priority: 'normal' },
          ],
        }),
      ),
    };
    compositionApi = { getProductTree: jest.fn() };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    const counters = fixture.nativeElement.querySelector('[data-test="order-supply-counters"]');
    expect(counters.textContent).toContain('Заказано 1');
    expect(counters.textContent).toContain('Получено 1');
    expect(counters.textContent).toContain('всего 3');
  });

  it('shows an inline error (not a crash) when the supply request fails', async () => {
    supplyApi = {
      list: jest
        .fn()
        .mockReturnValue(of({ ok: false, error: new HttpErrorResponse({ status: 500 }) })),
    };
    compositionApi = { getProductTree: jest.fn() };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="order-supply-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="order-group-logistics"]')).toBeTruthy();
  });

  it('lazy-loads the composition tree per line only on first toggle, keyed by productId', async () => {
    const rootA: CompositionTreeNode = { _id: 'p-1', name: 'Дверь', kind: 'product', quantity: 1, children: [] };
    const rootB: CompositionTreeNode = { _id: 'p-2', name: 'Окно', kind: 'product', quantity: 1, children: [] };
    compositionApi = {
      getProductTree: jest.fn((id: string) => of({ ok: true, data: id === 'p-1' ? rootA : rootB })),
    };
    supplyApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    reservationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    await TestBed.configureTestingModule({
      imports: [OrderHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiCompositionService, useValue: compositionApi },
        { provide: PiSupplyRequestsService, useValue: supplyApi },
        { provide: PiReservationsService, useValue: reservationsApi },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderHubTrayComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();

    expect(compositionApi.getProductTree).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();

    expect(compositionApi.getProductTree).toHaveBeenCalledWith('p-1');
    expect(compositionApi.getProductTree).toHaveBeenCalledWith('p-2');
    expect(compositionApi.getProductTree).toHaveBeenCalledTimes(2);
    const trees = fixture.nativeElement.querySelectorAll('pi-composition-tree');
    expect(trees.length).toBe(2);

    // Collapse + re-open must not refetch (cached).
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-test="order-composition-toggle"]').click();
    fixture.detectChanges();
    expect(compositionApi.getProductTree).toHaveBeenCalledTimes(2);
  });

  it('has no desk-write controls in the DOM (confirm/ship/add-line/notebook/cancel-shipment)', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="desk-primary-cta"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-add-line-cta"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-ship-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-notebook-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-cancel-shipment-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-supply-button"]')).toBeFalsy();
    expect(root.querySelector('[data-test="desk-create-document-button"]')).toBeFalsy();
  });

  it('wires deep-links: supply/production/storage-items/shipping/documents', async () => {
    await setup();
    const root: HTMLElement = fixture.nativeElement;
    const supplyLink = root.querySelector('[data-test="order-supply-link"]') as HTMLAnchorElement;
    const productionLink = root.querySelector('[data-test="order-production-link"]') as HTMLAnchorElement;
    const warehouseLink = root.querySelector('[data-test="order-warehouse-link"]') as HTMLAnchorElement;
    const shippingLink = root.querySelector('[data-test="order-shipping-link"]') as HTMLAnchorElement;
    const documentsLink = root.querySelector('[data-test="order-documents-link"]') as HTMLAnchorElement;
    expect(supplyLink.getAttribute('href')).toBe('/supply?orderId=order-1');
    expect(productionLink.getAttribute('href')).toBe('/production?orderId=order-1');
    expect(warehouseLink.getAttribute('href')).toBe('/storage-items');
    expect(shippingLink.getAttribute('href')).toBe('/shipping');
    expect(documentsLink.getAttribute('href')).toBe('/doc-constructor/templates?source=order&sourceId=order-1');
  });
});
