import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens';
import { PageConfig, PageFieldSpec } from '../../../configs/pages.config';
import { FormFieldSpec } from '../form-dialog/form-dialog.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { BadgeComponent } from '../badge/badge.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { ToastService } from '../../../core/services/toast.service';
import { DialogService } from '../../../core/services/dialog.service';
import { RowActionsComponent } from '../row-actions/row-actions.component';

type Row = Record<string, unknown>;

@Component({
  selector: 'app-crud-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    EmptyStateComponent,
    BadgeComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="space-y-4 animate-fade-in">
      <header class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span class="text-2xl">{{ config().icon }}</span>
            {{ config().title }}
          </h1>
          @if (config().description) {
            <p class="text-sm text-muted-foreground">{{ config().description }}</p>
          }
        </div>
        <div class="flex items-center gap-2">
          <input
            type="search"
            placeholder="Поиск..."
            class="input w-64"
            [ngModel]="search()"
            (ngModelChange)="onSearch($event)"
          />
          <button class="btn-primary" (click)="onCreate()">+ Создать</button>
        </div>
      </header>

      @if (loading()) {
        <div class="space-y-2">
          <app-skeleton className="h-10 w-full" />
          <app-skeleton className="h-10 w-full" />
          <app-skeleton className="h-10 w-full" />
        </div>
      } @else if (error()) {
        <div class="card p-6 border-destructive">
          <p class="text-destructive">Ошибка: {{ error() }}</p>
          <button class="btn-outline mt-2" (click)="reload()">Повторить</button>
        </div>
      } @else if (filteredRows().length === 0) {
        <app-empty-state
          [icon]="config().icon"
          [title]="search() ? 'Ничего не найдено' : 'Нет данных'"
          [description]="
            search()
              ? 'Попробуйте изменить поисковый запрос'
              : 'Создайте первую запись чтобы начать'
          "
        />
      } @else {
        <div class="card overflow-hidden">
          <div
            class="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground"
          >
            <app-badge
              [label]="filteredRows().length + ' / ' + rows().length"
              variant="secondary"
            />
            <span>Всего записей</span>
            @if (hasForm()) {
              <span class="ml-auto">✎ редактирование · 🗑 удаление</span>
            }
          </div>
          <ag-grid-angular
            class="ag-theme-quartz w-full"
            [style.height.px]="600"
            [rowData]="filteredRows()"
            [columnDefs]="columnDefs()"
            [gridOptions]="gridOptions"
            (gridReady)="onGridReady($event)"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="25"
            [paginationPageSizeSelector]="[25, 50, 100]"
          />
        </div>
      }
    </div>
  `,
})
export class CrudPageComponent implements OnInit {
  readonly config = input.required<PageConfig>();

  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);
  private gridApi?: GridApi;

  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');

  readonly hasForm = computed(() => (this.config().fields?.length ?? 0) > 0);

  readonly filteredRows = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  });

  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100,
  };

  readonly gridOptions: GridOptions = {
    animateRows: true,
    suppressCellFocus: true,
  };

  readonly columnDefs = computed<ColDef[]>(() => {
    const cfg = this.config();
    const fields = cfg.fields ?? [];
    const data = this.rows();

    // Determine which keys to show in grid
    const keys =
      data.length === 0
        ? this.placeholderKeys()
        : Object.keys(data[0]).filter(
            (k) =>
              !k.startsWith('__') &&
              !['password', 'refreshToken', 'passwordHash'].includes(k),
          );

    const cols: ColDef[] = keys.map((key) => ({
      field: key,
      headerName: this.toHeader(key),
      flex: 1,
      minWidth: 120,
    }));

    // Add actions column only if PageConfig has fields defined
    if (fields.length > 0) {
      cols.push({
        headerName: 'Действия',
        field: '_actions',
        pinned: 'right',
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: RowActionsComponent,
        cellRendererParams: {
          onEdit: (row: Row) => this.onEdit(row),
          onDelete: (row: Row) => this.onDelete(row),
        },
      });
    }

    return cols;
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const url = this.resolveEndpoint(this.config().endpoint);
    const params = new HttpParams().set('limit', '1000');
    this.http.get<Row[]>(url, { params }).subscribe({
      next: (data) => {
        this.rows.set(this.normalize(data));
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Request failed';
        this.error.set(msg);
        this.loading.set(false);
        this.toast.error(`Не удалось загрузить ${this.config().title}: ${msg}`);
      },
    });
  }

  onSearch(q: string): void {
    this.search.set(q);
  }

  async onCreate(): Promise<void> {
    const cfg = this.config();
    const fields = cfg.fields ?? [];
    if (fields.length === 0) {
      this.toast.show(
        `Создание "${cfg.title}" — форма не настроена.`,
        'default',
        4000,
      );
      return;
    }
    try {
      const prepared = await this.prepareFieldsForForm();
      const result = await firstValueFrom(
        this.dialog.openForm({
          title: `Создать: ${cfg.title}`,
          fields: prepared,
          initial: this.defaultInitial(fields),
        }),
      );
      if (!result) return;
      this.http
        .post(`${this.baseUrl}${cfg.endpoint}`, this.cleanForBackend(result))
        .subscribe({
          next: () => {
            this.toast.success(`${cfg.title} создан(а)`);
            this.reload();
          },
          error: (err) => {
            const msg = err?.error?.message ?? err?.message ?? 'Request failed';
            this.toast.error(`Ошибка создания: ${msg}`);
          },
        });
    } catch (e) {
      console.error('onCreate failed', e);
      this.toast.error('Не удалось открыть форму');
    }
  }

  async onEdit(row: Row): Promise<void> {
    const cfg = this.config();
    const fields = cfg.fields ?? [];
    if (fields.length === 0) {
      this.toast.show(
        `Редактирование "${cfg.title}" — форма не настроена.`,
        'default',
        4000,
      );
      return;
    }
    const id = String(row['_id'] ?? row['id'] ?? '');
    if (!id) {
      this.toast.error('Не удалось определить ID записи');
      return;
    }
    try {
      const prepared = await this.prepareFieldsForForm();
      const initial = this.prepareInitialForForm(row, fields);
      const result = await firstValueFrom(
        this.dialog.openForm({
          title: `Редактировать: ${cfg.title}`,
          fields: prepared,
          initial,
        }),
      );
      if (!result) return;
      this.http
        .patch(
          `${this.baseUrl}${cfg.endpoint}/${id}`,
          this.cleanForBackend(result),
        )
        .subscribe({
          next: () => {
            this.toast.success(`${cfg.title} обновлен(а)`);
            this.reload();
          },
          error: (err) => {
            const msg = err?.error?.message ?? err?.message ?? 'Request failed';
            this.toast.error(`Ошибка обновления: ${msg}`);
          },
        });
    } catch (e) {
      console.error('onEdit failed', e);
      this.toast.error('Не удалось открыть форму');
    }
  }

  onDelete(row: Row): void {
    const cfg = this.config();
    const id = String(row['_id'] ?? row['id'] ?? '');
    if (!id) {
      this.toast.error('Не удалось определить ID записи');
      return;
    }
    const name = String(row['name'] ?? row['title'] ?? row['_id'] ?? 'запись');
    this.dialog
      .confirm({
        title: `Удалить "${name}"?`,
        message: `Это действие нельзя отменить. Запись будет помечена как удалённая.`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.http.delete(`${this.baseUrl}${cfg.endpoint}/${id}`).subscribe({
          next: () => {
            this.toast.success(`${cfg.title} удален(а)`);
            this.reload();
          },
          error: (err) => {
            const msg = err?.error?.message ?? err?.message ?? 'Request failed';
            this.toast.error(`Ошибка удаления: ${msg}`);
          },
        });
      });
  }

  onGridReady(params: { api: GridApi }): void {
    this.gridApi = params.api;
  }

  // ===== Helpers =====

  /**
   * Async-load relation options for fields with type='relation'.
   * Returns a copy of fields with options[] populated.
   */
  private async prepareFieldsForForm(): Promise<FormFieldSpec[]> {
    const fields = this.config().fields ?? [];
    const relationFields = fields.filter(
      (f) => f.type === 'relation' && f.endpoint,
    );
    const optionsMap = new Map<string, { value: string; label: string }[]>();

    await Promise.all(
      relationFields.map(async (f) => {
        try {
          const data = await firstValueFrom(
            this.http.get<unknown>(`${this.baseUrl}${f.endpoint!}`),
          );
          const items = this.extractArray(data);
          const valueKey = f.valueKey ?? '_id';
          const labelKey = f.labelKey ?? 'name';
          optionsMap.set(
            f.key,
            items.map((item) => ({
              value: String(item[valueKey] ?? item['_id'] ?? ''),
              label: String(
                item[labelKey] ??
                  item['name'] ??
                  item['title'] ??
                  item['_id'] ??
                  '',
              ),
            })),
          );
        } catch (e) {
          console.error('Failed to load relation options for', f.endpoint, e);
          optionsMap.set(f.key, []);
        }
      }),
    );

    return fields.map((f) =>
      f.type === 'relation' ? { ...f, options: optionsMap.get(f.key) ?? [] } : { ...f },
    );
  }

  /**
   * Convert backend row to form initial values:
   * - ObjectId strings stay as-is
   * - ISO dates → yyyy-MM-dd for <input type="date">
   * - populated refs ({_id, name}) → just the _id
   */
  private prepareInitialForForm(
    row: Row,
    fields: PageFieldSpec[],
  ): Record<string, unknown> {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = row[f.key];
      if (raw === undefined || raw === null) {
        initial[f.key] = null;
        continue;
      }
      if (f.type === 'date' && typeof raw === 'string') {
        initial[f.key] = raw.substring(0, 10);
        continue;
      }
      if (typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        initial[f.key] = String(obj['_id'] ?? obj['id'] ?? '');
        continue;
      }
      initial[f.key] = raw;
    }
    return initial;
  }

  /**
   * Provide sensible defaults for a fresh create form (e.g. booleans → false).
   */
  private defaultInitial(fields: PageFieldSpec[]): Record<string, unknown> {
    const init: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.type === 'boolean') init[f.key] = false;
      else if (f.type === 'number') init[f.key] = null;
      else init[f.key] = null;
    }
    return init;
  }

  /**
   * Strip null/empty values from the form result before sending to backend
   * (backend validation often rejects empty strings for optional fields).
   */
  private cleanForBackend(
    values: Record<string, unknown>,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v === null || v === undefined || v === '') continue;
      out[k] = v;
    }
    return out;
  }

  private placeholderKeys(): string[] {
    const fields = this.config().fields ?? [];
    if (fields.length > 0) return fields.map((f) => f.key);
    return ['_id', 'name'];
  }

  private resolveEndpoint(endpoint: string): string {
    if (endpoint.includes(':')) {
      const fallback = endpoint.split('/:')[0];
      return `${this.baseUrl}${fallback}`;
    }
    return `${this.baseUrl}${endpoint}`;
  }

  private extractArray(data: unknown): Row[] {
    if (Array.isArray(data)) return data as Row[];
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      for (const key of ['data', 'items', 'results']) {
        if (Array.isArray(obj[key])) return obj[key] as Row[];
      }
    }
    return [];
  }

  private normalize(data: unknown): Row[] {
    if (Array.isArray(data)) return data as Row[];
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      for (const key of ['data', 'items', 'results']) {
        if (Array.isArray(obj[key])) return obj[key] as Row[];
      }
    }
    return [];
  }

  private toHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .replace(/Id$/, 'ID')
      .replace(/At$/, ' (at)')
      .trim();
  }
}
