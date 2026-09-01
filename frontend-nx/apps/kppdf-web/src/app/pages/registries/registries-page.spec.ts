import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter, type ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RegistriesPage } from './registries-page';
import { REGISTRIES_CATALOG } from './data/registries.catalog';
import { defineRegistry, type RegistryDefinition, type RegistryRow } from './model/registry.types';

interface TestRow {
  readonly id: string;
  readonly name: string;
}

function testRegistry(
  key: string,
  title: string,
  description: string,
  source: 'api' | 'demo',
  recordCount?: number,
  category?: string,
): RegistryDefinition<RegistryRow> {
  return defineRegistry<TestRow>({
    key,
    title,
    description,
    source,
    category,
    rowId: (row) => row.id,
    recordCount: recordCount === undefined ? undefined : () => recordCount,
    columns: [{ key: 'name', header: 'Название', format: (r) => r.name }],
    dataSource: { query: async () => ({ rows: [{ id: 'r-1', name: 'Запись' }], total: 1 }) },
  });
}

function routeStub(registryKey: string | null): ActivatedRoute {
  const paramMap$ = new BehaviorSubject<ParamMap>(
    convertToParamMap(registryKey ? { registryKey } : {}),
  );
  const queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  return {
    paramMap: paramMap$,
    queryParamMap: queryParamMap$,
    snapshot: {
      get paramMap() {
        return paramMap$.value;
      },
      get queryParamMap() {
        return queryParamMap$.value;
      },
    },
  } as unknown as ActivatedRoute;
}

describe('RegistriesPage — master table (TZ-NX-REGISTRIES-MASTER-TABLE-UX)', () => {
  let fixture: ComponentFixture<RegistriesPage>;
  let navigateSpy: jest.SpyInstance;

  function setup(
    catalog: readonly RegistryDefinition<RegistryRow>[],
    registryKey: string | null = null,
  ): void {
    TestBed.configureTestingModule({
      imports: [RegistriesPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeStub(registryKey) },
      ],
    });
    TestBed.overrideComponent(RegistriesPage, {
      set: { providers: [{ provide: REGISTRIES_CATALOG, useValue: catalog }] },
    });
    const router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegistriesPage);
    fixture.detectChanges();
  }

  it('uses compact page chrome: crumbs only, no duplicate H1 or platform blurb (TZ-NX-REGISTRIES-HEADER-CLEANUP)', () => {
    setup([
      testRegistry('units', 'Единицы измерения', 'Реальный API.', 'api', 11),
      testRegistry('departments', 'Отделы', 'Демо-фикстура.', 'demo', 7),
    ]);

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="page-chrome-title"]')).toBeNull();
    expect(el.textContent).not.toContain('Платформа реестров');
    expect(el.querySelectorAll('h1').length).toBe(0);

    const currentCrumb = el.querySelector('[data-test="page-crumbs"] [aria-current="page"]');
    expect(currentCrumb).toBeTruthy();
    expect(currentCrumb.textContent?.trim()).toBe('Реестры');

    const chrome = el.querySelector('[data-test="page-chrome"]');
    const table = el.querySelector('[data-test="registries-master-table"]');
    expect(chrome).toBeTruthy();
    expect(table).toBeTruthy();
    expect(chrome.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.querySelector('[data-test="registries-page-content"]')?.className).toContain('px-panel-inset');
  });

  it('renders one master-table row per catalog registry with title, description and source badge', () => {
    setup([
      testRegistry('units', 'Единицы измерения', 'Реальный API.', 'api', 11),
      testRegistry('departments', 'Отделы', 'Демо-фикстура.', 'demo', 7),
    ]);

    expect(fixture.nativeElement.querySelector('[data-test="registries-master-table"]')).toBeTruthy();
    const rows = fixture.nativeElement.querySelectorAll('[data-test^="table-row-"]');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Единицы измерения');
    expect(fixture.nativeElement.textContent).toContain('Реальный API.');
    expect(fixture.nativeElement.textContent).toContain('Отделы');
    expect(fixture.nativeElement.textContent).toContain('API');
    expect(fixture.nativeElement.textContent).toContain('Демо');
  });

  it('shows a Russian-pluralized record count and "Неизвестно" when the registry has none', () => {
    setup([
      testRegistry('units', 'Единицы измерения', 'd', 'api', 11),
      testRegistry('departments', 'Отделы', 'd', 'demo', 1),
      testRegistry('pairs', 'Пары', 'd', 'demo', 2),
      testRegistry('unknown-count', 'Без счётчика', 'd', 'demo'),
    ]);

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="table-row-units"]').textContent).toContain('11 записей');
    expect(el.querySelector('[data-test="table-row-departments"]').textContent).toContain('1 запись');
    expect(el.querySelector('[data-test="table-row-pairs"]').textContent).toContain('2 записи');
    expect(el.querySelector('[data-test="table-row-unknown-count"]').textContent).toContain('Неизвестно');
  });

  it('groups master rows by category into a labelled section per group, in catalog order (TZ-NX-REGISTRIES-CATEGORY-GROUPS)', () => {
    setup([
      testRegistry('materials', 'Материалы', 'd', 'api', undefined, 'Каталог'),
      testRegistry('supply-requests', 'Заявки снабжения', 'd', 'api', undefined, 'Склад'),
      testRegistry('units', 'Единицы измерения', 'd', 'api', undefined, 'Каталог'),
      testRegistry('departments', 'Отделы', 'd', 'demo'),
    ]);

    const el = fixture.nativeElement;
    const labels = Array.from(el.querySelectorAll('[data-test="registries-category-label"]')).map(
      (n: Element) => n.textContent?.trim(),
    );
    expect(labels).toEqual(['Каталог', 'Склад', 'Реестры']);

    const tables = el.querySelectorAll('[data-test="registries-master-table"]');
    expect(tables.length).toBe(3);

    const catalogGroup = el.querySelectorAll('[data-test="registries-category-group"]')[0];
    expect(catalogGroup.querySelector('[data-test="table-row-materials"]')).toBeTruthy();
    expect(catalogGroup.querySelector('[data-test="table-row-units"]')).toBeTruthy();
    expect(catalogGroup.querySelector('[data-test="table-row-supply-requests"]')).toBeNull();
  });

  it('shows an empty state instead of a blank page when the catalog is empty', () => {
    setup([]);
    expect(fixture.nativeElement.querySelector('[data-test="registries-empty"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="registries-master-table"]')).toBeNull();
  });

  it('with no registryKey in the route, no row is expanded and no unknown-state banner shows', () => {
    setup([testRegistry('units', 'Единицы измерения', 'd', 'api')]);
    expect(fixture.nativeElement.querySelector('[data-row-open="true"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="registry-unknown"]')).toBeNull();
  });

  it('registryKey matching a catalog entry expands exactly that row and mounts its detail panel', () => {
    setup(
      [
        testRegistry('units', 'Единицы измерения', 'd', 'api'),
        testRegistry('departments', 'Отделы', 'd', 'demo'),
      ],
      'units',
    );

    const el = fixture.nativeElement;
    const openRows = el.querySelectorAll('[data-row-open="true"]');
    expect(openRows.length).toBe(1);
    expect(el.querySelector('[data-test="table-row-units"]').getAttribute('data-row-open')).toBe('true');
    expect(el.querySelector('[data-test="table-row-departments"]').getAttribute('data-row-open')).toBeNull();
    expect(el.querySelector('[data-test="registry-panel-title"]').textContent).toContain('Единицы измерения');
  });

  it('an unknown registryKey shows a clear not-found banner with a return link, while the table stays visible', () => {
    setup([testRegistry('units', 'Единицы измерения', 'd', 'api')], 'ghost');

    const el = fixture.nativeElement;
    const banner = el.querySelector('[data-test="registry-unknown"]');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('ghost');
    const back = el.querySelector('[data-test="registry-unknown-back"]') as HTMLAnchorElement;
    expect(back.getAttribute('href')).toBe('/registries');
    expect(el.querySelector('[data-test="registries-master-table"]')).toBeTruthy();
    expect(el.querySelector('[data-row-open="true"]')).toBeNull();
  });

  it('clicking a collapsed row navigates to /registries/:key', () => {
    setup([
      testRegistry('units', 'Единицы измерения', 'd', 'api'),
      testRegistry('departments', 'Отделы', 'd', 'demo'),
    ]);

    (fixture.nativeElement.querySelector('[data-test="table-row-departments"]') as HTMLElement).click();
    expect(navigateSpy).toHaveBeenCalledWith(['/registries', 'departments']);
  });

  it('clicking the already-expanded row navigates back to /registries (collapse)', () => {
    setup([testRegistry('units', 'Единицы измерения', 'd', 'api')], 'units');

    (fixture.nativeElement.querySelector('[data-test="table-row-units"]') as HTMLElement).click();
    expect(navigateSpy).toHaveBeenCalledWith(['/registries']);
  });

  it('switching the route key from one registry to another moves the open row (only one open)', () => {
    setup(
      [
        testRegistry('units', 'Единицы измерения', 'd', 'api'),
        testRegistry('departments', 'Отделы', 'd', 'demo'),
      ],
      'units',
    );
    expect(
      fixture.nativeElement.querySelector('[data-test="table-row-units"]').getAttribute('data-row-open'),
    ).toBe('true');

    // Simulate the route param changing (as Router would on navigation) by
    // pushing a new value through the same paramMap BehaviorSubject.
    const paramMap$ = (TestBed.inject(ActivatedRoute) as unknown as {
      paramMap: BehaviorSubject<ParamMap>;
    }).paramMap;
    paramMap$.next(convertToParamMap({ registryKey: 'departments' }));
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('[data-test="table-row-units"]').getAttribute('data-row-open')).toBeNull();
    expect(el.querySelector('[data-test="table-row-departments"]').getAttribute('data-row-open')).toBe(
      'true',
    );
    expect(el.querySelectorAll('[data-row-open="true"]').length).toBe(1);
  });
});
