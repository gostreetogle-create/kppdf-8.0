import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  PiContractsService,
  PiOrdersService,
  PiQuotationsService,
  PiSitesService,
  type Contract,
  type Counterparty,
  type Order,
  type Quotation,
  type Site,
} from '@kppdf/data-access';
import { CounterpartyHubTrayComponent } from './counterparty-hub-tray.component';

describe('CounterpartyHubTrayComponent (TZ-NX-HUB-01)', () => {
  let fixture: ComponentFixture<CounterpartyHubTrayComponent>;
  let sitesApi: { list: jest.Mock };
  let ordersApi: { list: jest.Mock };
  let quotationsApi: { list: jest.Mock };
  let contractsApi: { list: jest.Mock };

  const counterparty: Counterparty = {
    _id: 'cp-1',
    name: 'ООО Альфа',
    inn: '7707083893',
    phone: '+7 999 000-00-00',
    email: 'alpha@example.com',
    roles: ['customer'],
    isActive: true,
  };

  const sites: Site[] = [{ _id: 'site-1', counterpartyId: 'cp-1', name: 'Цех', address: 'ул. Ленина, 1' }];
  const orders: Order[] = [{ _id: 'order-1', number: 'ORD-001', status: 'confirmed' }];
  const quotations: Quotation[] = [{ _id: 'kp-1', number: 'KP-001', status: 'sent' }];
  const contracts: Contract[] = [
    {
      _id: 'contract-1',
      number: 'DOG-001',
      organizationId: 'org-1',
      customerId: 'cp-1',
      status: 'active',
      contractStatus: 'file_attached',
      items: [],
      totalAmount: 1000,
    },
  ];

  async function setup(overrides?: {
    sites?: ReturnType<typeof of>;
    orders?: ReturnType<typeof of>;
    quotations?: ReturnType<typeof of>;
    contracts?: ReturnType<typeof of>;
  }): Promise<void> {
    sitesApi = { list: jest.fn().mockReturnValue(overrides?.sites ?? of({ ok: true, data: sites })) };
    ordersApi = { list: jest.fn().mockReturnValue(overrides?.orders ?? of({ ok: true, data: orders })) };
    quotationsApi = { list: jest.fn().mockReturnValue(overrides?.quotations ?? of({ ok: true, data: quotations })) };
    contractsApi = { list: jest.fn().mockReturnValue(overrides?.contracts ?? of({ ok: true, data: contracts })) };

    await TestBed.configureTestingModule({
      imports: [CounterpartyHubTrayComponent],
      providers: [
        provideRouter([]),
        { provide: PiSitesService, useValue: sitesApi },
        { provide: PiOrdersService, useValue: ordersApi },
        { provide: PiQuotationsService, useValue: quotationsApi },
        { provide: PiContractsService, useValue: contractsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterpartyHubTrayComponent);
    fixture.componentRef.setInput('counterparty', counterparty);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('requests each block scoped to this counterparty (≤5 HTTP budget)', async () => {
    await setup();
    expect(sitesApi.list).toHaveBeenCalledWith('cp-1');
    expect(ordersApi.list).toHaveBeenCalledWith({ counterpartyId: 'cp-1' });
    expect(quotationsApi.list).toHaveBeenCalledWith({ counterpartyId: 'cp-1' });
    expect(contractsApi.list).toHaveBeenCalledWith({ counterpartyId: 'cp-1' });
  });

  it('shows Реквизиты read-only from the row, no extra fetch', async () => {
    await setup();
    const el = fixture.nativeElement.querySelector('[data-test="counterparty-hub-requisites"]');
    expect(el.textContent).toContain('ООО Альфа');
    expect(el.textContent).toContain('7707083893');
    expect(el.textContent).toContain('+7 999 000-00-00');
    expect(el.textContent).toContain('alpha@example.com');
  });

  it('renders Объекты, Заказы, КП and Договоры blocks with mock data (≥4 categorised blocks)', async () => {
    await setup();
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-site-item"]').textContent).toContain('Цех');
    const orderLink = fixture.nativeElement.querySelector('[data-test="counterparty-hub-order-link"]');
    expect(orderLink.textContent).toContain('ORD-001');
    expect(orderLink.getAttribute('href')).toBe('/orders/order-1');
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-quotation-item"]').textContent).toContain('KP-001');
    const contractLink = fixture.nativeElement.querySelector('[data-test="counterparty-hub-contract-link"]');
    expect(contractLink.textContent).toContain('DOG-001');
    expect(contractLink.getAttribute('href')).toBe('/contracts/contract-1');
  });

  it('never renders raw ObjectIds as row text', async () => {
    await setup();
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('site-1');
    expect(text).not.toContain('order-1');
    expect(text).not.toContain('kp-1');
    expect(text).not.toContain('contract-1');
  });

  it('is honest about empty blocks', async () => {
    await setup({
      sites: of({ ok: true, data: [] }),
      orders: of({ ok: true, data: [] }),
      quotations: of({ ok: true, data: [] }),
      contracts: of({ ok: true, data: [] }),
    });
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-sites"]').textContent).toContain('Нет объектов');
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-orders"]').textContent).toContain('Нет заказов');
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-quotations"]').textContent).toContain('Нет КП');
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-contracts"]').textContent).toContain('Нет договоров');
  });

  it('shows a retryable error message per block when a request fails', async () => {
    await setup({ orders: of({ ok: false, error: new HttpErrorResponse({ status: 500 }) }) });
    expect(fixture.nativeElement.querySelector('[data-test="counterparty-hub-orders-error"]')).toBeTruthy();
  });
});
