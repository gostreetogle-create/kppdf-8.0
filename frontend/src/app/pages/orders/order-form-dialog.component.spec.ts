import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { OrderFormDialogComponent } from './order-form-dialog.component';

interface Control<T> {
  setValue(value: T): void;
}

interface OrderFormHarness {
  form: {
    controls: {
      counterpartyId: Control<string>;
      siteId: Control<string>;
    };
  };
  itemsArray: {
    at(index: number): {
      controls: {
        productId: Control<string>;
        quantity: Control<number>;
        unitPrice: Control<number>;
      };
    };
  };
  onSubmit(): void;
  submitting(): boolean;
}

const flushLookups = (httpMock: HttpTestingController): void => {
  httpMock
    .expectOne((req) => req.url === '/api/counterparties')
    .flush({
      items: [],
      total: 0,
      page: 1,
      limit: 200,
    });
  httpMock
    .expectOne((req) => req.url === '/api/products')
    .flush({
      items: [],
      total: 0,
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

describe('OrderFormDialogComponent A2 characterization', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFormDialogComponent],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PI_DIALOG_DATA, useValue: null },
        { provide: PI_DIALOG_REF, useValue: { close: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(OrderFormDialogComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads owner users through the existing Users entity service', () => {
    const fixture = TestBed.createComponent(OrderFormDialogComponent);
    flushLookups(httpMock);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not submit twice while the first order request is pending', () => {
    const fixture = TestBed.createComponent(OrderFormDialogComponent);
    flushLookups(httpMock);
    const component = fixture.componentInstance as unknown as OrderFormHarness;
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
});
