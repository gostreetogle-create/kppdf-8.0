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
import { Subject, switchMap, map, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { TextBlock, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import {
  TextBlockCategoriesService,
  TextBlockCategory,
} from '../../../shared/services/pi-text-block-categories.service';
import { TextBlockEditorComponent } from './text-block-editor.component';
import { pluralRu, RU_BLOCKS, RU_COLUMNS } from '../../../shared/util/russian-plural';
import { ColumnDef, TableComponent } from '../../../shared/ui/pi-table.component';

type SortDir = 'asc' | 'desc';

/**
 * Полная документация страницы: docs/pages/texts.page.md
 * TZ-DOC-336 — PiPageHeader / PiToolbar / PiSection / PiEmptyState / PiRowActions.
 */
@Component({
  selector: 'app-texts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TextBlockEditorComponent,
    TableComponent,
  ],
  template: `
    @if (error()) {
      <div
        role="alert"
        class="mb-4 hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive flex items-center gap-2"
      >
        <span>{{ error() }}</span>
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring ml-auto"
          (click)="error.set(null)"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    }

    @if (editorOpen()) {
      <app-text-block-editor
        [block]="editingBlock()"
        (save)="onEditorSaved($event)"
        (cancel)="onEditorCancel()"
      />
    } @else {
      <app-pi-page-header
        eyebrow="раздел · конструктор документов"
        title="Текстовые блоки"
        description="Сохранённые текстовые блоки для шаблонов: колонки, форматирование, категории. Выберите блок в каталоге или создайте новый."
      />
    }

    <app-pi-toolbar>
      <input
        type="search"
        class="pi-input w-72"
        placeholder="Поиск…"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        aria-label="Поиск текстовых блоков"
      />
      <select
        class="pi-input w-48"
        [value]="categoryFilter()"
        (change)="onCategoryFilterChange($event)"
        aria-label="Фильтр по категории"
        data-test="texts-category-filter"
      >
        <option value="">Все категории</option>
        @for (cat of categories(); track cat._id) {
          <option [value]="cat._id">{{ cat.name }}</option>
        }
      </select>
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Новый блок
      </app-pi-button>
      <span hint>{{ data().length }} {{ totalLabel(data().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Сохранённые блоки" eyebrow="I">
      <ng-template #categoryTpl let-row>
        @if (row.categoryId; as catId) {
          @if (categoryName(catId); as name) {
            <span class="texts-category-badge eyebrow hairline rounded-sm px-2 py-0.5">{{
              name
            }}</span>
          } @else {
            —
          }
        } @else {
          —
        }
      </ng-template>
      <ng-template #statusTpl let-row>
        <span class="inline-flex items-center gap-2 text-sm">
          <span
            class="inline-block h-2 w-2 rounded-full shrink-0"
            [class.bg-accent-cool]="row.isActive"
            [class.bg-muted-foreground]="!row.isActive"
            aria-hidden="true"
          ></span>
          {{ row.isActive ? 'Активен' : 'Архив' }}
        </span>
      </ng-template>
      <ng-template #rowActionsTpl let-row>
        <app-pi-row-actions
          [row]="row"
          [editLabel]="'Редактировать'"
          [deleteLabel]="'Удалить'"
          (edit)="openEdit(row)"
          (delete)="onDelete(row)"
        />
      </ng-template>
      @if (loading() && data().length === 0) {
        <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
      } @else if (sortedRows().length === 0 && !loading()) {
        <app-pi-empty-state
          [colspan]="1"
          [message]="
            searchQuery() || categoryFilter()
              ? 'Ничего не найдено.'
              : 'Блоков пока нет. Нажмите «Новый блок».'
          "
        />
      } @else {
        <app-pi-table
          [data]="sortedRows()"
          [columns]="columns"
          [cellTemplates]="cellTemplates()"
          [rowActions]="rowActionsTpl"
          [total]="sortedRows().length"
          [loading]="loading()"
          ariaLabel="Текстовые блоки"
          data-test="texts-table"
          (rowClick)="openEdit($event)"
        />
      }
    </app-pi-section>
  `,
})
export class TextsPage {
  private readonly service = inject(TextBlocksService);
  private readonly categoryService = inject(TextBlockCategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  private readonly reload$ = new Subject<void>();

  constructor() {
    this.reload$
      .pipe(
        switchMap(() => this.service.list()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res.ok) {
          this.data.set(res.data.items);
        } else {
          this.error.set(extractErrorMessage(res.error));
        }
        this.loading.set(false);
      });
    this.reload();

    this.categoryService
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) this.categories.set(res.data ?? []);
      });

    this.route.queryParams
      .pipe(
        map((p) => p['editId'] as string | undefined),
        filter((id): id is string => !!id),
        switchMap((id) => this.service.findById(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res.ok) this.openEdit(res.data);
      });
  }

  protected readonly data = signal<TextBlock[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly editingId = signal<string | null>(null);
  protected readonly editingBlock = signal<TextBlock | null>(null);
  protected readonly creatingNew = signal<boolean>(false);

  protected readonly editorOpen = computed(
    () => this.creatingNew() || this.editingBlock() !== null,
  );

  protected readonly searchQuery = signal<string>('');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly columns: ColumnDef<TextBlock>[] = [
    { key: 'name', label: 'Название', cellClass: 'font-medium' },
    { key: 'categoryId', label: 'Категория', accessor: (row) => row.categoryId ?? '—' },
    {
      key: 'columns',
      label: 'Конфигурация',
      accessor: (row) => this.columnConfigUpper(row.columns?.length || 1),
      cellClass: 'font-mono text-xs text-muted-foreground',
    },
    { key: 'isActive', label: 'Статус' },
  ];
  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: TextBlock }>;
  @ViewChild('categoryTpl', { static: true })
  protected readonly categoryTpl!: TemplateRef<{ $implicit: TextBlock }>;
  @ViewChild('statusTpl', { static: true })
  protected readonly statusTpl!: TemplateRef<{ $implicit: TextBlock }>;
  protected readonly cellTemplates = computed(() => ({
    categoryId: this.categoryTpl,
    isActive: this.statusTpl,
  }));

  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly categoryFilter = signal<string>('');

  protected categoryName(id: string): string | undefined {
    return this.categories().find((c) => c._id === id)?.name;
  }

  protected onCategoryFilterChange(event: Event): void {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  private readonly visible = computed<TextBlock[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const filterId = this.categoryFilter();
    return this.data().filter((b) => {
      if (filterId && b.categoryId !== filterId) return false;
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || (b.content ?? '').toLowerCase().includes(q);
    });
  });

  protected readonly sortedRows = computed<TextBlock[]>(() => {
    const rows = this.visible().slice();
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => String(a.name).localeCompare(String(b.name), 'ru') * sign);
  });

  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reload$.next();
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected totalLabel(n: number): string {
    return pluralRu(n, RU_BLOCKS);
  }

  protected columnConfigUpper(n: number): string {
    return pluralRu(n, RU_COLUMNS).toUpperCase();
  }

  protected openCreate(): void {
    this.editingBlock.set(null);
    this.creatingNew.set(true);
    this.editingId.set(null);
  }

  protected openEdit(block: TextBlock): void {
    this.editingBlock.set(block);
    this.editingId.set(block._id);
    this.creatingNew.set(false);
  }

  protected onEditorSaved(_saved: TextBlock): void {
    this.editingBlock.set(null);
    this.editingId.set(null);
    this.creatingNew.set(false);
    this.reload();
  }

  protected onEditorCancel(): void {
    this.editingBlock.set(null);
    this.editingId.set(null);
    this.creatingNew.set(false);
  }

  protected onDelete(block: TextBlock): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить текстовый блок?',
        description: `Удалить «${block.name}»?`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(block._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Текстовый блок удалён');
          if (this.editingId() === block._id) this.onEditorCancel();
          this.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
