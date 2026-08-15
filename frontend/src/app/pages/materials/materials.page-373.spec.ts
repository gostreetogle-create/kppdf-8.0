import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MaterialsPage } from './materials.page';
import { OrganizationsService } from '../../shared/services/organizations.service';
import { PhotosService } from '../../shared/services/photos.service';
import { MaterialsService, Material } from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-CATALOG-373 — materials list↔grid + filters-rail (canon products).
 *
 * Own suite (like materials.page-316.spec.ts) because the
 * settled→signal→flushEffects re-fetch cycle trips NG0101 when mixed
 * with the debouncedSearch suite in materials.page.spec.ts.
 *
 * Renders the REAL page (imports: [MaterialsPage], provideRouter) so:
 *   - view-toggle buttons are clickable native <button>s;
 *   - grid cell routerLink produces a real href="/materials/:id";
 *   - the filters-rail overlay + backdrop are in the DOM.
 */
describe('MaterialsPage vitrine (TZ-CATALOG-373)', () => {
  let httpMock: HttpTestingController;
  const baseUrl = '/api';
  const listUrl = `${baseUrl}/materials`;

  const fakeItems: Material[] = [
    { _id: 'm1', name: 'Сталь лист 3мм', article: 'ST-3', unit: 'м2', pricePerUnit: 1240.5 },
    { _id: 'm2', name: 'Алюминий пруток', article: 'AL-10', unit: 'кг', pricePerUnit: 380 },
  ];

  const matchListGet = (r: { url: string; method: string }): boolean =>
    r.url === listUrl && r.method === 'GET';

  async function tickMicrotask(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsPage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: baseUrl },
        {
          provide: OrganizationsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 200 } }),
          },
        },
        {
          provide: PhotosService,
          useValue: {
            list: () => of({ ok: true, data: [] }),
            upload: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: MaterialsService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 10 } }),
            findById: () => of({ ok: true, data: {} as never }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            duplicate: () => of({ ok: true, data: { _id: 'c', name: 'x', unit: 'м2' } }),
          },
        },
        { provide: PiDialogService, useValue: { open: () => ({}) as never } },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        {
          provide: PiDictionaryLabelsService,
          useValue: { active: () => of(dictionaryLabelOptions('materialKind')) },
        },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Create the page, flush the initial list GET, settle. */
  async function renderPage(): Promise<{
    fixture: import('@angular/core/testing').ComponentFixture<MaterialsPage>;
  }> {
    const fixture = TestBed.createComponent(MaterialsPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    httpMock.expectOne(matchListGet).flush({
      items: fakeItems,
      total: fakeItems.length,
      page: 1,
      limit: 10,
    });
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();
    return { fixture };
  }

  // ─── View toggle ────────────────────────────────────────────────────

  it('view-grid button switches to grid and renders md showcase cards', async () => {
    const { fixture } = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    expect(comp.viewMode()).toBe('list');
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="materials-grid"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="showcase-cell-m1"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeFalsy();
  });

  it('grid card shows name, price and unit', async () => {
    const { fixture } = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-m1"]',
    ) as HTMLElement;
    expect(card.textContent).toContain('Сталь лист 3мм');
    expect(fixture.nativeElement.querySelector('[data-test="showcase-price"]')).toBeTruthy();
    expect(card.textContent).toContain('1240.50 ₽');
  });

  it('grid card routerLink points to /materials/:id', async () => {
    const { fixture } = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      '[data-test="showcase-cell-m1"]',
    ) as HTMLAnchorElement;
    expect(cell.getAttribute('href')).toBe('/materials/m1');
  });

  it('grid view is persisted to pi-materials-view-mode on toggle', async () => {
    const { fixture } = await renderPage();
    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(localStorage.getItem('pi-materials-view-mode')).toBe('grid');
  });

  it('pre-saved grid view mode renders grid on first load (F5 survival)', async () => {
    localStorage.setItem('pi-materials-view-mode', 'grid');
    const { fixture } = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    expect(comp.viewMode()).toBe('grid');
    expect(fixture.nativeElement.querySelector('[data-test="materials-grid"]')).toBeTruthy();
  });

  it('view-list button switches back to pi-table and persists list mode', async () => {
    localStorage.setItem('pi-materials-view-mode', 'grid');
    const { fixture } = await renderPage();
    const comp = fixture.componentInstance as unknown as { viewMode: () => string };

    const listBtn = fixture.nativeElement.querySelector(
      '[data-test="view-list-button"]',
    ) as HTMLElement;
    listBtn.click();
    fixture.detectChanges();

    expect(comp.viewMode()).toBe('list');
    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="materials-grid"]')).toBeFalsy();
    expect(localStorage.getItem('pi-materials-view-mode')).toBe('list');
  });

  it('grid empty state renders when no materials', async () => {
    const fixture = TestBed.createComponent(MaterialsPage);
    fixture.detectChanges();
    TestBed.flushEffects();
    httpMock.expectOne(matchListGet).flush({ items: [], total: 0, page: 1, limit: 10 });
    await tickMicrotask();
    TestBed.flushEffects();
    fixture.detectChanges();

    const gridBtn = fixture.nativeElement.querySelector(
      '[data-test="view-grid-button"]',
    ) as HTMLElement;
    gridBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="grid-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="materials-grid"]')).toBeFalsy();
  });

  // ─── Filters rail ───────────────────────────────────────────────────

  it('filters rail toggles open as overlay with backdrop', async () => {
    const { fixture } = await renderPage();
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
    const { fixture } = await renderPage();
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

  it('filters panel sits inside the rail (not under backdrop)', async () => {
    const { fixture } = await renderPage();
    const toggle = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-toggle"]',
    ) as HTMLElement;
    toggle.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-panel"]',
    ) as HTMLElement;
    const rail = fixture.nativeElement.querySelector('[data-test="filters-rail"]') as HTMLElement;
    const backdrop = fixture.nativeElement.querySelector(
      '[data-test="filters-backdrop"]',
    ) as HTMLElement;
    expect(panel).toBeTruthy();
    expect(rail.contains(panel)).toBe(true);
    expect(backdrop.parentElement?.contains(panel)).toBe(false);
  });

  it('rail kind select refires GET with ?materialKind= (same signal as toolbar)', async () => {
    const { fixture } = await renderPage();
    const toggle = fixture.nativeElement.querySelector(
      '[data-test="filters-rail-toggle"]',
    ) as HTMLElement;
    toggle.click();
    fixture.detectChanges();

    const railKind = fixture.nativeElement.querySelector(
      '[data-test="rail-kind"]',
    ) as HTMLSelectElement;
    expect(railKind).toBeTruthy();
    railKind.value = 'fastener';
    railKind.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    TestBed.flushEffects();

    const req = httpMock.expectOne(
      (r) =>
        r.url === listUrl &&
        r.method === 'GET' &&
        r.params.get('materialKind') === 'fastener' &&
        r.params.get('page') === '1',
    );
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 10 });
    await tickMicrotask();

    // Panel must stay open after interacting with the select.
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail-panel"]')).toBeTruthy();
  });

  it('«Сбросить» сбрасывает kind filter и поиск в один signal-state', async () => {
    // NG0101-контракт: в одном TestBed-окружении разрешён только один
    // settled→signal→flushEffects цикл (как в 316-suite). Поэтому здесь
    // проверяем сброс по signal-состоянию, а не вторым HTTP-рефетчем
    // (сам ?materialKind= параметр покрыт тестом rail-kind выше + 316).
    const { fixture } = await renderPage();
    const comp = fixture.componentInstance as unknown as {
      kindFilter: () => string | null;
      searchQuery: () => string;
      onKindFilterChange(event: Event): void;
      clearFilters(): void;
    };

    comp.onKindFilterChange({ target: { value: 'raw' } } as unknown as Event);
    expect(comp.kindFilter()).toBe('raw');

    comp.clearFilters();
    expect(comp.kindFilter()).toBeNull();
    expect(comp.searchQuery()).toBe('');
    // Панель не обязана закрываться по «Сбросить» (канон products) —
    // рейл остаётся открытым для дальнейших действий.
    expect(fixture.nativeElement.querySelector('[data-test="filters-rail"]')).toBeTruthy();
  });
});
