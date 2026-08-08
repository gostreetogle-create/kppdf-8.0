import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { ColumnDef, TableComponent } from '../../../shared/ui/pi-table.component';
import {
  GeneratedDocument,
  GeneratedDocumentsService,
} from '../../../shared/services/pi-generated-documents.service';
import { DOCUMENTS_SECTION_CHIPS } from './documents-group-chips';

const PAGE_SIZE = 10;

/**
 * Полная документация страницы: docs/pages/documents.page.md
 */
@Component({
  selector: 'app-documents-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace pathLabel="Документы" [chips]="chips" activeId="documents">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          placeholder="Поиск по номеру или названию…"
          [value]="searchQuery()"
          (input)="onSearch($event)"
          aria-label="Поиск документов"
        />
        <input
          type="month"
          class="pi-input w-44"
          [value]="periodMonth()"
          (change)="onPeriodChange($event)"
          aria-label="Фильтр по периоду"
        />
        <span class="text-xs text-muted-foreground">{{ filtered().length }} записей</span>
      </div>

      <ng-template #statusTpl let-doc>
        <span class="inline-flex items-center gap-2">
          <span
            class="inline-block w-2 h-2 rounded-full shrink-0"
            [class.bg-accent-cool]="doc.status === 'final'"
            [class.bg-sunrise-warm]="doc.status === 'draft'"
          ></span>
          <span>{{ statusLabel(doc) }}</span>
        </span>
      </ng-template>
      <ng-template #rowActionsTpl let-doc>
        <app-pi-row-actions
          [row]="doc"
          documentLabel="Открыть"
          [showEdit]="false"
          deleteLabel="Удалить"
          (document)="onView($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <div class="pi-table-surface hairline rounded-sm overflow-hidden">
        @if (loading()) {
          <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
        } @else if (error()) {
          <div
            role="alert"
            class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          >
            {{ error() }}
          </div>
        } @else if (filtered().length === 0) {
          <app-pi-empty-state
            [colspan]="1"
            [message]="
              searchQuery() || periodMonth()
                ? 'Ничего не найдено.'
                : 'Нет сохранённых документов. Сгенерируйте документ в конструкторе.'
            "
          />
        } @else {
          <div class="hairline rounded-sm overflow-x-auto">
            <app-pi-table
              [data]="pageRows()"
              [columns]="columns"
              [cellTemplates]="cellTemplates()"
              [rowActions]="rowActionsTpl"
              [total]="filtered().length"
              [page]="pageIndex() + 1"
              [pageSize]="PAGE_SIZE"
              (pageChange)="pageIndex.set($event - 1)"
              [localSort]="false"
              [loading]="loading()"
              ariaLabel="Журнал сформированных документов"
              data-test="documents-table"
            />
          </div>
        }
      </div>
    </app-pi-group-workspace>
  `,
})
export class DocumentsPage {
  protected readonly chips = DOCUMENTS_SECTION_CHIPS;

  protected readonly PAGE_SIZE = PAGE_SIZE;

  private readonly svc = inject(GeneratedDocumentsService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<GeneratedDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly periodMonth = signal('');
  protected readonly pageIndex = signal(0);

  protected readonly columns: ColumnDef<GeneratedDocument>[] = [
    { key: 'number', label: 'Номер документа', cellClass: 'font-mono text-xs' },
    {
      key: 'templateName',
      label: 'Название шаблона',
      accessor: (doc) => this.displayTemplateName(doc),
      cellClass: 'font-medium',
    },
    {
      key: 'createdAt',
      label: 'Дата создания',
      accessor: (doc) => this.formatDate(doc.createdAt),
      cellClass: 'font-mono text-xs text-muted-foreground',
    },
    { key: 'status', label: 'Статус' },
  ];
  @ViewChild('statusTpl', { static: true }) private readonly statusTpl!: TemplateRef<{
    $implicit: GeneratedDocument;
  }>;
  @ViewChild('rowActionsTpl', { static: true }) protected readonly rowActionsTpl!: TemplateRef<{
    $implicit: GeneratedDocument;
  }>;
  protected readonly cellTemplates = computed(() => ({ status: this.statusTpl }));

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const period = this.periodMonth();
    let list = this.items();

    if (period) {
      const [y, m] = period.split('-').map(Number);
      list = list.filter((d) => {
        if (!d.createdAt) return false;
        const dt = new Date(d.createdAt);
        return dt.getFullYear() === y && dt.getMonth() + 1 === m;
      });
    }

    if (q) {
      list = list.filter(
        (d) =>
          d.number.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.templateName?.toLowerCase().includes(q) ?? false),
      );
    }

    return list;
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)),
  );

  protected readonly pageRows = computed(() => {
    const start = this.pageIndex() * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.svc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (res.ok) {
            this.items.set(
              (res.data ?? [])
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
                ),
            );
          } else {
            this.error.set(extractErrorMessage(res.error));
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(extractErrorMessage(err));
        },
      });
  }

  protected onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected onPeriodChange(e: Event): void {
    this.periodMonth.set((e.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected rangeLabel(): string {
    const total = this.filtered().length;
    const start = this.pageIndex() * PAGE_SIZE + 1;
    const end = Math.min((this.pageIndex() + 1) * PAGE_SIZE, total);
    return `Показано ${start}–${end} из ${total}`;
  }

  protected prevPage(): void {
    this.pageIndex.update((p) => Math.max(0, p - 1));
  }

  protected nextPage(): void {
    this.pageIndex.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  protected displayTemplateName(doc: GeneratedDocument): string {
    return doc.templateName?.trim() || doc.name || '—';
  }

  protected formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  protected statusLabel(doc: GeneratedDocument): string {
    if (doc.status === 'draft') return 'Обработка';
    if (doc.sourceType === 'order' || doc.sourceType === 'contract') return 'Отправлено';
    return 'Готово';
  }

  protected onView(doc: GeneratedDocument): void {
    this.svc.openHtml(doc._id).subscribe({
      error: (err) => this.toast.error(extractErrorMessage(err)),
    });
  }

  protected onDelete(doc: GeneratedDocument): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить документ?',
        message: `«${doc.name}» будет удалён из архива.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
    });
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.svc.remove(doc._id).subscribe({
        next: (res) => {
          if (res.ok) {
            this.toast.success('Документ удалён');
            this.items.update((arr) => arr.filter((d) => d._id !== doc._id));
          } else {
            this.toast.error(extractErrorMessage(res.error));
          }
        },
      });
    });
  }
}
