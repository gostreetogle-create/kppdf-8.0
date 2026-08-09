import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ProposalCreatePage } from './proposal-create.page';
import { AuthService } from '../../../core/auth.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { ProductsService } from '../../../shared/services/products.service';
import { ProposalDraftLine } from './proposal-product-rail.component';

describe('ProposalCreatePage (TZ-SALES-314)', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalCreatePage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AuthService,
          useValue: {
            user: signal({ pages: ['proposals', 'contracts', 'orders'] }),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'prod-1',
                      name: 'Стенд',
                      sku: 'ST-1',
                      kind: 'product',
                      unit: 'шт',
                      listPrice: 5000,
                    },
                  ],
                  total: 1,
                },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalCreatePage);
    fixture.detectChanges();
  });

  it('keeps three studio regions', () => {
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-center"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-right"]'))).toBeTruthy();
  });

  it('adds a draft line from the product rail into memory', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onProductAdd: (line: ProposalDraftLine) => void;
      draftLines: () => ProposalDraftLine[];
    };

    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      quantity: 1,
      unitPrice: 5000,
    });
    fixture.detectChanges();

    expect(page.draftLines().length).toBe(1);
    expect(page.draftLines()[0].productName).toBe('Стенд');
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-draft-lines"]'))).toBeTruthy();
  });

  it('renders the product rail search control', () => {
    expect(fixture.debugElement.query(By.css('[data-test="kp-product-rail"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-rail-search"]'))).toBeTruthy();
  });
});
