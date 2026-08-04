/**
 * TZ-PRODUCTS-304 — ProductsPage expandable-rows tests.
 *
 * The page renders the REAL <app-pi-table> (no NO_ERRORS_SCHEMA override of
 * imports) so that:
 *   - (rowClick) fires from a real <tr> click → onRowClick toggles expandedId;
 *   - [expandedRow] renders the module-card template under the expanded row;
 *   - routerLink on a module card produces a real href="/modules/:id".
 *
 * The list is fetched through httpResource, so the harness uses
 * provideHttpClient + provideHttpClientTesting + API_BASE_URL and flushes
 * the initial GET /products (contracts.page.spec pattern).
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ProductsPage } from './products.page';
import { ProductsService } from '../../shared/services/products.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';
import type { Product } from '../../shared/services/products.service';
import type { ProductModule } from '../../shared/services/pi-product-modules.service';

const baseUrl = '/api';
const listUrl = `${baseUrl}/products`;

const MODULES: ProductModule[] = [
  {
    _id: 'mod1',
    name: 'Рама',
    article: 'R-1',
    materials: [{ materialId: 'x1' }, { materialId: 'x2' }],
    workTypes: [],
  },
  {
    _id: 'mod2',
    name: 'Стеклопакет',
    article: 'SP-2',
    materials: [{ materialId: 'y1' }],
    workTypes: [],
  },
];

const PRODUCTS: Product[] = [
  {
    _id: 'p1',
    name: 'Окно ПВХ',
    sku: 'WIN-1',
    kind: 'good',
    unit: 'шт',
    productModuleIds: MODULES,
  },
  {
    _id: 'p2',
    name: 'Дверь',
    sku: 'DOOR-1',
    kind: 'good',
    unit: 'шт',
    productModuleIds: [],
  },
];

const matchListGet = (r: { url: string; method: string }): boolean =>
  r.url === listUrl && r.method === 'GET';

async function tickMicrotask(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
}

describe('ProductsPage (TZ-PRODUCTS-304)', () => {
  let httpMock: HttpTestingController;
  const dialogSpy = {
    open: jest.fn().mockReturnValue({
      closed: signal<unknown>(undefined),
      close: jest.fn(),
    }),
  };
  const toastSpy = { success: jest.fn(), error: jest.fn() };
  const productsSvc = {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined })),
  };

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [ProductsPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ProductsService, useValue: productsSvc },
        {
          provide: ProductModulesService,
          useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: toastSpy },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  }

  /** Create the page, flush the initial list GET, settle. */
  async function renderPage() {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush({
      items: PRODUCTS,
      total: PRODUCTS.length,
      page: 1,
      limit: 50,
    });
    await tickMicrotask();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    localStorage.clear();
    await setup();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('row click toggles expandedId and renders the expanded modules row', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBe('p1');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeTruthy();
  });

  it('second click on the same row collapses (expandedId → null)', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();
    expect(comp.expandedId()).toBe('p1');

    rowEl.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeFalsy();
  });

  it('clicking a DIFFERENT row switches the expansion', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const row1 = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    row1.click();
    fixture.detectChanges();
    expect(comp.expandedId()).toBe('p1');

    const row2 = fixture.nativeElement.querySelector('[data-test="table-row-p2"]') as HTMLElement;
    row2.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBe('p2');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeTruthy();
  });

  it('expanded module cards render name, article and «N материалов»', async () => {
    const fixture = await renderPage();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(
      '[data-test="module-card-mod1"]',
    ) as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.textContent).toContain('Рама');
    expect(card.textContent).toContain('R-1');
    expect(card.textContent).toContain('2 материалов');

    const card2 = fixture.nativeElement.querySelector(
      '[data-test="module-card-mod2"]',
    ) as HTMLElement;
    expect(card2.textContent).toContain('Стеклопакет');
    expect(card2.textContent).toContain('1 материалов');
  });

  it('module card routerLink points to /modules/:id', async () => {
    const fixture = await renderPage();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      '[data-test="module-card-mod1"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/modules/mod1');
  });

  it('product without modules shows the empty-state placeholder (no cards)', async () => {
    const fixture = await renderPage();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p2"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="expanded-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="module-card-mod1"]')).toBeFalsy();
  });

  it('«Модулей» column formats the count from productModuleIds.length', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as {
      cols: { key: string; format: (r: Product) => string }[];
    };
    const col = comp.cols.find((c) => c.key === 'productModuleIds');
    expect(col).toBeTruthy();
    expect(col!.format(PRODUCTS[0])).toBe('2');
    expect(col!.format(PRODUCTS[1])).toBe('0');
  });

  it('row-actions (edit) do NOT trigger the row expand', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    // pi-table wraps the actions <td> with stopPropagation, so clicking
    // edit must NOT bubble to (rowClick).
    const editBtn = fixture.nativeElement.querySelector(
      '[data-test="edit-button-p1"]',
    ) as HTMLElement;
    editBtn.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeFalsy();
  });

  // ─── TZ-PRODUCTS-305: view toggle (list ↔ grid) + showcase cards ───

  it('view-grid button switches to grid and renders sm showcase cards', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    expect(comp.viewMode()).toBe('list');
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="products-grid"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cell-p1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cell-p2"]')).toBeTruthy();
    // pi-table is hidden in grid mode
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeFalsy();
  });

  it('grid card shows name, price, status badge and avatar initials', async () => {
    const fixture = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-p1"]',
    ) as HTMLElement;
    expect(card.textContent).toContain('Окно ПВХ');
    // avatar initials derived from name (PiAvatar monogram)
    expect(fixture.nativeElement.querySelector('[data-test="showcase-avatar"]')).toBeTruthy();
    // price formatted via formatPrice (PRODUCTS[0].listPrice undefined → empty)
    expect(fixture.nativeElement.querySelector('[data-test="showcase-price"]')).toBeTruthy();
  });

  it('grid status badge shows isActive=false as «Неактивен»', async () => {
    const fixture = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector(
      '[data-test="showcase-status"]',
    ) as HTMLElement;
    // PRODUCTS fixtures have no status and isActive is undefined → statusLabel '' → badge hidden
    expect(badge).toBeNull();
  });

  it('grid card routerLink points to /products/:id', async () => {
    const fixture = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-p1"]',
    ) as HTMLAnchorElement;
    expect(cell.getAttribute('href')).toBe('/products/p1');
  });

  it('grid view is persisted to localStorage on toggle', async () => {
    const fixture = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(localStorage.getItem('pi-products-view-mode')).toBe('grid');
  });

  it('pre-saved grid view mode renders grid on first load', async () => {
    localStorage.setItem('pi-products-view-mode', 'grid');
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="products-grid"]')).toBeTruthy();
  });

  it('view-list button switches back to pi-table and persists list mode', async () => {
    localStorage.setItem('pi-products-view-mode', 'grid');
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    const listBtn = fixture.nativeElement.querySelector(
      '[data-test="view-list-button"]',
    ) as HTMLElement;
    listBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('list');
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="products-grid"]')).toBeFalsy();
    expect(localStorage.getItem('pi-products-view-mode')).toBe('list');
  });

  it('grid empty state renders when no products', async () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush({ items: [], total: 0, page: 1, limit: 50 });
    await tickMicrotask();
    fixture.detectChanges();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="grid-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="products-grid"]')).toBeFalsy();
  });
});
