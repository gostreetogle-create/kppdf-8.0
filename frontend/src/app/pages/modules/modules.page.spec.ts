/**
 * TZ-CATALOG-372 — ModulesPage vitrine-parity tests.
 * TZ-CATALOG-374 — list expandable composition (products expand parity).
 *
 * The page renders the REAL imports (no NO_ERRORS_SCHEMA override of
 * imports) so that:
 *   - routerLink on the name link / grid cells produces a real href
 *     "/modules/:id";
 *   - the filters-rail overlay (toggle/panel/backdrop) is testable
 *     through the actual template;
 *   - PiShowcaseCard md renders under [data-test="modules-grid"];
 *   - (rowClick) toggles expandedId and [expandedRow] tray.
 *
 * The list is fetched through httpResource, so the harness uses
 * provideHttpClient + provideHttpClientTesting + API_BASE_URL and
 * flushes the initial GET /modules (products.page.spec pattern).
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ModulesPage } from './modules.page';
import {
  ProductModulesService,
  ProductModule,
  type CompositionTreeNode,
} from '../../shared/services/pi-product-modules.service';
import { PhotosService } from '../../shared/services/photos.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

describe('ModulesPage', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/modules`;
  const dialogSpy = {
    open: jest.fn().mockReturnValue({
      closed: signal<unknown>(undefined),
      close: jest.fn(),
    }),
  };

  const moduleTreePm1: CompositionTreeNode = {
    _id: 'pm1',
    name: 'Корпус шкафа',
    kind: 'module',
    quantity: 1,
    children: [
      {
        _id: 'mat1',
        name: 'ЛДСП 16мм',
        kind: 'material',
        quantity: 2,
        children: [],
      },
      {
        _id: 'pm-nested',
        name: 'Полка',
        kind: 'module',
        quantity: 1,
        children: [
          {
            _id: 'mat2',
            name: 'Кромка',
            kind: 'material',
            quantity: 1,
            children: [],
          },
        ],
      },
    ],
  };

  const getModuleTree = jest.fn().mockReturnValue(of({ ok: true, data: moduleTreePm1 }));

  const fakeModules: ProductModule[] = [
    {
      _id: 'pm1',
      name: 'Корпус шкафа',
      article: 'KW-001',
      materials: [{ materialId: 'mat1', quantity: 2, isPurchased: false, sortOrder: 1 }],
    } as ProductModule,
    { _id: 'pm2', name: 'Дверца', article: 'DW-001', materials: [] } as ProductModule,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  async function renderList(modules: ProductModule[] = fakeModules) {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(modules);
    await tickMicrotask();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    getModuleTree.mockClear();
    getModuleTree.mockReturnValue(of({ ok: true, data: moduleTreePm1 }));
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ModulesPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: ProductModulesService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            getModuleTree,
          },
        },
        {
          provide: PhotosService,
          useValue: { list: () => of({ ok: true, data: [] }) },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('fires an initial GET /api/modules on creation', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => ProductModule[];
      total: () => number;
      loading: () => boolean;
    };

    expect(comp.data().length).toBe(2);
    expect(comp.total()).toBe(2);
    expect(comp.loading()).toBe(false);
  });

  it('shows loading state before response', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { loading: () => boolean };
    expect(comp.loading()).toBe(true);

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
  });

  it('shows empty state when no modules', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      data: () => ProductModule[];
      total: () => number;
    };
    expect(comp.data().length).toBe(0);
    expect(comp.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock
      .expectOne(matchListGet)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await tickMicrotask();

    const comp = fixture.componentInstance as unknown as { error: () => string | null };
    expect(() => comp.error()).not.toThrow();
  });

  it('create button triggers openCreate', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();

    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  // ─── TZ-CATALOG-372: view toggle / grid vitrine ───

  it('view-grid button switches to grid and renders md showcase cards', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { viewMode: () => string };
    expect(comp.viewMode()).toBe('list');

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="modules-grid"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cell-pm1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeFalsy();
  });

  it('grid card shows name and cost hint (no batch cost-preview)', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-pm1"]',
    ) as HTMLElement;
    expect(card.textContent).toContain('Корпус шкафа');
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cost"]')).toBeTruthy();
  });

  it('grid card routerLink points to /modules/:id', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-pm1"]',
    ) as HTMLAnchorElement;
    expect(cell.getAttribute('href')).toBe('/modules/pm1');
  });

  it('grid view is persisted to localStorage on toggle', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(localStorage.getItem('pi-modules-view-mode')).toBe('grid');
  });

  it('pre-saved grid view mode renders grid on first load', async () => {
    localStorage.setItem('pi-modules-view-mode', 'grid');
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { viewMode: () => string };
    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="modules-grid"]')).toBeTruthy();
  });

  it('view-list button switches back to pi-table and persists list mode', async () => {
    localStorage.setItem('pi-modules-view-mode', 'grid');
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { viewMode: () => string };
    const listBtn = fixture.nativeElement.querySelector(
      '[data-test="view-list-button"]',
    ) as HTMLElement;
    listBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('list');
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="modules-grid"]')).toBeFalsy();
    expect(localStorage.getItem('pi-modules-view-mode')).toBe('list');
  });

  it('TZ-UX-341: grid pager is app-pi-pagination; pageSizeChange resets page to 1', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      _id: `pm${i + 1}`,
      name: `Модуль ${i + 1}`,
      article: `A-${i + 1}`,
      materials: [],
    })) as ProductModule[];
    const fixture = await renderList(many);
    const comp = fixture.componentInstance as unknown as {
      page: () => number;
      pageSize: () => number;
      paginatedRows: () => ProductModule[];
      onPageChange: (p: number) => void;
      onPageSizeChange: (s: number) => void;
    };

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
      /1–10 из 12/,
    );
    expect(comp.paginatedRows().length).toBe(10);

    comp.onPageChange(2);
    fixture.detectChanges();
    expect(comp.page()).toBe(2);
    expect(comp.paginatedRows().length).toBe(2);

    comp.onPageSizeChange(25);
    fixture.detectChanges();
    expect(comp.pageSize()).toBe(25);
    expect(comp.page()).toBe(1);
    expect(comp.paginatedRows().length).toBe(12);
    // total ≤ pageSize → pager hides
    expect(
      fixture.nativeElement.querySelector('[data-test="grid-pager"] [data-test="pi-pagination"]'),
    ).toBeFalsy();
  });

  // ─── TZ-CATALOG-372: list chrome (photo cell, name link) ───

  it('photo empty tile renders when module has no photo', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    // pm1 has no mainPhotoId/photoIds → app-pi-empty-tile in the Фото cell.
    expect(fixture.nativeElement.querySelector('app-pi-empty-tile')).toBeTruthy();
  });

  it('name link in list points to /modules/:id', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush(fakeModules);
    await tickMicrotask();
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test="open-row-link"]'),
    ) as HTMLAnchorElement[];
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/modules/pm2', '/modules/pm1']);
  });

  // ─── TZ-CATALOG-372: filters rail overlay ───

  it('filters rail toggles open as overlay with backdrop', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-toggle"]',
    ) as HTMLElement;
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeFalsy();
    toggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="filters-backdrop"]')).toBeTruthy();
  });

  it('filters backdrop click closes overlay', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([]);
    await tickMicrotask();
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-toggle"]',
    ) as HTMLElement;
    toggle.click();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '[data-test="filters-backdrop"]',
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeFalsy();
  });

  // ─── TZ-CATALOG-372: client-side «Состав» filter ───

  it('composition filter filters client-side (empty hides modules with materials)', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      { _id: 'pm1', name: 'Корпус шкафа', article: 'KW-001', materials: [] } as ProductModule,
      {
        _id: 'pm2',
        name: 'Дверца',
        article: 'DW-001',
        materials: [
          { materialId: 'm1', quantity: 1, isPurchased: false, sortOrder: 1 },
        ] as ProductModule['materials'],
      } as ProductModule,
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { total: () => number };
    expect(comp.total()).toBe(2);

    const select = fixture.nativeElement.querySelector(
      '[data-test="composition-filter"]',
    ) as HTMLSelectElement;
    select.value = 'empty';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(comp.total()).toBe(1);
  });

  it('clear-filters resets the composition filter', async () => {
    const fixture = TestBed.createComponent(ModulesPage);
    fixture.detectChanges();
    httpMock.expectOne(matchListGet).flush([
      { _id: 'pm1', name: 'Корпус шкафа', article: 'KW-001', materials: [] } as ProductModule,
      {
        _id: 'pm2',
        name: 'Дверца',
        article: 'DW-001',
        materials: [
          { materialId: 'm1', quantity: 1, isPurchased: false, sortOrder: 1 },
        ] as ProductModule['materials'],
      } as ProductModule,
    ]);
    await tickMicrotask();
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-toggle"]',
    ) as HTMLElement;
    toggle.click();
    fixture.detectChanges();

    const railSelect = fixture.nativeElement.querySelector(
      '[data-test="rail-composition"]',
    ) as HTMLSelectElement;
    railSelect.value = 'empty';
    railSelect.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { total: () => number };
    expect(comp.total()).toBe(1);

    const clear = fixture.nativeElement.querySelector('[data-test="clear-filters"]') as HTMLElement;
    clear.click();
    fixture.detectChanges();

    expect(comp.total()).toBe(2);
  });

  // ─── TZ-CATALOG-374: list expandable composition ───

  it('row click toggles expandedId and renders the expanded composition tray', async () => {
    const fixture = await renderList();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-pm1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.expandedId()).toBe('pm1');
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-content"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test="module-expand-sections"]'),
    ).toBeTruthy();
    expect(getModuleTree).toHaveBeenCalledWith('pm1', 2);
    expect(fixture.nativeElement.querySelector('[data-test="expanded-tree"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="preview-child-mat1"]')).toBeTruthy();
  });

  it('second click on the same row collapses (expandedId → null)', async () => {
    const fixture = await renderList();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-pm1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();
    expect(comp.expandedId()).toBe('pm1');

    rowEl.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeFalsy();
  });

  it('clicking a DIFFERENT row switches the expansion', async () => {
    getModuleTree.mockImplementation((id: string) =>
      of({
        ok: true,
        data: {
          _id: id,
          name: id === 'pm1' ? 'Корпус шкафа' : 'Дверца',
          kind: 'module' as const,
          quantity: 1,
          children: [
            {
              _id: `mat-${id}`,
              name: 'Материал',
              kind: 'material' as const,
              quantity: 1,
              children: [],
            },
          ],
        },
      }),
    );
    const fixture = await renderList([
      {
        _id: 'pm1',
        name: 'Корпус шкафа',
        article: 'KW-001',
        materials: [{ materialId: 'm1', quantity: 1, isPurchased: false, sortOrder: 1 }],
      } as ProductModule,
      {
        _id: 'pm2',
        name: 'Дверца',
        article: 'DW-001',
        materials: [{ materialId: 'm2', quantity: 1, isPurchased: false, sortOrder: 1 }],
      } as ProductModule,
    ]);
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const row1 = fixture.nativeElement.querySelector('[data-test="table-row-pm1"]') as HTMLElement;
    row1.click();
    fixture.detectChanges();
    expect(comp.expandedId()).toBe('pm1');

    const row2 = fixture.nativeElement.querySelector('[data-test="table-row-pm2"]') as HTMLElement;
    row2.click();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    expect(comp.expandedId()).toBe('pm2');
    expect(fixture.nativeElement.querySelectorAll('[data-test="expanded-row"]')).toHaveLength(1);
  });

  it('name link still points to /modules/:id and does not require expand', async () => {
    const fixture = await renderList();
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test="open-row-link"]'),
    ) as HTMLAnchorElement[];
    expect(links.some((l) => l.getAttribute('href') === '/modules/pm1')).toBe(true);

    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-pm1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    const openDetail = fixture.nativeElement.querySelector(
      '[data-test="module-expand-open-detail"]',
    ) as HTMLAnchorElement;
    expect(openDetail.getAttribute('href')).toBe('/modules/pm1');
  });

  it('empty composition shows RU empty message without calling getModuleTree', async () => {
    const fixture = await renderList([
      { _id: 'pm1', name: 'Корпус шкафа', article: 'KW-001', materials: [] } as ProductModule,
      { _id: 'pm2', name: 'Дверца', article: 'DW-001', materials: [] } as ProductModule,
    ]);
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-pm2"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="expanded-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('В составе нет материалов');
    expect(getModuleTree).not.toHaveBeenCalled();
  });

  it('tree load success path renders child kind badges and material links', async () => {
    const fixture = await renderList();
    const rowEl = fixture.nativeElement.querySelector('[data-test="table-row-pm1"]') as HTMLElement;
    rowEl.click();
    fixture.detectChanges();
    await tickMicrotask();
    fixture.detectChanges();

    const child = fixture.nativeElement.querySelector(
      '[data-test="preview-child-mat1"]',
    ) as HTMLElement;
    expect(child.textContent).toContain('мат');
    expect(child.textContent).toContain('ЛДСП 16мм');
    const link = child.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/materials/mat1');
  });

  it('row-actions (edit) do NOT trigger the row expand', async () => {
    const fixture = await renderList();
    const comp = fixture.componentInstance as unknown as { expandedId: () => string | null };

    const editBtn = fixture.nativeElement.querySelector(
      '[data-test="edit-button-pm1"]',
    ) as HTMLElement;
    editBtn.click();
    fixture.detectChanges();

    expect(comp.expandedId()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeFalsy();
  });
});
