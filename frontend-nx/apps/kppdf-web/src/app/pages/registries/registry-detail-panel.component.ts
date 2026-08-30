import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { TableComponent, type ColumnDef } from '@kppdf/ui/table';
import { RegistryToolbarPaginationComponent } from './registry-toolbar-pagination.component';
import { RegistryRowActionButtonComponent } from './registry-row-action-button.component';
import { RegistryCreateButtonComponent } from './registry-create-button.component';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { parseRegistryQueryState, toRegistryQueryParams } from './model/registry-query-state';
import type {
  RegistryActionContext,
  RegistryDefinition,
  RegistryPageState,
  RegistryQueryState,
  RegistryRow,
  RegistryRowAction,
} from './model/registry.types';

/**
 * TZ-NX-REGISTRIES-MASTER-TABLE-UX — presentational registry detail engine,
 * extracted from the former routed `RegistryDetailPage` (TZ-NX-REGISTRIES-PLATFORM)
 * so `/registries` can embed it directly beneath a master-table row instead
 * of navigating to a detached page. This is the ONLY place the query-state
 * (filters/page/sort) ↔ URL, loading/error/retry, expandable child rows and
 * row-action logic lives — the master page (`registries-page.ts`) never
 * duplicates it, it only decides WHICH `RegistryDefinition` to pass in via
 * `[definition]` and where to mount this component.
 *
 * Reads/writes query params off the ambient `ActivatedRoute`/`Router` — safe
 * because this component is only ever instantiated while mounted inside the
 * matched `/registries/:registryKey` route (never a separate router-outlet),
 * so it shares that exact `ActivatedRoute` with its host page.
 */
@Component({
  selector: 'pi-registry-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiStatusBannerComponent,
    TableComponent,
    RegistryToolbarPaginationComponent,
    RegistryRowActionButtonComponent,
    RegistryCreateButtonComponent,
  ],
  template: `
    <ng-template #rowActionsTpl let-row>
      <div class="flex items-center justify-end gap-2">
        @for (action of definition().rowActions ?? []; track action.id) {
          <pi-registry-row-action-button
            [action]="action"
            [disabled]="isActionDisabled(action, row)"
            [disabledReason]="actionDisabledReason(action, row)"
            (actionClick)="onRowAction(action, row)"
          />
        }
      </div>
    </ng-template>
    <ng-template #expandedTpl let-row>
      <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" data-test="registry-expanded-row">
        @for (field of expandableFields(row); track field.label) {
          <div>
            <div class="pi-label text-muted-foreground">{{ field.label }}</div>
            <div class="text-sm">{{ field.value }}</div>
          </div>
        }
      </div>
    </ng-template>

    <div class="px-4 pt-4 pb-2" data-test="registry-panel-heading">
      <h2
        class="font-display text-base tracking-tight text-ink leading-snug m-0"
        data-test="registry-panel-title"
      >
        {{ definition().title }}
      </h2>
      @if (definition().description) {
        <p class="text-xs text-muted-foreground max-w-[58ch] mt-0.5 mb-0">
          {{ definition().description }}
        </p>
      }
    </div>

    <div class="px-4 pb-4" data-test="registry-toolbar">
      <div class="flex flex-wrap items-end justify-between gap-form-field w-full">
        <div
          class="flex flex-wrap items-end gap-form-field flex-1 min-w-[12rem]"
          data-test="registry-toolbar-filters"
        >
          @if ((definition().filters ?? []).length === 0) {
            <span
              class="text-xs text-muted-foreground py-1.5"
              data-test="registry-toolbar-filters-empty"
            >
              Без фильтров
            </span>
          }
          @for (filter of definition().filters ?? []; track filter.key) {
            <div class="flex flex-col gap-1 min-w-[10rem]">
              <span class="text-xs text-muted-foreground" [id]="filterLabelId(filter.key)">{{ filter.label }}</span>
              @if (filter.type === 'text') {
                <input
                  type="search"
                  class="pi-input w-full min-w-[12rem] max-w-xs min-h-8 pi-focus-ring"
                  [value]="filterInputValue(filter.key)"
                  (input)="onFilterChange(filter.key, inputValue($event))"
                  [placeholder]="filter.placeholder ?? filter.label"
                  [attr.aria-labelledby]="filterLabelId(filter.key)"
                  [attr.data-test]="'registry-filter-' + filter.key"
                />
              } @else {
                <select
                  class="pi-input pi-focus-ring min-h-8 min-w-[10rem]"
                  [value]="filterInputValue(filter.key)"
                  (change)="onFilterChange(filter.key, inputValue($event))"
                  [attr.aria-labelledby]="filterLabelId(filter.key)"
                  [attr.data-test]="'registry-filter-' + filter.key"
                >
                  <option value="">{{ filter.emptyOptionLabel ?? 'Все' }}</option>
                  @for (opt of filter.options ?? []; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              }
            </div>
          }
        </div>

        <div
          class="flex flex-wrap items-center gap-form-field justify-end shrink-0"
          data-test="registry-toolbar-trailing"
        >
          @if (definition().createAction; as createAction) {
            <pi-registry-create-button
              [label]="createAction.label"
              (createClick)="onCreate()"
            />
          }
          @if (showToolbarPagination()) {
            <pi-registry-toolbar-pagination
              [total]="toolbarPaginationTotal()"
              [pageSize]="queryState().pageSize"
              [currentPage]="queryState().page"
              [ariaLabel]="'Пагинация: ' + definition().title"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          }
        </div>
      </div>
    </div>

    @if (pageState().status === 'error') {
      <div class="px-4 pb-4">
        <app-pi-status-banner
          tone="destructive"
          [message]="pageState().error ?? 'Не удалось загрузить данные.'"
          actionLabel="Повторить"
          (action)="reload()"
          data-test="registry-error-banner"
        />
      </div>
    } @else {
      <div class="px-4 pb-4">
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          <app-pi-table
            [compact]="true"
            [data]="tableRows()"
            [columns]="cols()"
            [loading]="pageState().status === 'loading'"
            [total]="0"
            [page]="1"
            [pageSize]="queryState().pageSize"
            [localSort]="false"
            [initialSortKey]="queryState().sort?.key ?? null"
            [initialSortDir]="queryState().sort?.direction ?? null"
            [ariaLabel]="'Список: ' + definition().title"
            [emptyMessage]="definition().emptyMessage ?? 'Нет данных для отображения.'"
            [rowActions]="hasRowActions() ? rowActionsTplBinding : null"
            [expandedRow]="hasExpandable() ? expandedTplBinding : null"
            [expandedRowWhen]="expandedRowWhenFn()"
            [expandedRowLabel]="expandedRowLabelFn()"
            (sortChange)="onSortChange($event)"
            (rowClick)="onRowToggleExpand($event)"
            data-test="registry-table"
          ></app-pi-table>
        </div>
      </div>
    }
  `,
})
export class RegistryDetailPanelComponent implements OnInit {
  readonly definition = input.required<RegistryDefinition<RegistryRow>>();

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private readonly queryParamMapSig = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly queryState = computed<RegistryQueryState>(() =>
    parseRegistryQueryState(this.queryParamMapSig(), this.definition()),
  );

  protected readonly hasRowActions = computed(() => (this.definition().rowActions?.length ?? 0) > 0);
  protected readonly hasExpandable = computed(() => !!this.definition().expandable);

  protected readonly cols = computed<ColumnDef<RegistryRow>[]>(() =>
    this.definition().columns.map((c) => ({
      key: c.key,
      label: c.header,
      sortable: c.sortable,
      align: c.align === 'start' ? 'left' : c.align === 'end' ? 'right' : c.align,
      width: c.width,
      numeric: c.numeric,
      format: c.format,
    })),
  );

  protected readonly pageState = signal<RegistryPageState<RegistryRow>>({
    status: 'loading',
    rows: [],
    total: 0,
    error: null,
  });

  protected readonly tableRows = computed(() => [...this.pageState().rows]);

  protected readonly toolbarPaginationTotal = computed(() =>
    this.pageState().status === 'success' ? this.pageState().total : 0,
  );

  /** Toolbar pager stays visible for single-page result sets (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE). */
  protected readonly showToolbarPagination = computed(() => this.toolbarPaginationTotal() > 0);

  private readonly expandedRowId = signal<string | null>(null);

  protected readonly expandedRowWhenFn = computed(() => {
    const def = this.definition();
    const id = this.expandedRowId();
    return (row: RegistryRow) => id !== null && def.rowId(row) === id;
  });

  protected readonly expandedRowLabelFn = computed(() => {
    const def = this.definition();
    return (row: RegistryRow) => def.expandable?.ariaLabel(row) ?? null;
  });

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: RegistryRow }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: RegistryRow }> | null = null;

  @ViewChild('expandedTpl', { static: true })
  private readonly expandedTplRef!: TemplateRef<{ $implicit: RegistryRow }>;
  protected expandedTplBinding: TemplateRef<{ $implicit: RegistryRow }> | null = null;

  private requestVersion = 0;

  constructor() {
    effect(() => {
      const def = this.definition();
      const qs = this.queryState();
      this.expandedRowId.set(null);
      void this.runQuery(def, qs);
    });
  }

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
    this.expandedTplBinding = this.expandedTplRef;
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  /** Resolves a filter control value; absent keys become '' (runtime-safe for Record index). */
  protected filterInputValue(key: string): string {
    const raw: string | undefined = this.queryState().filters[key];
    return raw ?? '';
  }

  protected filterLabelId(key: string): string {
    return `registry-filter-label-${this.definition().key}-${key}`;
  }

  protected expandableFields(row: RegistryRow): readonly { label: string; value: string }[] {
    return this.definition().expandable?.fields(row) ?? [];
  }

  protected isActionDisabled(action: RegistryRowAction<RegistryRow>, row: RegistryRow): boolean {
    return action.isDisabled?.(row) ?? false;
  }

  protected actionDisabledReason(
    action: RegistryRowAction<RegistryRow>,
    row: RegistryRow,
  ): string | null {
    return this.isActionDisabled(action, row) ? (action.disabledReason?.(row) ?? null) : null;
  }

  protected onFilterChange(key: string, value: string): void {
    const current = this.queryState();
    const nextFilters = { ...current.filters };
    if (value) nextFilters[key] = value;
    else delete nextFilters[key];
    this.navigateToState({ ...current, filters: nextFilters, page: 1 });
  }

  protected onPageChange(page: number): void {
    this.navigateToState({ ...this.queryState(), page });
  }

  protected onPageSizeChange(pageSize: number): void {
    this.navigateToState({ ...this.queryState(), pageSize, page: 1 });
  }

  protected onSortChange(sort: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.navigateToState({
      ...this.queryState(),
      sort: sort.dir ? { key: sort.key, direction: sort.dir } : null,
      page: 1,
    });
  }

  protected onRowToggleExpand(row: RegistryRow): void {
    if (!this.definition().expandable) return;
    const id = this.definition().rowId(row);
    this.expandedRowId.update((current) => (current === id ? null : id));
  }

  protected onRowAction(action: RegistryRowAction<RegistryRow>, row: RegistryRow): void {
    if (this.isActionDisabled(action, row)) return;
    if (action.confirm) {
      const ref = this.dialog.open<boolean>(AlertDialogComponent, {
        data: {
          title: action.confirm.title,
          description: action.confirm.description,
          confirmLabel: action.confirm.confirmLabel,
          cancelLabel: action.confirm.cancelLabel,
          variant: action.destructive ? 'destructive' : 'default',
        },
        width: 'sm',
        parentDestroyRef: this.destroyRef,
      });
      this.runOnDialogCloseOnce(ref, (ok) => {
        if (ok) void this.runAction(action, row);
      });
      return;
    }
    void this.runAction(action, row);
  }

  protected reload(): void {
    void this.runQuery(this.definition(), this.queryState());
  }

  protected onCreate(): void {
    const createAction = this.definition().createAction;
    if (!createAction) return;
    void this.runActionContext((ctx) => createAction.run(ctx));
  }

  private actionContext(): RegistryActionContext {
    return {
      reload: () => this.reload(),
      notify: (message, tone) => {
        if (tone === 'error') this.toast.error(message);
        else this.toast.success(message);
      },
    };
  }

  private async runActionContext(
    fn: (ctx: RegistryActionContext) => void | Promise<void>,
  ): Promise<void> {
    await fn(this.actionContext());
  }

  private async runAction(
    action: RegistryRowAction<RegistryRow>,
    row: RegistryRow,
  ): Promise<void> {
    const ctx: RegistryActionContext = this.actionContext();
    await action.run(row, ctx);
  }

  private async runQuery(
    def: RegistryDefinition<RegistryRow>,
    qs: RegistryQueryState,
  ): Promise<void> {
    const version = ++this.requestVersion;
    this.pageState.update((s) => ({ ...s, status: 'loading' }));
    try {
      const result = await def.dataSource.query(qs);
      if (version !== this.requestVersion) return;
      this.pageState.set({ status: 'success', rows: result.rows, total: result.total, error: null });
    } catch (err) {
      if (version !== this.requestVersion) return;
      const message = err instanceof Error ? err.message : 'Не удалось загрузить данные.';
      this.pageState.set({ status: 'error', rows: [], total: 0, error: message });
    }
  }

  private navigateToState(next: RegistryQueryState): void {
    const params = toRegistryQueryParams(next, this.definition());
    void this.router.navigate([], { relativeTo: this.route, queryParams: params });
  }

  private runOnDialogCloseOnce(ref: DialogRef<boolean>, callback: (value: boolean | undefined) => void): void {
    let called = false;
    effect(
      () => {
        const value = ref.closed();
        if (value === undefined || called) return;
        called = true;
        callback(value);
      },
      { injector: this.injector },
    );
  }
}
