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
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import { ProductsService } from '../../shared/services/products.service';
import { ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiPhotoLightboxComponent } from '../../shared/ui/photo';
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

function flushDictionaryLabels(httpMock: HttpTestingController): void {
  const requests = httpMock.match(
    (request) =>
      request.method === 'GET' && request.urlWithParams.startsWith(`${baseUrl}/dictionary-labels`),
  );
  for (const request of requests) request.flush([]);
}

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
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            getProductTree: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: {
                  _id: 'p1',
                  name: 'Окно ПВХ',
                  kind: 'product',
                  quantity: 1,
                  children: [
                    {
                      _id: 'mod1',
                      name: 'Рама · R-1',
                      kind: 'module',
                      quantity: 1,
                      children: [
                        {
                          _id: 'mat1',
                          name: 'Профиль',
                          kind: 'material',
                          quantity: 2,
                          children: [],
                        },
                        {
                          _id: 'mat1b',
                          name: 'Уплотнитель',
                          kind: 'material',
                          quantity: 1,
                          children: [],
                        },
                      ],
                    },
                    {
                      _id: 'mod2',
                      name: 'Стеклопакет · SP-2',
                      kind: 'module',
                      quantity: 1,
                      children: [
                        {
                          _id: 'mat2',
                          name: 'Стекло',
                          kind: 'material',
                          quantity: 1,
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              }),
            ),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            list: jest.fn().mockReturnValue(
              of({
                ok: true,
                data: [
                  {
                    _id: 'cat-trainers',
                    name: 'Тренажёры',
                    slug: 'trenazhery',
                    type: 'product',
                    skuPrefix: 'TR',
                    sortOrder: 0,
                    isActive: true,
                  },
                ],
              }),
            ),
          },
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
      limit: 10,
    });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
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
    TestBed.inject(PiChromeToolsService).clear('products-page');
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
    expect(fixture.nativeElement.querySelector('tr.pi-table-row--open')).toBeTruthy();
    expect(
      fixture.nativeElement
        .querySelector('[data-test="table-row-p1"]')
        ?.classList.contains('pi-table-row--open'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-test="expanded-row"] [role="region"]'),
    ).toBeTruthy();
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
    expect(fixture.nativeElement.querySelector('tr.pi-table-row--open')).toBeFalsy();
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
    expect(fixture.nativeElement.querySelectorAll('[data-test="expanded-row"]')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="expanded-row"] [role="region"]'),
    ).toBeTruthy();
  });

  it('expanded rows are keyboard-toggleable and expose an accessible region name', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };
    const row = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;

    expect(row.getAttribute('tabindex')).toBe('0');
    expect(row.getAttribute('aria-expanded')).toBe('false');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(comp.expandedId()).toBe('p1');
    expect(row.getAttribute('aria-expanded')).toBe('true');
    const expanded = fixture.nativeElement.querySelector(
      '[data-test="expanded-row"] [role="region"]',
    ) as HTMLElement;
    expect(expanded.getAttribute('aria-label')).toBe('Состав товара: Окно ПВХ');
  });

  it('expanded module cards render name, article and «N материалов»', async () => {
    const fixture = await renderPage();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    const tray = fixture.nativeElement.querySelector(
      '[data-test="expanded-content"]',
    ) as HTMLElement;
    expect(tray).toBeTruthy();
    expect(tray.className).toContain('gold-soft');
    expect(tray.className).toContain('border-l-gold');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-tree"]')).toBeTruthy();

    const card = fixture.nativeElement.querySelector(
      '[data-test="module-card-mod1"]',
    ) as HTMLElement;
    expect(card).toBeTruthy();
    expect(card.textContent).toContain('мод');
    expect(card.textContent).toContain('Рама');
    expect(card.textContent).toContain('R-1');
    expect(card.textContent).toContain('2 материалов');

    const card2 = fixture.nativeElement.querySelector(
      '[data-test="module-card-mod2"]',
    ) as HTMLElement;
    expect(card2.textContent).toContain('Стеклопакет');
    expect(card2.textContent).toContain('1 материалов');
  });

  it('loads and renders a cached depth-two hierarchy with child kind badges', async () => {
    const fixture = await renderPage();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-p1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="expanded-tree"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="preview-module-mod1"]')).toBeTruthy();
    const child = fixture.nativeElement.querySelector(
      '[data-test="preview-child-mat1"]',
    ) as HTMLElement;
    expect(child.textContent).toContain('мат');
    expect(child.textContent).toContain('Профиль');
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

  // ─── Catalog UX: view toggle, columns, filters rail ───

  it('view-grid button switches to grid and renders md showcase cards', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    expect(comp.viewMode()).toBe('list');
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('grid');
    const grid = fixture.nativeElement.querySelector('[data-test="products-grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    // Denser than list-era 3-col/gap-4 — closer to KP catalog rail tile width.
    expect(grid.className).toContain('xl:grid-cols-4');
    expect(grid.className).toContain('2xl:grid-cols-5');
    expect(grid.className).toContain('gap-2.5');
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cell-p1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-size="md"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeFalsy();
  });

  it('grid card shows name and price', async () => {
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
    expect(fixture.nativeElement.querySelector('[data-test="showcase-price"]')).toBeTruthy();
  });

  it('grid card image opens the photo lightbox without following the product link', async () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush({
      items: [
        {
          ...PRODUCTS[0],
          photoIds: [
            { _id: 'photo-1', storageUrl: '/uploads/front.jpg', originalFilename: 'front.jpg' },
          ],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-test="view-grid-button"]') as HTMLElement).click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[data-test="showcase-media"]') as HTMLElement).click();

    expect(dialogSpy.open).toHaveBeenCalledWith(
      PiPhotoLightboxComponent,
      expect.objectContaining({
        data: {
          src: '/uploads/front.jpg',
          alt: 'front.jpg',
          filename: 'front.jpg',
        },
      }),
    );
  });

  it('table keeps photo+name and hides sku/status/stock/kind', async () => {
    const fixture = await renderPage();
    const comp = fixture.componentInstance as unknown as { cols: { key: string }[] };
    const keys = comp.cols.map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining(['photoIds', 'name', 'unit', 'listPrice', 'costPrice']),
    );
    expect(keys).not.toContain('sku');
    expect(keys).not.toContain('status');
    expect(keys).not.toContain('stockQty');
    expect(keys).not.toContain('kind');
  });

  it('category filter reloads list with ?categoryId=', async () => {
    const fixture = await renderPage();
    TestBed.inject(PiChromeToolsService)
      .leftTools()
      .find((t) => t.id === 'filters')!
      .onClick();
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector(
      '[data-test="category-filter"]',
    ) as HTMLSelectElement;
    expect(select).toBeTruthy();
    select.value = 'cat-trainers';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    const req = httpMock.expectOne(
      (r) =>
        r.url === listUrl && r.method === 'GET' && r.params.get('categoryId') === 'cat-trainers',
    );
    expect(req.request.params.get('categoryId')).toBe('cat-trainers');
    req.flush({ items: [PRODUCTS[0]], total: 1, page: 1, limit: 10 });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
  });

  it('TZ-UX-326: no w-12 filters-rail; chrome has filters left and view/refresh right', async () => {
    const fixture = await renderPage();
    const chrome = TestBed.inject(PiChromeToolsService);
    const layout = fixture.nativeElement.querySelector(
      '[data-test="products-layout"]',
    ) as HTMLElement;

    expect(fixture.nativeElement.querySelector('[data-test="filters-rail"]')).toBeNull();
    expect(layout.className).not.toContain('w-12');
    expect(fixture.nativeElement.querySelector('.w-12')).toBeNull();
    expect(chrome.leftTools().map((t) => t.id)).toEqual(['filters']);
    expect(chrome.leftTools()[0]!.ariaLabel).toBe('Фильтры');
    expect(chrome.rightTools().map((t) => t.id)).toEqual(['view-list', 'view-grid', 'refresh']);
    expect(chrome.rightTools().map((t) => t.ariaLabel)).toEqual([
      'Показать списком',
      'Показать карточками',
      'Обновить',
    ]);
  });

  it('filters rail toggles open as overlay', async () => {
    const fixture = await renderPage();
    const chrome = TestBed.inject(PiChromeToolsService);
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeFalsy();
    chrome
      .leftTools()
      .find((t) => t.id === 'filters')!
      .onClick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="filters-backdrop"]')).toBeTruthy();
    expect(chrome.leftTools().find((t) => t.id === 'filters')!.active).toBe(true);
  });

  it('filters backdrop click closes overlay', async () => {
    const fixture = await renderPage();
    TestBed.inject(PiChromeToolsService)
      .leftTools()
      .find((t) => t.id === 'filters')!
      .onClick();
    fixture.detectChanges();
    const backdrop = fixture.nativeElement.querySelector(
      '[data-test="filters-backdrop"]',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeFalsy();
  });

  it('filters panel stays open when interacting with selects', async () => {
    const fixture = await renderPage();
    TestBed.inject(PiChromeToolsService)
      .leftTools()
      .find((t) => t.id === 'filters')!
      .onClick();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-panel"]',
    ) as HTMLElement;
    const sort = fixture.nativeElement.querySelector(
      '[data-test="rail-sort"]',
    ) as HTMLSelectElement;
    expect(panel).toBeTruthy();
    expect(sort).toBeTruthy();

    panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    sort.value = 'listPrice:desc';
    sort.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush({
      items: PRODUCTS,
      total: PRODUCTS.length,
      page: 1,
      limit: 10,
    });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeTruthy();
    const contentCol = fixture.nativeElement.querySelector('[data-test="filters-backdrop"]')
      ?.parentElement as HTMLElement | undefined;
    expect(contentCol?.contains(panel)).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail"]')).toBeNull();
  });

  it('chrome view-grid and refresh tools switch grid and reload', async () => {
    const fixture = await renderPage();
    const chrome = TestBed.inject(PiChromeToolsService);
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    chrome
      .rightTools()
      .find((t) => t.id === 'view-grid')!
      .onClick();
    fixture.detectChanges();
    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="products-grid"]')).toBeTruthy();

    const page = fixture.componentInstance as unknown as { reload: () => void };
    const reloadSpy = jest.spyOn(page, 'reload');
    chrome
      .rightTools()
      .find((t) => t.id === 'refresh')!
      .onClick();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('grid card routerLink points to /products/:id', async () => {
    const fixture = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      '[data-test="showcase-link-p1"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/products/p1');
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
    httpMock.expectOne(matchListGet).flush({ items: [], total: 0, page: 1, limit: 10 });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
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

  it('TZ-UX-341: default list limit is 10; grid pager is app-pi-pagination', async () => {
    const fixture = TestBed.createComponent(ProductsPage);
    fixture.detectChanges();
    const req = httpMock.expectOne(matchListGet);
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ items: PRODUCTS, total: 25, page: 1, limit: 10 });
    await tickMicrotask();
    fixture.detectChanges();
    flushDictionaryLabels(httpMock);
    await tickMicrotask();
    fixture.detectChanges();

    // List mode: pi-table footer uses the same canon.
    expect(
      fixture.nativeElement.querySelector('app-pi-table [data-test="pi-pagination"]'),
    ).toBeTruthy();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector(
      '[data-test="grid-pager"] [data-test="pi-pagination"]',
    ) as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.querySelector('[data-test="pager-info"]')?.textContent?.trim()).toMatch(
      /1–10 из 25/,
    );
    expect(nav.querySelector('[data-test="pager-page-size"]')).toBeTruthy();

    const comp = fixture.componentInstance as unknown as {
      page: () => number;
      pageSize: () => number;
      onPageChange: (p: number) => void;
      onPageSizeChange: (s: number) => void;
    };
    comp.onPageChange(2);
    fixture.detectChanges();
    expect(comp.page()).toBe(2);
    httpMock.expectOne(matchListGet).flush({
      items: PRODUCTS,
      total: 25,
      page: 2,
      limit: 10,
    });
    await tickMicrotask();
    fixture.detectChanges();

    comp.onPageSizeChange(25);
    fixture.detectChanges();
    expect(comp.pageSize()).toBe(25);
    expect(comp.page()).toBe(1);
    await tickMicrotask();
    const sizeReqs = httpMock.match(matchListGet);
    expect(sizeReqs.length).toBeGreaterThanOrEqual(1);
    const sizeReq = sizeReqs[sizeReqs.length - 1]!;
    expect(sizeReq.request.params.get('limit')).toBe('25');
    expect(sizeReq.request.params.get('page')).toBe('1');
    sizeReq.flush({ items: PRODUCTS, total: 25, page: 1, limit: 25 });
    await tickMicrotask();
    fixture.detectChanges();
  });
});
