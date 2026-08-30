import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, type ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RegistriesPage } from './registries-page';
import { RegistryDetailPanelComponent } from './registry-detail-panel.component';
import { REGISTRIES_CATALOG } from './data/registries.catalog';
import { defineRegistry, type RegistryDefinition, type RegistryRow } from './model/registry.types';

interface Row {
  readonly id: string;
  readonly name: string;
}

const ROW: Row = { id: 'r-1', name: 'Первая запись' };

function testCatalog(): readonly RegistryDefinition<RegistryRow>[] {
  return [
    defineRegistry<Row>({
      key: 'widgets',
      title: 'Виджеты',
      description: 'Тестовый реестр для проверки доступности.',
      source: 'demo',
      rowId: (r) => r.id,
      columns: [{ key: 'name', header: 'Название', sortable: true, format: (r) => r.name }],
      filters: [
        { key: 'search', label: 'Поиск', type: 'text', ariaLabel: 'Поиск виджетов' },
        {
          key: 'status',
          label: 'Статус',
          type: 'select',
          ariaLabel: 'Фильтр по статусу',
          options: [{ value: 'active', label: 'Активные' }],
        },
      ],
      rowActions: [
        {
          id: 'delete',
          label: 'Удалить',
          icon: 'archive',
          tone: 'destructive',
          destructive: true,
          confirm: { title: 'Удалить запись?', confirmLabel: 'Удалить', cancelLabel: 'Отмена' },
          run: () => undefined,
        },
      ],
      dataSource: { query: async () => ({ rows: [ROW], total: 1 }) },
    }),
  ];
}

function pageRouteStub(registryKey: string | null): ActivatedRoute {
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

function panelRouteStub(): ActivatedRoute {
  const queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
  return {
    queryParamMap: queryParamMap$,
    snapshot: {
      get queryParamMap() {
        return queryParamMap$.value;
      },
    },
  } as unknown as ActivatedRoute;
}

describe('Registries — accessibility smoke (TZ-NX-REGISTRIES-MASTER-TABLE-UX)', () => {
  it('master table: rows are keyboard-reachable and expose aria-expanded state', () => {
    TestBed.configureTestingModule({
      imports: [RegistriesPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: pageRouteStub('widgets') },
      ],
    });
    TestBed.overrideComponent(RegistriesPage, {
      set: { providers: [{ provide: REGISTRIES_CATALOG, useValue: testCatalog() }] },
    });
    const fixture = TestBed.createComponent(RegistriesPage);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      '[data-test="table-row-widgets"]',
    ) as HTMLElement;
    expect(row.getAttribute('tabindex')).toBe('0');
    expect(row.getAttribute('aria-expanded')).toBe('true');
  });

  it('master table: unexpanded row has aria-expanded="false", not absent', () => {
    TestBed.configureTestingModule({
      imports: [RegistriesPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: pageRouteStub(null) },
      ],
    });
    TestBed.overrideComponent(RegistriesPage, {
      set: { providers: [{ provide: REGISTRIES_CATALOG, useValue: testCatalog() }] },
    });
    const fixture = TestBed.createComponent(RegistriesPage);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      '[data-test="table-row-widgets"]',
    ) as HTMLElement;
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });

  it('detail panel: filters are labelled, table is a labelled ARIA table, row actions are real buttons', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [RegistryDetailPanelComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: panelRouteStub() }],
    });
    const fixture: ComponentFixture<RegistryDetailPanelComponent> =
      TestBed.createComponent(RegistryDetailPanelComponent);
    fixture.componentRef.setInput('definition', testCatalog()[0]);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    const search = el.querySelector('[data-test="registry-filter-search"]') as HTMLInputElement;
    expect(search.getAttribute('aria-labelledby')).toBe('registry-filter-label-widgets-search');
    const searchLabel = el.querySelector('#registry-filter-label-widgets-search');
    expect(searchLabel?.textContent?.trim()).toBe('Поиск');

    const status = el.querySelector('[data-test="registry-filter-status"]') as HTMLSelectElement;
    expect(status.getAttribute('aria-labelledby')).toBe('registry-filter-label-widgets-status');
    const statusLabel = el.querySelector('#registry-filter-label-widgets-status');
    expect(statusLabel?.textContent?.trim()).toBe('Статус');

    const table = el.querySelector('table[role="table"]') as HTMLTableElement;
    expect(table).toBeTruthy();
    expect(table.getAttribute('aria-label')).toContain('Виджеты');

    const actionBtn = el.querySelector('[data-test="registry-row-action-delete"]') as HTMLButtonElement;
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.getAttribute('type')).toBe('button');
    expect(actionBtn.getAttribute('aria-label')).toBe('Удалить');
    expect(actionBtn.getAttribute('title')).toBe('Удалить');
    expect(actionBtn.querySelector('lucide-angular')).toBeTruthy();

    actionBtn.click();
    fixture.detectChanges();
    tick();

    const dialog = document.querySelector(
      'app-pi-alert-dialog [role="alertdialog"], [role="alertdialog"]',
    );
    expect(dialog).toBeTruthy();
  }));

  it('detail panel without filters: neutral placeholder is present for a11y layout', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [RegistryDetailPanelComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: panelRouteStub() }],
    });
    const def = defineRegistry<Row>({
      key: 'plain',
      title: 'Без фильтров',
      description: 'Реестр без фильтров.',
      source: 'demo',
      rowId: (r) => r.id,
      columns: [{ key: 'name', header: 'Название', format: (r) => r.name }],
      dataSource: { query: async () => ({ rows: [ROW], total: 1 }) },
    });
    const fixture: ComponentFixture<RegistryDetailPanelComponent> =
      TestBed.createComponent(RegistryDetailPanelComponent);
    fixture.componentRef.setInput('definition', def);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('[data-test="registry-toolbar-filters-empty"]');
    expect(placeholder).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="registry-toolbar-pagination"]')).toBeTruthy();
  }));
});
