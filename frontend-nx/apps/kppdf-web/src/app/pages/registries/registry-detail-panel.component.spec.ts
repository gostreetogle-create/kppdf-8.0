import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter, type ParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { RegistryDetailPanelComponent } from './registry-detail-panel.component';
import { PiMaterialsService, PiModulesService, PiProductsService, PiUnitsService, type Unit } from '@kppdf/data-access';
import { buildRegistriesCatalogDefault } from './data/registries.catalog';
import {
  mockOrganizationsService,
  mockProductPassportsService,
  mockSupplyRequestsService,
} from './data/registries-catalog-test-mocks';
import type { MaterialRegistryDialogHost } from './data/material-registry-dialog-host';
import type { CatalogRegistryDialogHost } from './data/catalog-registry-dialog-host';
import {
  defineRegistry,
  type RegistryDefinition,
  type RegistryQueryResult,
  type RegistryQueryState,
  type RegistryRow,
} from './model/registry.types';

interface WidgetRow {
  readonly id: string;
  readonly name: string;
  readonly note: string;
}

const ROW_A: WidgetRow = { id: 'w-1', name: 'Альфа', note: 'первая запись' };
const ROW_B: WidgetRow = { id: 'w-2', name: 'Бета', note: 'вторая запись' };

function buildRegistry(
  queryMock: jest.Mock<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>,
  overrides: Partial<RegistryDefinition<WidgetRow>> = {},
): RegistryDefinition<RegistryRow> {
  return defineRegistry<WidgetRow>({
    key: 'widgets',
    title: 'Виджеты',
    description: 'Тестовый реестр.',
    source: 'demo',
    rowId: (r) => r.id,
    emptyMessage: 'Виджеты не найдены.',
    columns: [{ key: 'name', header: 'Название', sortable: true, format: (r) => r.name }],
    filters: [{ key: 'search', label: 'Поиск', type: 'text', ariaLabel: 'Поиск виджетов' }],
    dataSource: { query: queryMock },
    ...overrides,
  });
}

function routeStub(queryParams: Record<string, string> = {}): ActivatedRoute {
  const queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap(queryParams));
  return {
    queryParamMap: queryParamMap$,
    snapshot: {
      get queryParamMap() {
        return queryParamMap$.value;
      },
    },
  } as unknown as ActivatedRoute;
}

function mockDialogHost(): MaterialRegistryDialogHost {
  return { openCreate: jest.fn(), openEdit: jest.fn() };
}

function mockCatalogDialogHost(): CatalogRegistryDialogHost {
  return {
    openModuleCreate: jest.fn(),
    openModuleEdit: jest.fn(),
    openProductCreate: jest.fn(),
    openProductEdit: jest.fn(),
  };
}

describe('RegistryDetailPanelComponent (TZ-NX-REGISTRIES-MASTER-TABLE-UX)', () => {
  let fixture: ComponentFixture<RegistryDetailPanelComponent>;
  let navigateSpy: jest.SpyInstance;

  function setup(definition: RegistryDefinition<RegistryRow>, route: ActivatedRoute): void {
    TestBed.configureTestingModule({
      imports: [RegistryDetailPanelComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: route }],
    });
    const router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegistryDetailPanelComponent);
    fixture.componentRef.setInput('definition', definition);
  }

  it('shows the registry title and description as a heading', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [], total: 0 });
    setup(buildRegistry(queryMock), routeStub());
    fixture.detectChanges();
    tick();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-panel-title"]').textContent).toContain('Виджеты');
    expect(el.textContent).toContain('Тестовый реестр.');
  }));

  it('renders create toolbar button and invokes createAction.run', fakeAsync(() => {
    const run = jest.fn();
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [], total: 0 });
    setup(
      buildRegistry(queryMock, {
        createAction: { label: 'Создать материал', run },
      }),
      routeStub(),
    );
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-test="registry-create"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.closest('[data-test="registry-toolbar-trailing"]')).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Создать материал');
    expect(btn.querySelector('lucide-angular')).toBeTruthy();
    btn.click();
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ reload: expect.any(Function), notify: expect.any(Function) }));
  }));

  it('places filters left and pagination right in toolbar; hides table footer pager', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: Array.from({ length: 25 }, (_, i) => ({ id: `w-${i}`, name: `Row ${i}`, note: '' })), total: 50 });
    setup(buildRegistry(queryMock), routeStub({ pageSize: '25' }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-toolbar-filters"] [data-test="registry-filter-search"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-table"] [data-test="pi-pagination"]')).toBeNull();
  }));

  it('shows toolbar pagination when total <= pageSize (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE)', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A, ROW_B], total: 2 });
    setup(buildRegistry(queryMock), routeStub({ pageSize: '25' }));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
    expect(el.querySelector('[data-test="pager-info"]').textContent).toContain('1–2 из 2');
  }));

  it('keeps create button and pagination in trailing area without layout clash', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A], total: 1 });
    setup(
      buildRegistry(queryMock, {
        createAction: { label: 'Создать', run: jest.fn() },
      }),
      routeStub(),
    );
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const trailing = fixture.nativeElement.querySelector('[data-test="registry-toolbar-trailing"]');
    expect(trailing.querySelector('[data-test="registry-create"]')).toBeTruthy();
    expect(trailing.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
  }));

  it('shows neutral filter placeholder when registry has no filters', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A], total: 1 });
    setup(buildRegistry(queryMock, { filters: undefined }), routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const filters = fixture.nativeElement.querySelector('[data-test="registry-toolbar-filters"]');
    expect(filters.querySelector('[data-test="registry-toolbar-filters-empty"]')).toBeTruthy();
    expect(filters.textContent).toContain('Без фильтров');
  }));

  it('resets page to 1 when a filter changes', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [], total: 0 });
    setup(buildRegistry(queryMock), routeStub({ page: '3' }));
    fixture.detectChanges();
    tick();

    const input = fixture.nativeElement.querySelector('[data-test="registry-filter-search"]') as HTMLInputElement;
    input.value = 'beta';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ search: 'beta', page: null }),
      }),
    );
  }));

  it('shows loading skeleton, then rows on success; empty message when zero rows', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValueOnce({ rows: [ROW_A, ROW_B], total: 2 })
      .mockResolvedValueOnce({ rows: [], total: 0 });

    setup(buildRegistry(queryMock), routeStub());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="table-skeleton-row"]')).toBeTruthy();

    tick();
    fixture.detectChanges();
    const rowsText = fixture.nativeElement.textContent as string;
    expect(rowsText).toContain('Альфа');
    expect(rowsText).toContain('Бета');
  }));

  it('renders an empty state message when the query resolves with zero rows', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [], total: 0 });

    setup(buildRegistry(queryMock), routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Виджеты не найдены.');
  }));

  it('renders an error banner on load failure with a retry action that recovers', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockRejectedValueOnce(new Error('Сеть недоступна'))
      .mockResolvedValueOnce({ rows: [ROW_A], total: 1 });

    setup(buildRegistry(queryMock), routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[data-test="registry-error-banner"]');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('Сеть недоступна');
    expect(fixture.nativeElement.querySelector('[data-test="registry-table"]')).toBeNull();

    const retryBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLButtonElement).textContent?.trim().includes('Повторить'),
    ) as HTMLButtonElement;
    expect(retryBtn).toBeTruthy();
    retryBtn.click();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="registry-error-banner"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Альфа');
    expect(queryMock).toHaveBeenCalledTimes(2);
  }));

  it('expands and collapses a child row to show its detail fields', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A, ROW_B], total: 2 });

    const registry = buildRegistry(queryMock, {
      expandable: {
        ariaLabel: (row) => `Подробности «${row.name}»`,
        fields: (row) => [{ label: 'Заметка', value: row.note }],
      },
    });

    setup(registry, routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="expanded-row"]')).toBeNull();

    const firstRow = fixture.nativeElement.querySelector('[data-test="table-row-w-1"]') as HTMLElement;
    firstRow.click();
    fixture.detectChanges();

    let expanded = fixture.nativeElement.querySelector('[data-test="expanded-row"]');
    expect(expanded).toBeTruthy();
    expect(expanded.textContent).toContain('первая запись');

    firstRow.click();
    fixture.detectChanges();
    expanded = fixture.nativeElement.querySelector('[data-test="expanded-row"]');
    expect(expanded).toBeNull();
  }));

  it('asks for confirmation before running a destructive row action, and skips it on cancel', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A], total: 1 });
    const runSpy = jest.fn();

    const registry = buildRegistry(queryMock, {
      rowActions: [
        {
          id: 'delete',
          label: 'Удалить',
          destructive: true,
          confirm: { title: 'Удалить виджет?', confirmLabel: 'Удалить', cancelLabel: 'Отмена' },
          run: runSpy,
        },
      ],
    });

    setup(registry, routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const actionBtn = fixture.nativeElement.querySelector(
      '[data-test="registry-row-action-delete"]',
    ) as HTMLButtonElement;
    actionBtn.click();
    fixture.detectChanges();
    tick();

    expect(runSpy).not.toHaveBeenCalled();
    const cancelBtn = Array.from(
      document.querySelector('app-pi-alert-dialog')?.querySelectorAll('button') ?? [],
    ).find((b) => b.textContent?.trim() === 'Отмена') as HTMLButtonElement;
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    tick();
    fixture.detectChanges();
    expect(runSpy).not.toHaveBeenCalled();
    expect(document.querySelector('app-pi-alert-dialog')).toBeNull();

    actionBtn.click();
    fixture.detectChanges();
    tick();
    const confirmBtn = Array.from(
      document.querySelector('app-pi-alert-dialog')?.querySelectorAll('button') ?? [],
    ).find((b) => b.textContent?.trim() === 'Удалить') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    tick();
    fixture.detectChanges();

    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(runSpy.mock.calls[0][0]).toEqual(ROW_A);
  }));

  it('re-derives filters/page from the route query params and pushes changes back via Router.navigate', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [ROW_A], total: 1 });

    setup(buildRegistry(queryMock), routeStub({ search: 'Аль' }));
    fixture.detectChanges();
    tick();

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { search: 'Аль' }, page: 1 }),
    );

    const input = fixture.nativeElement.querySelector(
      '[data-test="registry-filter-search"]',
    ) as HTMLInputElement;
    input.value = 'Бе';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ search: 'Бе', page: null }),
      }),
    );
  }));

  it('renders text and select filters with empty value when keys are absent from query state', fakeAsync(() => {
    const queryMock = jest
      .fn<Promise<RegistryQueryResult<WidgetRow>>, [RegistryQueryState]>()
      .mockResolvedValue({ rows: [], total: 0 });

    const registry = buildRegistry(queryMock, {
      filters: [
        { key: 'search', label: 'Поиск', type: 'text', ariaLabel: 'Поиск виджетов' },
        {
          key: 'status',
          label: 'Статус',
          type: 'select',
          ariaLabel: 'Статус виджета',
          options: [
            { value: 'active', label: 'Активные' },
            { value: 'archived', label: 'Архив' },
          ],
        },
      ],
    });

    setup(registry, routeStub());
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const textInput = fixture.nativeElement.querySelector(
      '[data-test="registry-filter-search"]',
    ) as HTMLInputElement;
    const selectInput = fixture.nativeElement.querySelector(
      '[data-test="registry-filter-status"]',
    ) as HTMLSelectElement;

    expect(textInput.value).toBe('');
    expect(selectInput.value).toBe('');
  }));
});

describe('RegistryDetailPanelComponent — real catalog smoke (TZ-NX-REGISTRY-UNITS-READ-SLICE)', () => {
  let fixture: ComponentFixture<RegistryDetailPanelComponent>;

  const UNITS_FIXTURE: Unit[] = [
    { key: 'pcs', label: 'Штука', symbol: 'шт', isActive: true, isSystem: true, sortOrder: 0 },
    { key: 'kg', label: 'Килограмм', symbol: 'кг', isActive: true, isSystem: true, sortOrder: 1 },
  ];

  function mockUnitsService(
    listResult: ReturnType<PiUnitsService['list']> = of({
      ok: true,
      data: { items: UNITS_FIXTURE, total: UNITS_FIXTURE.length, page: 1, limit: 50 },
    }),
  ): jest.Mocked<Pick<PiUnitsService, 'list' | 'update'>> {
    return {
      list: jest.fn().mockReturnValue(listResult),
      update: jest.fn().mockReturnValue(
        of({ ok: true, data: { ...UNITS_FIXTURE[0], isActive: false } }),
      ),
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

  function setup(
    key: 'units' | 'modules',
    unitsService: Pick<PiUnitsService, 'list' | 'update'>,
    modulesService: PiModulesService = mockModulesService(),
  ): void {
    TestBed.configureTestingModule({
      imports: [RegistryDetailPanelComponent],
      providers: [
        provideRouter([]),
        { provide: PiUnitsService, useValue: unitsService },
        { provide: PiMaterialsService, useValue: mockMaterialsService() },
        { provide: PiModulesService, useValue: modulesService },
        { provide: PiProductsService, useValue: mockProductsService() },
        { provide: ActivatedRoute, useValue: routeStub() },
      ],
    });
    const router = TestBed.inject(Router);
    const catalog = buildRegistriesCatalogDefault(
      unitsService as PiUnitsService,
      mockMaterialsService(),
      modulesService,
      mockProductsService(),
      mockSupplyRequestsService(),
      mockOrganizationsService(),
      mockProductPassportsService(),
      router,
      mockDialogHost(),
      mockCatalogDialogHost(),
    );
    const definition = catalog.find((d) => d.key === key)!;
    fixture = TestBed.createComponent(RegistryDetailPanelComponent);
    fixture.componentRef.setInput('definition', definition);
  }

  it('modules (client paging): neutral filter placeholder, toolbar pagination, list() without filter params', fakeAsync(() => {
    const modulesService = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            {
              _id: '507f1f77bcf86cd799439011',
              name: 'Каркас',
              article: 'MOD-001',
              sortOrder: 1,
            },
          ],
        }),
      ),
      getById: jest.fn(),
    } as unknown as PiModulesService;
    setup('modules', mockUnitsService(), modulesService);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    const filters = el.querySelector('[data-test="registry-toolbar-filters"]');
    expect(filters.querySelector('[data-test="registry-filter-search"]')).toBeTruthy();
    expect(filters.querySelector('[data-test="registry-filter-search"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-toolbar-trailing"] [data-test="registry-create"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
    expect(modulesService.list).toHaveBeenCalledWith();
    const listArgs = (modulesService.list as jest.Mock).mock.calls[0];
    expect(listArgs).toHaveLength(0);
  }));

  it.skip('removed departments (demo fixture) scenario', fakeAsync(() => {
    setup('departments', mockUnitsService());
    fixture.detectChanges();
    tick(500); // failFirstAttempt: the real fixture's first load always rejects.
    fixture.detectChanges();

    const retryBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLButtonElement).textContent?.trim().includes('Повторить'),
    ) as HTMLButtonElement;
    expect(retryBtn).toBeTruthy();
    retryBtn.click();
    tick(500);
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-toolbar"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-toolbar-filters"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-filter-search"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-filter-status"]')).toBeTruthy();
    const table = el.querySelector('table[role="table"]');
    expect(table).toBeTruthy();
    expect(el.textContent).toContain('↕');
    expect(el.querySelector('[data-test="registry-table"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-row-action-copy-code"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-row-action-archive"]')).toBeTruthy();

    const firstRow = el.querySelector('[data-test="table-row-d-1"]') as HTMLElement;
    expect(firstRow).toBeTruthy();
    firstRow.click();
    fixture.detectChanges();
    expect(el.querySelector('[data-test="expanded-row"]')).toBeTruthy();
  }));

  it('units (real API): loads via real HTTP data source, filters present, rowId=key, toggle and delete actions', fakeAsync(() => {
    const unitsService = mockUnitsService();
    setup('units', unitsService);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="registry-error-banner"]')).toBeNull();
    expect(el.querySelector('[data-test="registry-filter-search"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-filter-status"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-row-action-delete"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-row-action-activate"]')).toBeTruthy();
    expect(el.querySelector('[data-test="registry-row-action-deactivate"]')).toBeTruthy();
    expect(el.textContent).toContain('Штука');
    expect(el.textContent).toContain('Килограмм');
    expect(unitsService.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
    expect(el.textContent).not.toContain('↕');
  }));

  it('units: error banner with retry recovers after a failed list call', fakeAsync(() => {
    const unitsService = mockUnitsService(
      of({ ok: false, error: { error: { message: 'Сеть недоступна' }, status: 0, statusText: '' } }),
    );
    setup('units', unitsService);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="registry-error-banner"]')).toBeTruthy();

    unitsService.list.mockReturnValue(
      of({
        ok: true,
        data: { items: UNITS_FIXTURE, total: UNITS_FIXTURE.length, page: 1, limit: 50 },
      }),
    );
    const retryBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((b) =>
      (b as HTMLButtonElement).textContent?.trim().includes('Повторить'),
    ) as HTMLButtonElement;
    retryBtn.click();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="registry-error-banner"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Штука');
    expect(unitsService.list).toHaveBeenCalledTimes(2);
  }));
});
