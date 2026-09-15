import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { TableComponent, type ColumnDef } from '@kppdf/ui/table';
import { RegistryToolbarPaginationComponent } from './registry-toolbar-pagination.component';
import { RegistryRowActionButtonComponent } from './registry-row-action-button.component';
import { RegistryCreateButtonComponent } from './registry-create-button.component';
import { RegistryDetailPanelFacade, type RegistryDetailPanelFacadeHost } from './registry-detail-panel.facade';
import type {
  RegistryDefinition,
  RegistryRow,
  RegistryRowAction,
} from '@kppdf/features/registries-platform';

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
 *
 * TZ-NX-REGISTRY-DETAIL-PANEL-FACADE — query-state/load/action orchestration
 * moved to `RegistryDetailPanelFacade`; this component stays a thin host
 * (template + the two static `@ViewChild` template refs, which only the
 * component's own view can resolve).
 */
@Component({
  selector: 'pi-registry-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RegistryDetailPanelFacade],
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
export class RegistryDetailPanelComponent implements RegistryDetailPanelFacadeHost, OnInit {
  readonly definition = input.required<RegistryDefinition<RegistryRow>>();

  private readonly facade = inject(RegistryDetailPanelFacade);

  constructor() {
    this.facade.bind(this);
  }

  protected readonly queryState = this.facade.queryState;
  protected readonly hasRowActions = this.facade.hasRowActions;
  protected readonly hasExpandable = this.facade.hasExpandable;
  protected readonly cols: () => ColumnDef<RegistryRow>[] = this.facade.cols;
  protected readonly pageState = this.facade.pageState;
  protected readonly tableRows = this.facade.tableRows;
  protected readonly toolbarPaginationTotal = this.facade.toolbarPaginationTotal;
  protected readonly showToolbarPagination = this.facade.showToolbarPagination;
  protected readonly expandedRowWhenFn = this.facade.expandedRowWhenFn;
  protected readonly expandedRowLabelFn = this.facade.expandedRowLabelFn;

  @ViewChild('rowActionsTpl', { static: true })
  private readonly rowActionsTplRef!: TemplateRef<{ $implicit: RegistryRow }>;
  protected rowActionsTplBinding: TemplateRef<{ $implicit: RegistryRow }> | null = null;

  @ViewChild('expandedTpl', { static: true })
  private readonly expandedTplRef!: TemplateRef<{ $implicit: RegistryRow }>;
  protected expandedTplBinding: TemplateRef<{ $implicit: RegistryRow }> | null = null;

  ngOnInit(): void {
    this.rowActionsTplBinding = this.rowActionsTplRef;
    this.expandedTplBinding = this.expandedTplRef;
  }

  protected inputValue(event: Event): string {
    return this.facade.inputValue(event);
  }

  protected filterInputValue(key: string): string {
    return this.facade.filterInputValue(key);
  }

  protected filterLabelId(key: string): string {
    return this.facade.filterLabelId(key);
  }

  protected expandableFields(row: RegistryRow): readonly { label: string; value: string }[] {
    return this.facade.expandableFields(row);
  }

  protected isActionDisabled(action: RegistryRowAction<RegistryRow>, row: RegistryRow): boolean {
    return this.facade.isActionDisabled(action, row);
  }

  protected actionDisabledReason(
    action: RegistryRowAction<RegistryRow>,
    row: RegistryRow,
  ): string | null {
    return this.facade.actionDisabledReason(action, row);
  }

  protected onFilterChange(key: string, value: string): void {
    this.facade.onFilterChange(key, value);
  }

  protected onPageChange(page: number): void {
    this.facade.onPageChange(page);
  }

  protected onPageSizeChange(pageSize: number): void {
    this.facade.onPageSizeChange(pageSize);
  }

  protected onSortChange(sort: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.facade.onSortChange(sort);
  }

  protected onRowToggleExpand(row: RegistryRow): void {
    this.facade.onRowToggleExpand(row);
  }

  protected onRowAction(action: RegistryRowAction<RegistryRow>, row: RegistryRow): void {
    this.facade.onRowAction(action, row);
  }

  protected reload(): void {
    this.facade.reload();
  }

  protected onCreate(): void {
    this.facade.onCreate();
  }
}
