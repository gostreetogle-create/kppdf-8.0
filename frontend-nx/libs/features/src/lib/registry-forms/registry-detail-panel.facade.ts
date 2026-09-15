/**
 * TZ-NX-REGISTRY-DETAIL-PANEL-FACADE — domain facade for
 * `RegistryDetailPanelComponent`.
 *
 * Owns: query-state ↔ URL sync, load/error/retry, expand-row and
 * row-action orchestration — moved as-is from the panel. No registry
 * behavior change.
 *
 * `definition` is an `input.required<T>()` on the host, not a DI token —
 * this facade can't read it directly at its own construction time (no
 * built-in way for an injected facade to reach a host component's own
 * input signal), so it uses the same `bind(host)` pattern established by
 * `OrderHubFacade`/`GanttBarsFacade`: the host passes itself (exposing
 * `definition` as a `Signal`) once, from its own constructor, and every
 * facade-owned `computed()`/`effect()` reads `this.host.definition()`
 * lazily — safe because `computed()` never evaluates eagerly and the one
 * `effect()` here is created *inside* `bind()`, after `host` is already
 * set, not in the facade's own constructor.
 */
import { DestroyRef, Injectable, Injector, Signal, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { ColumnDef } from '@kppdf/ui/table';
import {
  parseRegistryQueryState,
  toRegistryQueryParams,
  type RegistryActionContext,
  type RegistryDefinition,
  type RegistryPageState,
  type RegistryQueryState,
  type RegistryRow,
  type RegistryRowAction,
} from '@kppdf/features/registries-platform';

/** Bound accessor — the host `RegistryDetailPanelComponent`'s `definition` input, wired once via `bind()`. */
export interface RegistryDetailPanelFacadeHost {
  readonly definition: Signal<RegistryDefinition<RegistryRow>>;
}

@Injectable()
export class RegistryDetailPanelFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  private host!: RegistryDetailPanelFacadeHost;

  private readonly queryParamMapSig = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly queryState = computed<RegistryQueryState>(() =>
    parseRegistryQueryState(this.queryParamMapSig(), this.host.definition()),
  );

  readonly hasRowActions = computed(() => (this.host.definition().rowActions?.length ?? 0) > 0);
  readonly hasExpandable = computed(() => !!this.host.definition().expandable);

  readonly cols = computed<ColumnDef<RegistryRow>[]>(() =>
    this.host.definition().columns.map((c) => ({
      key: c.key,
      label: c.header,
      sortable: c.sortable,
      align: c.align === 'start' ? 'left' : c.align === 'end' ? 'right' : c.align,
      width: c.width,
      numeric: c.numeric,
      format: c.format,
    })),
  );

  readonly pageState = signal<RegistryPageState<RegistryRow>>({
    status: 'loading',
    rows: [],
    total: 0,
    error: null,
  });

  readonly tableRows = computed(() => [...this.pageState().rows]);

  readonly toolbarPaginationTotal = computed(() =>
    this.pageState().status === 'success' ? this.pageState().total : 0,
  );

  /** Toolbar pager stays visible for single-page result sets (TZ-NX-REGISTRIES-TOOLBAR-FINALIZE). */
  readonly showToolbarPagination = computed(() => this.toolbarPaginationTotal() > 0);

  private readonly expandedRowId = signal<string | null>(null);

  readonly expandedRowWhenFn = computed(() => {
    const def = this.host.definition();
    const id = this.expandedRowId();
    return (row: RegistryRow) => id !== null && def.rowId(row) === id;
  });

  readonly expandedRowLabelFn = computed(() => {
    const def = this.host.definition();
    return (row: RegistryRow) => def.expandable?.ariaLabel(row) ?? null;
  });

  private requestVersion = 0;

  /** Wire the host's `definition` input signal — call once from the component constructor. */
  bind(host: RegistryDetailPanelFacadeHost): void {
    this.host = host;
    effect(
      () => {
        const def = this.host.definition();
        const qs = this.queryState();
        this.expandedRowId.set(null);
        void this.runQuery(def, qs);
      },
      { injector: this.injector },
    );
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  /** Resolves a filter control value; absent keys become '' (runtime-safe for Record index). */
  filterInputValue(key: string): string {
    const raw: string | undefined = this.queryState().filters[key];
    return raw ?? '';
  }

  filterLabelId(key: string): string {
    return `registry-filter-label-${this.host.definition().key}-${key}`;
  }

  expandableFields(row: RegistryRow): readonly { label: string; value: string }[] {
    return this.host.definition().expandable?.fields(row) ?? [];
  }

  isActionDisabled(action: RegistryRowAction<RegistryRow>, row: RegistryRow): boolean {
    return action.isDisabled?.(row) ?? false;
  }

  actionDisabledReason(
    action: RegistryRowAction<RegistryRow>,
    row: RegistryRow,
  ): string | null {
    return this.isActionDisabled(action, row) ? (action.disabledReason?.(row) ?? null) : null;
  }

  onFilterChange(key: string, value: string): void {
    const current = this.queryState();
    const nextFilters = { ...current.filters };
    if (value) nextFilters[key] = value;
    else delete nextFilters[key];
    this.navigateToState({ ...current, filters: nextFilters, page: 1 });
  }

  onPageChange(page: number): void {
    this.navigateToState({ ...this.queryState(), page });
  }

  onPageSizeChange(pageSize: number): void {
    this.navigateToState({ ...this.queryState(), pageSize, page: 1 });
  }

  onSortChange(sort: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.navigateToState({
      ...this.queryState(),
      sort: sort.dir ? { key: sort.key, direction: sort.dir } : null,
      page: 1,
    });
  }

  onRowToggleExpand(row: RegistryRow): void {
    if (!this.host.definition().expandable) return;
    const id = this.host.definition().rowId(row);
    this.expandedRowId.update((current) => (current === id ? null : id));
  }

  onRowAction(action: RegistryRowAction<RegistryRow>, row: RegistryRow): void {
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

  reload(): void {
    void this.runQuery(this.host.definition(), this.queryState());
  }

  onCreate(): void {
    const createAction = this.host.definition().createAction;
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
    const params = toRegistryQueryParams(next, this.host.definition());
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
