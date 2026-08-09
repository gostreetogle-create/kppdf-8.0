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
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { ProposalDraftLine } from './proposal-product-rail.component';

describe('ProposalCreatePage (TZ-SALES-314…316)', () => {
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
        {
          provide: OrganizationsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: { items: [{ _id: 'org-1', name: 'ООО Альфа' }], total: 1 },
              }),
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'tpl-1',
                      name: 'КП стандарт',
                      description: 'Базовый бланк',
                      tags: [],
                      organizationId: 'org-1',
                      docTypeId: 'dt-1',
                      isDefault: true,
                      isActive: true,
                      pageSize: 'A4',
                      backgroundImage: [],
                      defaultBackgroundIndex: 0,
                      backgroundOpacity: 1,
                      orientation: 'portrait',
                      version: 1,
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
  });

  it('renders the product rail search control', () => {
    expect(fixture.debugElement.query(By.css('[data-test="kp-product-rail"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-rail-search"]'))).toBeTruthy();
  });

  it('renders the inspector with estimate hint (SALES-315)', () => {
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-inspector"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-insp-estimate"]'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('оценка');
  });

  it('renders template center (SALES-316)', () => {
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-template-center"]')),
    ).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-select"]'))).toBeTruthy();
  });
});
