import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailPage } from './product-detail.page';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { CostCalculationsService } from '../../shared/services/pi-cost-calculations.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';
import { CatalogReturnStore } from '../../shared/navigation/catalog-return.util';

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

function flushDictionaryLabels(httpMock: HttpTestingController): void {
  const requests = httpMock.match(
    (request) =>
      request.method === 'GET' && request.urlWithParams.startsWith('/api/dictionary-labels'),
  );
  for (const request of requests) request.flush([]);
}

describe('ProductDetailPage (TZ-UX-444B)', () => {
  let fixture: ComponentFixture<ProductDetailPage>;
  let httpMock: HttpTestingController;

  const productBody = {
    _id: 'prod-1',
    name: 'Горка',
    sku: 'G-01',
    kind: 'product',
    status: 'active',
    isActive: true,
    listPrice: 1000,
    costPrice: 500,
    basePrice: 400,
    composition: [],
    productModuleIds: [],
  };

  const whereUsedBody = {
    items: [
      {
        id: 'prod-2',
        kind: 'product',
        name: 'Горка двухскатная',
        relation: 'product',
        quantity: 1,
        unit: 'шт',
      },
      {
        id: 'mod-9',
        kind: 'module',
        name: 'Крепёжный узел',
        relation: 'product',
        quantity: 4,
        unit: 'шт',
      },
    ],
    total: 2,
    page: 1,
    limit: 50,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (k: string) => (k === 'id' ? 'prod-1' : null) }),
            snapshot: { paramMap: { get: (k: string) => (k === 'id' ? 'prod-1' : null) } },
          },
        },
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: ProductModulesService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            getProductTree: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  _id: 'prod-1',
                  name: 'Горка',
                  kind: 'product',
                  quantity: 1,
                  children: [],
                },
              }),
            ),
            getProductComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            getModuleComposition: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            getCostPreview: jest
              .fn()
              .mockReturnValue(
                of({ ok: true, data: { materialCost: 0, laborCost: 0, totalCost: 0 } }),
              ),
            addProductCompositionLine: jest.fn(),
            updateProductCompositionLine: jest.fn(),
            removeProductCompositionLine: jest.fn(),
            addModuleCompositionLine: jest.fn(),
            updateModuleCompositionLine: jest.fn(),
            removeModuleCompositionLine: jest.fn(),
          },
        },
        {
          provide: MaterialsService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) },
        },
        {
          provide: CostCalculationsService,
          useValue: {
            list: jest.fn(),
            create: jest.fn(),
            activate: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductDetailPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/products/prod-1').flush(productBody);
    httpMock.expectOne('/api/products/prod-1/cost-calculations').flush([]);
    const whereUsed = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.urlWithParams.startsWith('/api/products/prod-1/where-used'),
    );
    expect(whereUsed.request.params.get('limit')).toBe('50');
    whereUsed.flush(whereUsedBody);
    await tickMicrotask();
    fixture.detectChanges();
    // composition-tree / catalog kind colors may request appearance settings
    const appearance = httpMock.match('/api/settings/catalog-appearance');
    for (const req of appearance) req.flush({});
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();
  });

  afterEach(() => {
    flushDictionaryLabels(httpMock);
    const leftover = httpMock.match(() => true);
    for (const req of leftover) req.flush({});
    httpMock.verify();
  });

  it('renders A+ split layout with where-used above BOM', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="product-detail-layout"]')).toBeTruthy();
    expect(el.querySelector('[data-test="product-detail-aside"]')).toBeTruthy();
    expect(el.querySelector('[data-test="product-where-used"]')).toBeTruthy();
    expect(el.querySelector('[data-test="product-composition-panel"]')).toBeTruthy();
    expect(el.querySelector('[data-test="product-title"]')?.textContent).toContain('Горка');
  });

  it('shows where-used rows with type, name, quantity, unit', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="product-where-used"]') as HTMLElement;
    expect(section.textContent).toContain('Горка двухскатная');
    expect(section.textContent).toContain('Товар');
    expect(section.textContent).toContain('Модуль');
    expect(section.textContent).toContain('Крепёжный узел');
    expect(section.textContent).toContain('4');
    expect(section.textContent).toContain('шт');
  });

  it('links where-used rows to the referenced card', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('[data-test="product-where-used"] a'),
    );
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toContain('/products/prod-2');
    expect(links[1].getAttribute('href')).toContain('/modules/mod-9');
  });

  it('shows RU empty state when where-used has no items', async () => {
    const page = fixture.componentInstance as unknown as {
      whereUsedRes: { reload: () => unknown };
    };
    page.whereUsedRes.reload();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();
    const whereUsedEmpty = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.urlWithParams.startsWith('/api/products/prod-1/where-used'),
    );
    whereUsedEmpty.flush({ items: [], total: 0, page: 1, limit: 50 });
    await tickMicrotask();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-test="product-where-used"]') as HTMLElement;
    expect(section.textContent).toContain('Этот товар пока не используется');
  });

  it('onBack uses CatalogReturnStore (TZ-UX-313)', () => {
    const store = TestBed.inject(CatalogReturnStore);
    const spy = jest.spyOn(store, 'navigateBackOr');
    store.setPreviousUrlForTests('/products');
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { onBack: () => void }).onBack();
    expect(spy).toHaveBeenCalledWith('/products');
  });
});
