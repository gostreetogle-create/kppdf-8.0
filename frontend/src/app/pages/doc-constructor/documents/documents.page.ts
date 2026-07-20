import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  GeneratedDocument,
  GeneratedDocumentsService,
} from '../../../shared/services/pi-generated-documents.service';

const PAGE_SIZE = 10;

/**
 * Полная документация страницы: docs/pages/documents.page.md
 */
@Component({
  selector: 'app-documents-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · конструктор документов"
      title="Сформированные документы"
      description="HTML-снимки документов, сгенерированные из шаблонов. Открывайте предпросмотр или удаляйте устаревшие версии."
    />

    <app-pi-toolbar>
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
      <span hint>{{ filtered().length }} записей</span>
    </app-pi-toolbar>

    <app-pi-section title="Журнал генерации" eyebrow="I">
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
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="pi-cell eyebrow text-left w-40">Номер документа</th>
                <th class="pi-cell eyebrow text-left">Название шаблона</th>
                <th class="pi-cell eyebrow text-left w-32">Дата создания</th>
                <th class="pi-cell eyebrow text-left w-36">Статус</th>
                <th class="pi-cell eyebrow text-right w-32">Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (doc of pageRows(); track doc._id) {
                <tr class="pi-table-row pi-table-row-odd group">
                  <td class="pi-cell font-mono text-xs">{{ doc.number }}</td>
                  <td class="pi-cell font-medium">{{ displayTemplateName(doc) }}</td>
                  <td class="pi-cell text-muted-foreground font-mono text-xs">
                    {{ formatDate(doc.createdAt) }}
                  </td>
                  <td class="pi-cell">
                    <span class="inline-flex items-center gap-2">
                      <span
                        class="inline-block w-2 h-2 rounded-full shrink-0"
                        [class.bg-accent-cool]="doc.status === 'final'"
                        [class.bg-sunrise-warm]="doc.status === 'draft'"
                      ></span>
                      <span>{{ statusLabel(doc) }}</span>
                    </span>
                  </td>
                  <td class="pi-cell text-right">
                    <app-pi-row-actions
                      [row]="doc"
                      documentLabel="Открыть"
                      [showEdit]="false"
                      deleteLabel="Удалить"
                      (document)="onView($event)"
                      (delete)="onDelete($event)"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filtered().length > PAGE_SIZE) {
          <div class="mt-4 flex items-center justify-between gap-4">
            <span class="eyebrow text-muted-foreground">{{ rangeLabel() }}</span>
            <div class="flex gap-2">
              <app-pi-button
                variant="outline"
                size="sm"
                [disabled]="pageIndex() === 0"
                (click)="prevPage()"
              >
                ←
              </app-pi-button>
              <app-pi-button
                variant="outline"
                size="sm"
                [disabled]="pageIndex() >= totalPages() - 1"
                (click)="nextPage()"
              >
                →
              </app-pi-button>
            </div>
          </div>
        }
      }
    </app-pi-section>
  `,
})
export class DocumentsPage {
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
