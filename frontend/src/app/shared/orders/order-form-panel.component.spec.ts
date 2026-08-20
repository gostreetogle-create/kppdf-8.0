import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../ui/toast';
import { Order, OrderStatus } from '../services/orders.service';
import { OrderFormPanelComponent } from './order-form-panel.component';

interface Control<T> {
  value: T;
  setValue(value: T): void;
}

interface OrderFormHarness {
  form: {
    controls: {
      counterpartyId: Control<string>;
      siteId: Control<string>;
      plannedDate: Control<string | null>;
      priority: Control<string>;
      status: Control<string>;
    };
  };
  itemsArray: {
    length: number;
    at(index: number): {
      controls: {
        productId: Control<string>;
        quantity: Control<number>;
        unitPrice: Control<number>;
        plannedShipDate: Control<string>;
      };
    };
  };
  freezeMode(): 'none' | 'plan' | 'hard';
  isCompositionLocked(): boolean;
  errorMessage(): string | null;
  onCounterpartyChange(id: string): void;
  onProductPick(index: number, productId: string): void;
  addItem(): void;
  onSubmit(): void;
  submitting(): boolean;
}

const PRODUCT = { _id: 'p1', name: 'Дверь', sku: 'D-1', unit: 'шт' };
const PRODUCT_2 = { _id: 'p2', name: 'Рама', sku: 'R-1', unit: 'шт' };

const flushLookups = (
  httpMock: HttpTestingController,
  products: Array<{ _id: string; name: string; sku?: string; unit?: string }> = [],
): void => {
  httpMock
    .expectOne((req) => req.url === '/api/counterparties')
    .flush({
      items: [{ _id: 'cp1', name: 'ООО Тест' }],
      total: 1,
      page: 1,
      limit: 200,
    });
  httpMock
    .expectOne((req) => req.url === '/api/products')
    .flush({
      items: products,
      total: products.length,
      page: 1,
      limit: 200,
    });
  httpMock
    .expectOne((req) => req.url === '/api/users')
    .flush({
      items: [{ _id: 'u1', username: 'alice', email: 'a@example.com', role: 'manager' }],
      total: 1,
      page: 1,
      limit: 100,
    });
};

const flushSites = (httpMock: HttpTestingController, sites: unknown[] = []): void => {
  httpMock.expectOne((req) => req.url === '/api/sites').flush(sites);
};

const sampleOrder = (status: OrderStatus, extra: Partial<Order> = {}): Order => ({
  _id: 'o1',
  number: 'ORD-1',
  status,
  counterpartyId: 'cp1',
  siteId: 'site1',
  priority: 'normal',
  plannedDate: '2026-08-20',
  items: [
    {
      productId: 'p1',
      productName: 'Дверь',
      quantity: 1,
      unitPrice: 100,
    },
  ],
  ...extra,
});

describe('OrderFormPanelComponent A2 characterization', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFormPanelComponent],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(OrderFormPanelComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  function createPanel(order: Order | null = null): OrderFormPanelComponent {
    const fixture = TestBed.createComponent(OrderFormPanelComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('loads owner users through the existing Users entity service', () => {
    const component = createPanel();
    flushLookups(httpMock);
    expect(component).toBeTruthy();
  });

  it('does not submit twice while the first order request is pending', () => {
    const component = createPanel() as unknown as OrderFormHarness;
    flushLookups(httpMock);
    const item = component.itemsArray.at(0);

    component.form.controls.counterpartyId.setValue('cp1');
    component.form.controls.siteId.setValue('site1');
    item.controls.productId.setValue('p1');
    item.controls.quantity.setValue(1);
    item.controls.unitPrice.setValue(100);

    component.onSubmit();
    expect(component.submitting()).toBe(true);
    const requests = httpMock.match((req) => req.url === '/api/orders');
    expect(requests).toHaveLength(1);

    component.onSubmit();
    expect(httpMock.match((req) => req.url === '/api/orders')).toHaveLength(0);

    requests[0].flush({ _id: 'o1', number: 'ORD-1', status: 'draft' });
    expect(component.submitting()).toBe(true);
  });

  it('onProductPick sets productId and POST includes it', () => {
    const component = createPanel() as unknown as OrderFormHarness;
    flushLookups(httpMock, [PRODUCT]);

    component.onProductPick(0, 'p1');
    expect(component.itemsArray.at(0).controls.productId.value).toBe('p1');

    component.form.controls.counterpartyId.setValue('cp1');
    component.form.controls.siteId.setValue('site1');
    component.itemsArray.at(0).controls.quantity.setValue(1);
    component.itemsArray.at(0).controls.unitPrice.setValue(100);

    component.onSubmit();
    const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'POST');
    expect(req.request.body.items[0].productId).toBe('p1');
    req.flush({ _id: 'o1', number: 'ORD-1', status: 'draft' });
  });

  it('shows RU when saving without a product on a line', () => {
    const component = createPanel() as unknown as OrderFormHarness;
    flushLookups(httpMock);
    component.form.controls.counterpartyId.setValue('cp1');
    component.form.controls.siteId.setValue('site1');
    component.onSubmit();
    expect(component.errorMessage()).toBe('Выберите изделие в каждой позиции');
    expect(httpMock.match((req) => req.url === '/api/orders')).toHaveLength(0);
  });

  it('ensures default site when counterparty has none', () => {
    const component = createPanel() as unknown as OrderFormHarness;
    flushLookups(httpMock);
    component.onCounterpartyChange('cp1');
    flushSites(httpMock, []);
    const ensure = httpMock.expectOne(
      (req) => req.url === '/api/sites/ensure-default' && req.method === 'POST',
    );
    expect(ensure.request.body).toEqual({ counterpartyId: 'cp1' });
    ensure.flush({
      _id: 'site-def',
      counterpartyId: 'cp1',
      name: 'Объект по умолчанию',
      address: 'Адрес не указан',
    });
    expect(component.form.controls.siteId.value).toBe('site-def');
  });

  it('defaults new line plannedShipDate from header plannedDate', () => {
    const component = createPanel() as unknown as OrderFormHarness;
    flushLookups(httpMock);
    component.form.controls.plannedDate.setValue('2026-09-01');
    component.addItem();
    expect(component.itemsArray.at(1).controls.plannedShipDate.value).toBe('2026-09-01');
  });
});

describe('OrderFormPanelComponent edit freeze (TZ-ORDERS-336)', () => {
  let httpMock: HttpTestingController;

  const setup = async (order: Order) => {
    await TestBed.configureTestingModule({
      imports: [OrderFormPanelComponent],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(OrderFormPanelComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(OrderFormPanelComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    flushLookups(httpMock, [PRODUCT, PRODUCT_2]);
    flushSites(httpMock, [
      { _id: 'site1', counterpartyId: 'cp1', name: 'Объект', address: 'ул. 1' },
    ]);
    return fixture.componentInstance as unknown as OrderFormHarness;
  };

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('edit: add second line + pick product → PATCH both productIds', async () => {
    const component = await setup(sampleOrder('draft'));
    expect(component.freezeMode()).toBe('none');
    component.addItem();
    component.onProductPick(1, 'p2');
    component.itemsArray.at(1).controls.quantity.setValue(1);
    component.itemsArray.at(1).controls.unitPrice.setValue(50);
    component.onSubmit();
    const req = httpMock.expectOne((r) => r.url === '/api/orders/o1' && r.method === 'PATCH');
    expect(req.request.body.items.map((i: { productId: string }) => i.productId)).toEqual([
      'p1',
      'p2',
    ]);
    req.flush(sampleOrder('draft'));
  });

  it('in_production: PATCH only plannedDate/priority; composition locked', async () => {
    const component = await setup(sampleOrder('in_production'));
    expect(component.freezeMode()).toBe('plan');
    expect(component.isCompositionLocked()).toBe(true);
    component.form.controls.plannedDate.setValue('2026-09-15');
    component.form.controls.priority.setValue('high');
    component.onSubmit();
    const req = httpMock.expectOne((r) => r.url === '/api/orders/o1' && r.method === 'PATCH');
    expect(req.request.body).toEqual({
      priority: 'high',
      plannedDate: '2026-09-15',
    });
    req.flush(sampleOrder('in_production'));
  });

  it('shipped: read-only, no PATCH', async () => {
    const component = await setup(sampleOrder('shipped'));
    expect(component.freezeMode()).toBe('hard');
    component.onSubmit();
    expect(component.errorMessage()).toBe('Заказ в статусе «Отгружен» нельзя обновлять');
    expect(httpMock.match((req) => req.method === 'PATCH')).toHaveLength(0);
  });

  it('TZ-SWEEP-401: статус-селект = draft…ready; shipped только disabled-показ', async () => {
    const component = await setup(sampleOrder('shipped'));
    const options = (
      component as unknown as { statusOptions: () => { value: string; disabled?: boolean }[] }
    ).statusOptions();
    expect(options.map((o) => o.value)).toEqual([
      'draft',
      'confirmed',
      'in_production',
      'ready',
      'shipped',
    ]);
    expect(options.find((o) => o.value === 'shipped')?.disabled).toBe(true);
    expect(component.freezeMode()).toBe('hard');
  });
});
