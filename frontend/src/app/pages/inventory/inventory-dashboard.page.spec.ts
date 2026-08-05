import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { InventoryDashboardPage } from './inventory-dashboard.page';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { TableComponent } from '../../shared/ui/pi-table.component';

describe('InventoryDashboardPage (TZ-UI-TABLE-305)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(InventoryDashboardPage, {
        set: { imports: [TableComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders the shared Flat table for low-stock rows without a raw table', async () => {
    const fixture = TestBed.createComponent(InventoryDashboardPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/storage-items').flush({ items: [], total: 0 });
    httpMock.expectOne('/api/inventory/low-stock').flush({
      items: [
        {
          _id: 'stock-1',
          name: 'Бумага',
          warehouseId: 'warehouse-1',
          quantity: 1,
          reservedQty: 0,
          minQuantity: 5,
          isActive: true,
        },
      ],
      total: 1,
    });
    httpMock.expectOne('/api/warehouses').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="inventory-low-stock-table"]'),
    ).toBeTruthy();
  });
});
