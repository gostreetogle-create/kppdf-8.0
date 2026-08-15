/**
 * TZ-CATALOG-372 — ModulesPage vitrine-parity tests.
 *
 * The page renders the REAL imports (no NO_ERRORS_SCHEMA override of
 * imports) so that:
 *   - routerLink on the name link / grid cells produces a real href
 *     "/modules/:id";
 *   - the filters-rail overlay (toggle/panel/backdrop) is testable
 *     through the actual template;
 *   - PiShowcaseCard md renders under [data-test="modules-grid"].
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

  const fakeModules: ProductModule[] = [
    { _id: 'pm1', name: 'Корпус шкафа', article: 'KW-001' } as ProductModule,
    { _id: 'pm2', name: 'Дверца', article: 'DW-001' } as ProductModule,
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
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
});
