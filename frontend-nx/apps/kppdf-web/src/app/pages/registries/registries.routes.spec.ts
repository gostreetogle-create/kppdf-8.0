import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter, Router, type Route } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService, PiUnitsService, type Unit } from '@kppdf/data-access';
import { REGISTRIES_ROUTES } from './registries.routes';
import { RegistriesPage } from './registries-page';
import { REGISTRIES_CATALOG, buildRegistriesCatalogDefault } from './data/registries.catalog';
import {
  mockOrganizationsService,
  mockProductPassportsService,
  mockSupplyRequestsService,
} from './data/registries-catalog-test-mocks';
import type { MaterialRegistryDialogHost } from './data/material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './data/catalog-registry-dialog-host';
import { defineRegistry, type RegistryDefinition, type RegistryRow } from './model/registry.types';

interface Row {
  readonly id: string;
  readonly name: string;
}

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, (_, i) => ({ id: `r-${i + 1}`, name: `Запись ${i + 1}` }));
}

function testCatalog(): readonly RegistryDefinition<RegistryRow>[] {
  const rows = makeRows(3);
  return [
    defineRegistry<Row>({
      key: 'alpha',
      title: 'Альфа-реестр',
      source: 'demo',
      rowId: (r) => r.id,
      defaultPageSize: 1,
      columns: [{ key: 'name', header: 'Название', sortable: true, format: (r) => r.name }],
      dataSource: {
        query: async (state) => {
          const start = (state.page - 1) * state.pageSize;
          return { rows: rows.slice(start, start + state.pageSize), total: rows.length };
        },
      },
    }),
    defineRegistry<Row>({
      key: 'beta',
      title: 'Бета-реестр',
      source: 'demo',
      rowId: (r) => r.id,
      columns: [{ key: 'name', header: 'Название', format: (r) => r.name }],
      dataSource: { query: async () => ({ rows: [], total: 0 }) },
    }),
  ];
}

function mockCatalogDialogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

const TEST_ROUTES: Route[] = [{ path: 'registries', children: REGISTRIES_ROUTES }];

function mockDialogHost(): MaterialRegistryDialogHost {
  return { openCreate: jest.fn(), openEdit: jest.fn() };
}

/**
 * Settles the harness across a full async hop: router navigation/Location
 * change → `ActivatedRoute.queryParamMap` emission → this app's own signal
 * chain (`toSignal` → `computed` → `effect`) → the fixture data source's
 * Promise resolving → `pageState` signal update → re-render. A single
 * `whenStable()` is not reliably enough ticks for that whole chain, so this
 * flushes twice with a macrotask in between.
 */
async function settle(harness: RouterTestingHarness): Promise<void> {
  for (let i = 0; i < 3; i++) {
    harness.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    harness.detectChanges();
    await harness.fixture.whenStable();
  }
  harness.detectChanges();
}

describe('Registries routing — master table + inline panel URL sync (TZ-NX-REGISTRIES-MASTER-TABLE-UX)', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TEST_ROUTES),
        provideLocationMocks(),
      ],
    });
    TestBed.overrideComponent(RegistriesPage, {
      set: { providers: [{ provide: REGISTRIES_CATALOG, useValue: testCatalog() }] },
    });
  });

  it('/registries shows the master table without any manual URL entry beyond the landing route', async () => {
    const harness = await RouterTestingHarness.create('/registries');
    await settle(harness);
    expect(
      harness.routeNativeElement?.querySelector('[data-test="registries-master-table"]'),
    ).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('[data-test="table-row-alpha"]')).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('[data-test="table-row-beta"]')).toBeTruthy();
  });

  it('clicking a master row expands it inline and the URL reflects the open registry', async () => {
    const harness = await RouterTestingHarness.create('/registries');
    await settle(harness);

    const row = harness.routeNativeElement?.querySelector(
      '[data-test="table-row-alpha"]',
    ) as HTMLElement;
    row.click();
    await settle(harness);

    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/registries/alpha');
    // The panel renders directly under the row within the SAME master table,
    // not a detached page: both the row and the panel are present together.
    expect(harness.routeNativeElement?.querySelector('[data-test="table-row-alpha"]')).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('[data-test="registry-panel-title"]')?.textContent).toContain(
      'Альфа-реестр',
    );
  });

  it('an unknown registry key renders the not-found state while the master table stays visible', async () => {
    const harness = await RouterTestingHarness.create('/registries/ghost');
    await settle(harness);
    expect(harness.routeNativeElement?.querySelector('[data-test="registry-unknown"]')).toBeTruthy();
    expect(
      harness.routeNativeElement?.querySelector('[data-test="registries-master-table"]'),
    ).toBeTruthy();
  });

  it('only one row is expanded at a time — opening a second row closes the first', async () => {
    const harness = await RouterTestingHarness.create('/registries/alpha');
    await settle(harness);
    expect(
      harness.routeNativeElement
        ?.querySelector('[data-test="table-row-alpha"]')
        ?.getAttribute('data-row-open'),
    ).toBe('true');

    const betaRow = harness.routeNativeElement?.querySelector(
      '[data-test="table-row-beta"]',
    ) as HTMLElement;
    betaRow.click();
    await settle(harness);

    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/registries/beta');
    const el = harness.routeNativeElement;
    expect(el?.querySelector('[data-test="table-row-alpha"]')?.getAttribute('data-row-open')).toBeNull();
    expect(el?.querySelector('[data-test="table-row-beta"]')?.getAttribute('data-row-open')).toBe('true');
    expect(el?.querySelectorAll('[data-row-open="true"]').length).toBe(1);
  });

  it('clicking the open row again collapses it back to the plain master table', async () => {
    const harness = await RouterTestingHarness.create('/registries/beta');
    await settle(harness);

    const betaRow = harness.routeNativeElement?.querySelector(
      '[data-test="table-row-beta"]',
    ) as HTMLElement;
    betaRow.click();
    await settle(harness);

    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/registries');
    expect(harness.routeNativeElement?.querySelectorAll('[data-row-open="true"]').length).toBe(0);
  });

  it('paging writes a distinct ?page= history entry per page, and revisiting a prior URL restores that page (Back/Forward)', async () => {
    const harness = await RouterTestingHarness.create('/registries/alpha');
    await settle(harness);

    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/registries/alpha');
    expect(harness.routeNativeElement?.textContent).toContain('Запись 1');

    const nextBtn = harness.routeNativeElement?.querySelector(
      '[data-test="pager-next"]',
    ) as HTMLButtonElement;
    nextBtn.click();
    await settle(harness);

    expect(location.path()).toBe('/registries/alpha?page=2');
    expect(harness.routeNativeElement?.textContent).toContain('Запись 2');
    expect(location.urlChanges).toContain('/registries/alpha?page=2');

    // Re-navigating to the previous URL through the SAME Router — exactly
    // what Back replays under the hood — restores page 1's data.
    await harness.navigateByUrl('/registries/alpha');
    await settle(harness);
    expect(location.path()).toBe('/registries/alpha');
    expect(harness.routeNativeElement?.textContent).toContain('Запись 1');

    // ...and Forward replays page 2 the same way.
    await harness.navigateByUrl('/registries/alpha?page=2');
    await settle(harness);
    expect(location.path()).toBe('/registries/alpha?page=2');
    expect(harness.routeNativeElement?.textContent).toContain('Запись 2');
  });

  it('a fresh visit straight to /registries/:key (as a refresh would) opens that row directly', async () => {
    const harness = await RouterTestingHarness.create('/registries/beta?search=x');
    await settle(harness);
    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/registries/beta?search=x');
    expect(
      harness.routeNativeElement
        ?.querySelector('[data-test="table-row-beta"]')
        ?.getAttribute('data-row-open'),
    ).toBe('true');
  });
});

describe('Registries routing — real catalog smoke (TZ-NX-REGISTRY-UNITS-READ-SLICE)', () => {
  const UNITS_FIXTURE: Unit[] = [
    { key: 'pcs', label: 'Штука', symbol: 'шт', isActive: true, isSystem: true, sortOrder: 0 },
  ];

  function mockUnitsService(): jest.Mocked<Pick<PiUnitsService, 'list' | 'update'>> {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: UNITS_FIXTURE, total: UNITS_FIXTURE.length, page: 1, limit: 50 } }),
      ),
      update: jest.fn().mockReturnValue(of({ ok: true, data: { ...UNITS_FIXTURE[0], isActive: false } })),
    };
  }

  function mockMaterialsService(): PiMaterialsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
      ),
      getById: jest.fn(),
    } as unknown as PiMaterialsService;
  }

  function mockModulesService(): PiModulesService {
    return {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
      getById: jest.fn(),
    } as unknown as PiModulesService;
  }

  function mockProductsService(): PiProductsService {
    return {
      list: jest.fn().mockReturnValue(
        of({ ok: true, data: { items: [], total: 0, page: 1, limit: 25 } }),
      ),
      getById: jest.fn(),
    } as unknown as PiProductsService;
  }

  let unitsService: PiUnitsService;

  beforeEach(() => {
    unitsService = mockUnitsService() as PiUnitsService;
    const materialsService = mockMaterialsService();
    const modulesService = mockModulesService();
    const productsService = mockProductsService();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TEST_ROUTES),
        provideLocationMocks(),
        { provide: PiUnitsService, useValue: unitsService },
        { provide: PiMaterialsService, useValue: materialsService },
        { provide: PiModulesService, useValue: modulesService },
        { provide: PiProductsService, useValue: productsService },
      ],
    });
    const catalog = buildRegistriesCatalogDefault(
      unitsService,
      materialsService,
      modulesService,
      productsService,
      mockSupplyRequestsService(),
      mockOrganizationsService(),
      mockProductPassportsService(),
      {
        config: [{ path: 'constructor', loadComponent: () => Promise.resolve({}) }],
        navigate: jest.fn(),
      } as unknown as Router,
      mockDialogHost(),
      mockCatalogDialogHost(),
    );
    TestBed.overrideComponent(RegistriesPage, {
      set: { providers: [{ provide: REGISTRIES_CATALOG, useValue: catalog }] },
    });
  });

  it('/registries master table labels the real API registry and the demo fixture registry distinctly', async () => {
    const harness = await RouterTestingHarness.create('/registries');
    await settle(harness);
    const el = harness.routeNativeElement;
    expect(el?.querySelector('[data-test="table-row-units"]')?.textContent).toContain('API');
    expect(el?.querySelector('[data-test="table-row-materials"]')?.textContent).toContain('API');
    expect(el?.querySelector('[data-test="table-row-details"]')?.textContent).toContain('API');
    expect(el?.querySelector('[data-test="table-row-modules"]')?.textContent).toContain('API');
    expect(el?.querySelector('[data-test="table-row-products"]')?.textContent).toContain('API');
    expect(el?.querySelector('[data-test="table-row-departments"]')?.textContent).toContain('Демо');
  });

  it('opening /registries/units shows the real Units table (real HTTP data) directly under the row', async () => {
    const harness = await RouterTestingHarness.create('/registries/units');
    await settle(harness);
    expect(harness.routeNativeElement?.textContent).toContain('Штука');
    expect(harness.routeNativeElement?.querySelector('[data-test="registry-row-action-delete"]')).toBeNull();
  });

  it('opening /registries/departments shows the demo fixture table directly under the row', async () => {
    const harness = await RouterTestingHarness.create('/registries/departments');
    await settle(harness);
    // Departments' fixture data source always fails its first load
    // (failFirstAttempt) — retry recovers, exactly like the standalone
    // panel smoke test.
    const retryBtn = Array.from(harness.routeNativeElement?.querySelectorAll('button') ?? []).find(
      (b) => (b as HTMLButtonElement).textContent?.trim().includes('Повторить'),
    ) as HTMLButtonElement | undefined;
    if (retryBtn) {
      retryBtn.click();
      await settle(harness);
    }
    expect(harness.routeNativeElement?.textContent).toContain('Производство');
  });
});
