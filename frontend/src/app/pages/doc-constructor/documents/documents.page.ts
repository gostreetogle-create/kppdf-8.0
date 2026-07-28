import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import {
  DefaultListParams,
  PiEntityListComponent,
} from '../../../shared/dsl/entity-list/pi-entity-list.component';
import {
  EntityService,
  PaginatedResponse,
} from '../../../shared/dsl/entity/entity-service';
import { SilentResult, extractErrorMessage } from '../../../core/silent-http';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { ColumnDef } from '../../../shared/ui/pi-table.component';
import {
  GeneratedDocument,
  GeneratedDocumentsService,
} from '../../../shared/services/pi-generated-documents.service';

/**
 * Module-level type alias: intersects `DefaultListParams` with the
 * page-specific filter surface.
 */
type DocListParams = DefaultListParams & {
  templateId?: string;
  sourceType?: string;
  sourceId?: string;
};

const PAGE_SIZE = 10;

type SortKey = 'number' | 'createdAt' | 'displayName';

interface GeneratedDocumentView extends GeneratedDocument {
  displayName: string;
  statusDotClass: string;
  statusLabel: string;
}

/**
 * Stub for not-implemented `EntityService` methods (no `create`/`update`
 * on `GeneratedDocumentsService` — documents are created via the
 * builder's `generate(templateId, payload)` flow).
 */
function notImplementedStub<T>(): ReturnType<
  EntityService<T, DocListParams>['create']
> {
  return of<SilentResult<T>>({
    ok: false as const,
    error: new HttpErrorResponse({
      error: 'Method not implemented client-side',
      status: 501,
      statusText: 'Not Implemented',
      url: 'client-side-stub',
    }),
  }) as unknown as ReturnType<EntityService<T, DocListParams>['create']>;
}

/**
 * TZ-232.F.3 v2 — DocumentsPage migrated to `<pi-entity-list>`.
 *
 * Backend `/generated-documents` returns a FLAT ARRAY (no envelope)
 * and exposes only `list/findById/remove/generate`. Migration uses
 * Approach D hybrid with direct `service.list()` subscription
 * (avoids `httpResource` test complications):
 *
 *  - Page-owned `items` signal caches the flat-array response.
 *  - `viewRows` enriches with `displayName/statusDotClass/statusLabel`.
 *  - `sortedRows` + page-slice arithmetic inside `localAdapter.list`.
 *  - Page-level search `<input type="search">` in `toolbarExtras`
 *    (NOT wrapper's built-in — wrapper's debounce doesn't bridge to
 *    page state cleanly here, see fix notes).
 *  - Period filter `<input type="month">` next to search.
 *  - Status cell via `[cellTemplates]` slot — colored dot + label.
 *  - Row actions via `[rowActionsTpl]` slot — view (openHtml) + delete.
 *  - `findById` / `remove` bind directly to service.
 *  - `create` / `update` are stubbed via `notImplementedStub<T>()`
 *    because the service lacks them.
 */
@Component({
  selector: 'app-documents-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, PiEntityListComponent],
  template: `
    <app-pi-page-header
      eyebrow="раздел · конструктор документов"
      title="Сформированные документы"
      description="HTML-снимки документов, сгенерированные из шаблонов. Открывайте предпросмотр или удаляйте устаревшие версии."
    />

    <app-pi-entity-list
      #list
      [service]="listService"
      [params]="listParams()"
      [cols]="cols"
      [cellTemplates]="cellTemplates()"
      [rowActionsTpl]="rowActionsTplBinding()"
      [showSearch]="false"
      [showCreate]="false"
      [initialSortKey]="'createdAt'"
      [initialSortDir]="'desc'"
      [pageSize]="PAGE_SIZE"
      ariaLabel="Сформированные документы"
      emptyMessage="Нет сохранённых документов."
      (sortChange)="onSortChange($event)"
      (rowDelete)="onDelete($event)"
    >
      <!-- ───── Search + period filter in toolbar extras ───── -->
      <div
        toolbarExtras
        class="flex items-center gap-2 flex-1"
        data-test="toolbar-filters"
      >
        <input
          type="search"
          class="pi-input flex-1 max-w-md"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по номеру или названию…"
          aria-label="Поиск документов"
          data-test="search-input"
        />
        <input
          type="month"
          class="pi-input w-44"
          [value]="periodMonth()"
          (change)="onPeriodChange($event)"
          aria-label="Фильтр по периоду"
          data-test="period-filter-input"
        />
      </div>

      <!-- ───── Status cell with dot indicator ───── -->
      <ng-template #statusTpl let-row>
        <span class="inline-flex items-center gap-2" data-test="status-cell">
          <span
            class="inline-block w-2 h-2 rounded-full shrink-0"
            [class]="row.statusDotClass"
            aria-hidden="true"
          ></span>
          <span>{{ row.statusLabel }}</span>
        </span>
      </ng-template>

      <!-- ───── Row actions cluster ───── -->
      <ng-template #rowActionsTpl let-row>
        <button
          type="button"
          class="pi-btn pi-btn--ghost pi-btn--sm"
          [attr.aria-label]="'Открыть документ ' + row.number"
          [attr.data-test]="'view-button-' + row._id"
          (click)="onView(row)"
        >
          Открыть
        </button>
        <button
          type="button"
          class="pi-btn pi-btn--ghost pi-btn--sm pi-btn--destructive"
          [attr.aria-label]="'Удалить документ ' + row.number"
          [attr.data-test]="'delete-button-' + row._id"
          (click)="onDelete(row)"
        >
          Удалить
        </button>
      </ng-template>
    </app-pi-entity-list>
  `,
})
export class DocumentsPage {
  private readonly service = inject(GeneratedDocumentsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = PAGE_SIZE;

  /** Page-owned filter signals. */
  protected readonly searchQuery = signal<string>('');
  protected readonly periodMonth = signal<string>('');

  /** Page-owned sort signals. */
  private readonly sortKeySig = signal<SortKey | null>('createdAt');
  private readonly sortDirSig = signal<'asc' | 'desc' | null>('desc');

  /** Page-owned cache of the flat-array response. */
  protected readonly items = signal<GeneratedDocument[]>([]);

  constructor() {
    this.service
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.items.set(
            (res.data ?? [])
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt ?? 0).getTime() -
                  new Date(a.createdAt ?? 0).getTime(),
              ),
          );
        }
      });
  }

  /** Combined filter params for wrapper's `[params]` input. */
  protected readonly listParams = computed<DocListParams>(
    () => ({}) as DocListParams,
  );

  /** View-model-mapped rows. */
  protected readonly viewRows = computed<GeneratedDocumentView[]>(() => {
    const rows = this.items();
    const q = this.searchQuery().trim().toLowerCase();
    const period = this.periodMonth();
    let filtered = rows;
    if (period) {
      const [y, m] = period.split('-').map(Number);
      filtered = filtered.filter((d) => {
        if (!d.createdAt) return false;
        const dt = new Date(d.createdAt);
        return dt.getFullYear() === y && dt.getMonth() + 1 === m;
      });
    }
    if (q) {
      filtered = filtered.filter(
        (d) =>
          d.number.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.templateName?.toLowerCase().includes(q) ?? false),
      );
    }
    return filtered.map<GeneratedDocumentView>((doc) => ({
      ...doc,
      displayName: doc.templateName?.trim() || doc.name || '—',
      statusDotClass:
        doc.status === 'final' ? 'bg-accent-cool' : 'bg-sunrise-warm',
      statusLabel:
        doc.status === 'draft'
          ? 'Обработка'
          : doc.sourceType === 'order' || doc.sourceType === 'contract'
            ? 'Отправлено'
            : 'Готово',
    }));
  });

  /** Sorted view-model rows. */
  protected readonly sortedRows = computed<GeneratedDocumentView[]>(() => {
    const rows = this.viewRows();
    const key = this.sortKeySig();
    if (!key) return rows;
    const sign = this.sortDirSig() === 'asc' ? 1 : -1;
    return rows.slice().sort((a, b) => {
      // Branch-local comparator — no temp vars (avoids `no-useless-assignment`
      // on type-narrowed `string | number` initializers).
      const cmp =
        key === 'createdAt'
          ? (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
            (b.createdAt ? new Date(b.createdAt).getTime() : 0)
          : key === 'number'
            ? (a.number ?? '').localeCompare(b.number ?? '', 'ru')
            : a.displayName.localeCompare(b.displayName, 'ru');
      return cmp * sign;
    });
  });

  /** Local EntityService adapter. */
  protected readonly listService: EntityService<
    GeneratedDocumentView,
    DocListParams
  > = {
    list: (params: DocListParams) => {
      const all = this.sortedRows();
      const page = params.page ?? 1;
      const limit = params.limit ?? PAGE_SIZE;
      const total = all.length;
      const start = (page - 1) * limit;
      const items = all.slice(start, start + limit);
      const data: PaginatedResponse<GeneratedDocumentView> = {
        items,
        total,
        page,
        limit,
      };
      return of({ ok: true, data }) as unknown as ReturnType<
        EntityService<GeneratedDocumentView, DocListParams>['list']
      >;
    },
    findById: (id) =>
      this.service.findById(id) as unknown as ReturnType<
        EntityService<GeneratedDocumentView, DocListParams>['findById']
      >,
    create: () => notImplementedStub<GeneratedDocumentView>(),
    update: () => notImplementedStub<GeneratedDocumentView>(),
    remove: (id) =>
      this.service.remove(id) as unknown as ReturnType<
        EntityService<GeneratedDocumentView, DocListParams>['remove']
      >,
  };

  // ─── Template refs ─────────────────────────────────────────────────
  private readonly statusTplRef = viewChild<
    TemplateRef<{ $implicit: GeneratedDocumentView }>
  >('statusTpl');
  private readonly rowActionsTplRef = viewChild<
    TemplateRef<{ $implicit: GeneratedDocumentView }>
  >('rowActionsTpl');

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: GeneratedDocumentView }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: GeneratedDocumentView }>> = {};
    const tpl = this.statusTplRef();
    if (tpl) {
      result['status'] = tpl;
    }
    return result;
  });

  protected readonly rowActionsTplBinding = computed<
    TemplateRef<{ $implicit: GeneratedDocumentView }> | null
  >(() => this.rowActionsTplRef() ?? null);

  // ─── Column definitions ────────────────────────────────────────────
  protected readonly cols: ColumnDef<GeneratedDocumentView>[] = [
    {
      key: 'number',
      label: 'Номер документа',
      sortable: true,
      width: '160px',
      cellClass: 'font-mono text-xs',
    },
    {
      key: 'displayName',
      label: 'Название шаблона',
      sortable: true,
      format: (r) => r.displayName,
    },
    {
      key: 'createdAt',
      label: 'Дата создания',
      sortable: true,
      width: '128px',
      cellClass: 'text-muted-foreground font-mono text-xs',
      format: (r) => formatDate(r.createdAt),
    },
    {
      key: 'status',
      label: 'Статус',
      width: '144px',
    },
  ];

  // ─── Event handlers ────────────────────────────────────────────────
  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onPeriodChange(event: Event): void {
    this.periodMonth.set((event.target as HTMLInputElement).value);
  }

  protected onSortChange(event: {
    key: string;
    dir: 'asc' | 'desc' | null;
  }): void {
    const dir = event.dir;
    this.sortKeySig.set(dir === null ? null : (event.key as SortKey));
    this.sortDirSig.set(dir === null ? null : dir);
  }

  protected onView(doc: GeneratedDocument): void {
    this.service.openHtml(doc._id).subscribe({
      error: (err) => this.toast.error(extractErrorMessage(err)),
    });
  }

  protected onDelete(doc: GeneratedDocument): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить документ?',
        description: `«${doc.name}» будет удалён из архива.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(doc._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Документ удалён');
          this.items.update((arr) => arr.filter((d) => d._id !== doc._id));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}

/** Local date formatter. */
function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
