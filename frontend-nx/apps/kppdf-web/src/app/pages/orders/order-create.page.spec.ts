import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PiCounterpartiesService,
  PiOrdersService,
  PiOrganizationsService,
  PiProductsService,
  PiSitesService,
  type Order,
} from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { OrderCreatePage } from './order-create.page';

describe('OrderCreatePage (TZ-NX-SALES-S36-ORDER-CREATE)', () => {
  let fixture: ComponentFixture<OrderCreatePage>;
  let counterpartiesApi: { list: jest.Mock };
  let productsApi: { list: jest.Mock };
  let organizationsApi: { list: jest.Mock };
  let sitesApi: { ensureDefault: jest.Mock };
  let ordersApi: { create: jest.Mock };
  let router: { navigate: jest.Mock };

  const counterparties = {
    items: [{ _id: 'cp-1', name: 'ООО Пример' }],
    total: 1,
    page: 1,
    limit: 200,
  };
  const products = {
    items: [
      { _id: 'p-1', name: 'Стол', unit: 'шт' },
      { _id: 'p-2', name: 'Стул', unit: 'шт' },
    ],
    total: 2,
    page: 1,
    limit: 50,
  };
  const organizations = {
    items: [{ _id: 'org-1', name: 'Наша фирма', isOurCompany: true }],
    total: 1,
    page: 1,
    limit: 25,
  };

  async function setup(): Promise<void> {
    counterpartiesApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: counterparties })) };
    productsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: products })) };
    organizationsApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: organizations })) };
    sitesApi = { ensureDefault: jest.fn() };
    ordersApi = { create: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [OrderCreatePage],
      providers: [
        provideRouter([]),
        { provide: PiCounterpartiesService, useValue: counterpartiesApi },
        { provide: PiProductsService, useValue: productsApi },
        { provide: PiOrganizationsService, useValue: organizationsApi },
        { provide: PiSitesService, useValue: sitesApi },
        { provide: PiOrdersService, useValue: ordersApi },
      ],
    }).compileComponents();

    router = { navigate: jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) };
    fixture = TestBed.createComponent(OrderCreatePage);
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function pickCustomer(id: string): Promise<void> {
    const select = fixture.nativeElement.querySelector('[data-test="order-customer"]') as HTMLSelectElement;
    select.value = id;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  async function addItem(productId: string, quantity: number): Promise<void> {
    const add = fixture.nativeElement.querySelector('[data-test="order-add-item"]') as HTMLButtonElement;
    add.click();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('[data-test="order-item-row"]');
    const row = rows[rows.length - 1];
    const product = row.querySelector('[data-test="order-item-product"]') as HTMLSelectElement;
    product.value = productId;
    product.dispatchEvent(new Event('change'));
    const qty = row.querySelector('[data-test="order-item-qty"]') as HTMLInputElement;
    qty.value = String(quantity);
    qty.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  async function submit(): Promise<void> {
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await settle();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads counterparties, products, and organizations into the form', async () => {
    await setup();
    await settle();

    expect(counterpartiesApi.list).toHaveBeenCalled();
    expect(productsApi.list).toHaveBeenCalled();
    expect(organizationsApi.list).toHaveBeenCalled();
    const customerOptions = fixture.nativeElement.querySelectorAll('[data-test="order-customer"] option');
    expect(customerOptions.length).toBeGreaterThanOrEqual(2);
    expect(fixture.nativeElement.textContent).toContain('ООО Пример');
  });

  it('does not POST anything when no counterparty is selected', async () => {
    await setup();
    await settle();

    await addItem('p-1', 2);
    await submit();

    expect(sitesApi.ensureDefault).not.toHaveBeenCalled();
    expect(ordersApi.create).not.toHaveBeenCalled();
  });

  it('does not POST anything when the items list is empty', async () => {
    await setup();
    await settle();

    await pickCustomer('cp-1');
    await submit();

    expect(sitesApi.ensureDefault).not.toHaveBeenCalled();
    expect(ordersApi.create).not.toHaveBeenCalled();
  });

  it('creates a direct order without quotationId on the happy path and navigates to the card', async () => {
    const created: Order = { _id: 'order-new', number: 'ORD-100', status: 'draft' };
    await setup();
    await settle();
    sitesApi.ensureDefault.mockReturnValue(
      of({ ok: true, data: { _id: 'site-1', counterpartyId: 'cp-1', name: 'Склад №1', address: 'Москва' } }),
    );
    ordersApi.create.mockReturnValue(of({ ok: true, data: created } satisfies SilentResult<Order>));

    await pickCustomer('cp-1');
    await addItem('p-1', 2);
    await submit();

    expect(sitesApi.ensureDefault).toHaveBeenCalledWith('cp-1');
    expect(ordersApi.create).toHaveBeenCalledWith({
      counterpartyId: 'cp-1',
      siteId: 'site-1',
      items: [{ productId: 'p-1', quantity: 2 }],
      status: 'draft',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/orders', 'order-new']);
  });

  it('sends organizationId and isPaid when the optional fields are set', async () => {
    const created: Order = { _id: 'order-new', number: 'ORD-101', status: 'draft' };
    await setup();
    await settle();
    sitesApi.ensureDefault.mockReturnValue(
      of({ ok: true, data: { _id: 'site-1', counterpartyId: 'cp-1', name: 'Склад №1', address: '' } }),
    );
    ordersApi.create.mockReturnValue(of({ ok: true, data: created } satisfies SilentResult<Order>));

    await pickCustomer('cp-1');
    await addItem('p-2', 8);
    const orgSelect = fixture.nativeElement.querySelector('[data-test="order-organization"]') as HTMLSelectElement;
    orgSelect.value = 'org-1';
    orgSelect.dispatchEvent(new Event('change'));
    const paid = fixture.nativeElement.querySelector('[data-test="order-paid"]') as HTMLInputElement;
    paid.click();
    fixture.detectChanges();
    await submit();

    expect(ordersApi.create).toHaveBeenCalledWith({
      counterpartyId: 'cp-1',
      siteId: 'site-1',
      items: [{ productId: 'p-2', quantity: 8 }],
      organizationId: 'org-1',
      isPaid: true,
      status: 'draft',
    });
  });

  it('shows a banner and does not create the order when ensure-default fails', async () => {
    await setup();
    await settle();
    sitesApi.ensureDefault.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500 }) } satisfies SilentResult<never>),
    );

    await pickCustomer('cp-1');

    await pickCustomer('cp-1');
    await addItem('p-1', 1);
    await submit();

    expect(ordersApi.create).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="order-error"]')).toBeTruthy();
  });

  it('shows a banner when the order create call fails and stays on the page', async () => {
    await setup();
    await settle();
    sitesApi.ensureDefault.mockReturnValue(
      of({ ok: true, data: { _id: 'site-1', counterpartyId: 'cp-1', name: 'Склад №1', address: '' } }),
    );
    ordersApi.create.mockReturnValue(
      of({ ok: false, error: new HttpErrorResponse({ status: 500 }) } satisfies SilentResult<Order>),
    );

    await pickCustomer('cp-1');

    await pickCustomer('cp-1');
    await addItem('p-1', 1);
    await submit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-test="order-error"]')).toBeTruthy();
  });

  it('never references stub-proposal anywhere in the create page', async () => {
    await setup();
    await settle();

    expect(fixture.nativeElement.innerHTML).not.toContain('stub-proposal');
    expect(fixture.nativeElement.textContent).not.toContain('Создать черновик КП');
  });
});