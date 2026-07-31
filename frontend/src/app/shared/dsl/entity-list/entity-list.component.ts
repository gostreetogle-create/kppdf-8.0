import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PiPageHeaderComponent } from '../../page/pi-page-header.component';
import { PiSectionComponent } from '../../page/pi-section.component';
import { PiToolbarComponent } from '../../page/pi-toolbar.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableComponent, ColumnDef } from '../../ui/pi-table.component';
import { PiToastService } from '../../ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import type { PaginatedResponse } from '../entity/entity-service';

/**
 * TZ-232.C — `<pi-entity-list>` reusable list page component.
 *
 * A drop-in shell for canonical CRUD list pages with:
 *   - Server-side pagination (page, pageSize, total)
 *   - Search with 300ms debounce
 *   - Sortable columns (server-side via sortChange output)
 *   - Create / Edit / Delete actions
 *   - Loading skeleton, empty state, error toast
 *
 * Usage:
 * ```html
 * <app-pi-entity-list
 *   endpoint="materials"
 *   [columns]="columns"
 *   title="Материалы"
 *   eyebrow="08 · производство"
 *   [rowActions]="rowActionsTpl"
 *   (rowClick)="onRowClick($event)"
 *   (create)="onCreate()"
 *   (edit)="onEdit($event)"
 *   (delete)="onDelete($event)"
 * />
 *
 * <ng-template #rowActionsTpl let-row>
 *   <button (click)="onEdit(row)">✎</button>
 *   <button (click)="onDelete(row)">✕</button>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'app-pi-entity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    ButtonComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header [eyebrow]="eyebrow()" [title]="title()" [description]="description()" />

    <app-pi-section [title]="title()" [hint]="totalHint()" eyebrow="I">
      <app-pi-toolbar>
        <ng-content select="[filters]" />
        @if (!hideSearch()) {
          <input
            type="search"
            class="pi-input w-72"
            [placeholder]="searchPlaceholder()"
            [value]="searchQuery()"
            (input)="onSearch($event)"
            aria-label="Поиск"
          />
        }
        @if (!hideCreate()) {
          <app-pi-button variant="default" (click)="create.emit()" data-test="create-button">
            {{ createLabel() }}
          </app-pi-button>
        }
        <ng-content select="[toolbar-end]" />
      </app-pi-toolbar>

      @if (errorMessage()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ errorMessage() }}
        </div>
      }

      <div class="overflow-x-auto hairline rounded-sm">
        <app-pi-table
          [data]="items()"
          [columns]="columns()"
          [loading]="loading()"
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize()"
          [emptyMessage]="emptyMessage()"
          [rowActions]="rowActions()"
          [localSort]="false"
          (rowClick)="onRowClick($event)"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)"
          [attr.aria-label]="title()"
          data-test="entity-list-table"
        />
      </div>
    </app-pi-section>
  `,
})
export class PiEntityListComponent<T extends { _id?: string }> {
  // ── DI ──
  private readonly toast = inject(PiToastService);
  private readonly baseUrl = inject(API_BASE_URL);

  // ── Required inputs ──
  /** API endpoint path (e.g. 'materials', 'products'). */
  readonly endpoint = input.required<string>();
  /** Column definitions matching pi-table's ColumnDef. */
  readonly columns = input.required<ColumnDef<T>[]>();
  /** Page title (H1). */
  readonly title = input.required<string>();

  // ── Optional inputs ──
  readonly eyebrow = input<string>('');
  readonly description = input<string>('');
  readonly searchPlaceholder = input<string>('Поиск…');
  readonly emptyMessage = input<string>('Нет данных для отображения.');
  readonly createLabel = input<string>('+ Создать');
  readonly pageSize = input<number>(20);
  /** Optional row-actions template. Receives $implicit: T. */
  readonly rowActions = input<TemplateRef<{ $implicit: T }> | null>(null);
  /**
   * Extra query params merged into the API request.
   * Useful for filter dropdowns, date ranges, etc.
   * Example: `{ warehouseId: selectedWarehouse() }`
   */
  readonly extraParams = input<Record<string, string | number | undefined>>({});
  /** Hide the search input. Useful for read-only views where search is not needed. */
  readonly hideSearch = input<boolean>(false);
  /** Hide the create button. Useful for read-only views. */
  readonly hideCreate = input<boolean>(false);

  // ── Outputs ──
  readonly rowClick = output<T>();
  readonly create = output<void>();
  readonly edit = output<T>();
  readonly delete = output<T>();

  // ── Internal state ──
  protected readonly searchQuery = signal<string>('');
  protected readonly page = signal<number>(1);
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc' | null>(null);

  // ── Debounced search (300ms) ──
  private readonly searchDebounced = signal<string>('');

  constructor() {
    // Search debounce: reset timer on every keystroke, debounced value fires
    // after 300ms idle. Uses onCleanup (Angular 17.1+) instead of effect's
    // return value (which is ignored by Angular's effect runtime).
    effect((onCleanup) => {
      const q = this.searchQuery();
      const timeout = setTimeout(() => {
        this.searchDebounced.set(q);
        // Reset to page 1 when debounced search actually changes.
        // Idempotent when page is already 1 — no extra CD cycle.
        this.page.set(1);
      }, 300);
      onCleanup(() => clearTimeout(timeout));
    });
  }

  // ── httpResource params ──
  private readonly listParams = computed(() => {
    const params: Record<string, string | number | undefined> = {
      page: this.page(),
      limit: this.pageSize(),
    };
    const search = this.searchDebounced();
    if (search) params['search'] = search;
    const sk = this.sortKey();
    const sd = this.sortDir();
    if (sk && sd) {
      params['sortKey'] = sk;
      params['sortDir'] = sd;
    }
    // Merge extraParams, which can override default keys
    // Filter out undefined values so they don't become '?key=undefined'
    const extras = this.extraParams();
    const filteredExtras: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(extras)) {
      if (v !== undefined) filteredExtras[k] = v;
    }
    return { ...params, ...filteredExtras };
  });

  protected readonly listRes = httpResource<PaginatedResponse<T>>(() => ({
    url: `${this.baseUrl}/${this.endpoint()}`,
    params: this.listParams() as Record<string, string>,
  }));

  // ── Derived signals ──
  protected readonly items = computed<T[]>(() => this.listRes.value()?.items ?? []);
  protected readonly total = computed<number>(() => this.listRes.value()?.total ?? 0);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly totalHint = computed(() => `${this.total()} записей`);

  protected readonly errorMessage = computed<string | null>(() => {
    const err = this.listRes.error();
    if (!err) return null;
    return extractErrorMessage(err as import('@angular/common/http').HttpErrorResponse);
  });

  // ── Effects ──
  private readonly errorEffect = effect(() => {
    const err = this.listRes.error();
    if (err) {
      this.toast.error(
        extractErrorMessage(err as import('@angular/common/http').HttpErrorResponse),
      );
    }
  });

  // ── Handlers ──
  /** Refresh the current page after a create/edit/delete operation. */
  reload(): void {
    this.listRes.reload();
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected onSortChange(event: { key: string; dir: 'asc' | 'desc' | null }): void {
    this.sortKey.set(event.dir ? event.key : null);
    this.sortDir.set(event.dir);
    this.page.set(1);
  }

  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
  }
}
