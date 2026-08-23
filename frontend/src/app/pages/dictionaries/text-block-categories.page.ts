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
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { DOCUMENTS_REF_CHIPS, DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  TextBlockCategoriesService,
  TextBlockCategory,
} from '../../shared/services/pi-text-block-categories.service';
import { TextBlockCategoryFormDialogComponent } from './text-block-category-form-dialog.component';
import { pluralRu } from '../../shared/util/russian-plural';
import { ColumnDef, TableComponent } from '../../shared/ui/pi-table.component';

const RU_CATEGORIES = ['категория', 'категории', 'категорий'] as const;

/**
 * Genitive form for «N категорий» after «из» («0 из 3 категорий»,
 * «0 из 1 категории»). pluralRu() returns the nominative, which is
 * wrong in the «X из Y …» construction (review nit, TZ-DICT-307).
 */
function pluralGenitive(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? 'категории' : 'категорий';
}

/**
 * TZ-DOC-316 — справочник категорий текстовых блоков.
 *
 * CRUD over `/text-block-categories` (admin mutations, admin/manager
 * reads — backend RBAC, TZ-DOC-315). System categories («Общее»,
 * seed-managed) are shown but NOT editable/deletable: the backend
 * refuses 409, and the UI disables the actions up front for a clear
 * contract.
 *
 * Distinct from the generic Category page and from DocumentTemplateCategory
 * (TZ-DOC-308): this is a flat, text-block-only dictionary. It powers the
 * category select in the block editor and the registry filter on
 * `/doc-constructor/texts`.
 *
 * TZ-DICT-307 / TZ-DICT-310: Group Chip Workspace (documents-ref group,
 * chip «Категории текстов»). Sibling chip → document-template categories.
 */
@Component({
  selector: 'app-text-block-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-group-workspace
      [toc]="toc"
      tocActiveId="documents-ref"
      [chips]="chips"
      activeId="text-blocks"
    >
      <ng-template #nameTpl let-c>
        <span class="inline-flex items-center gap-2 text-xs font-medium">
          {{ c.name }}
          @if (c.isSystem) {
            <span class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground"
              >системная</span
            >
          }
          @if (c.isDefault) {
            <span class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-sunrise-warm"
              >по умолчанию</span
            >
          }
        </span>
      </ng-template>
      <ng-template #activeTpl let-c>
        <app-pi-switch
          [checked]="c.isActive"
          [disabled]="c.isSystem"
          [ariaLabel]="(c.isActive ? 'Деактивировать ' : 'Активировать ') + c.name"
          (checkedChange)="onToggleActive(c, $event)"
          data-test="category-active-switch"
        />
      </ng-template>
      <ng-template #actionsTpl let-c>
        <app-pi-row-actions
          [row]="c"
          [showEdit]="!c.isSystem"
          [editLabel]="c.isSystem ? 'Системная — нельзя изменять' : 'Редактировать'"
          [deleteLabel]="c.isSystem ? 'Системная — нельзя удалить' : 'Удалить'"
          [deleteDisabled]="c.isSystem"
          [deleteTitle]="
            c.isSystem
              ? 'Системная категория управляется сервером'
              : 'Категорию, которую используют блоки, удалить нельзя (409)'
          "
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>
      <!-- Sticky tools: search + primary CTA -->
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          placeholder="Поиск по названию или slug…"
          [value]="searchQuery()"
          (input)="onSearch($event)"
          aria-label="Поиск категорий текстов"
        />
        <span class="flex-1"></span>
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-category-button">
          + Создать категорию
        </app-pi-button>
      </div>

      @if (loading()) {
        <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
      } @else if (error()) {
        <div
          role="alert"
          class="hairline border-destructive rounded-sm px-4 py-3 text-xs text-destructive"
        >
          <p>{{ error() }}</p>
          <app-pi-button class="mt-3" variant="outline" size="sm" (click)="reload()">
            Повторить
          </app-pi-button>
        </div>
      } @else if (visible().length === 0) {
        <app-pi-empty-state
          [colspan]="1"
          [message]="
            searchQuery() ? 'Ничего не найдено.' : 'Нет категорий текстов. Создайте первую.'
          "
        />
      } @else {
        <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
          <app-pi-table
            [compact]="true"
            [data]="visible()"
            [columns]="columns"
            [cellTemplates]="tpls()"
            [rowActions]="rowActionsTpl"
            [emptyMessage]="
              searchQuery() ? 'Ничего не найдено.' : 'Нет категорий текстов. Создайте первую.'
            "
            [loading]="loading()"
            ariaLabel="Категории текстов"
            data-test="text-block-categories-table"
          />
        </div>
      }
    </app-pi-group-workspace>
  `,
})
export class TextBlockCategoriesPage {
  protected readonly toc = DICTIONARY_TOC_CHIPS;
  protected readonly chips = DOCUMENTS_REF_CHIPS;
  private readonly svc = inject(TextBlockCategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<TextBlockCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly columns: ColumnDef<TextBlockCategory>[] = [
    { key: 'name', label: 'Название' },
    { key: 'slug', label: 'Slug', cellClass: 'font-mono text-xs text-muted-foreground' },
    { key: 'description', label: 'Описание' },
    { key: 'isActive', label: 'Активна', align: 'center', width: '5rem' },
  ];

  @ViewChild('nameTpl', { static: true }) protected readonly nameTpl!: TemplateRef<{
    $implicit: TextBlockCategory;
  }>;
  @ViewChild('activeTpl', { static: true }) protected readonly activeTpl!: TemplateRef<{
    $implicit: TextBlockCategory;
  }>;
  @ViewChild('actionsTpl', { static: true }) protected readonly rowActionsTpl!: TemplateRef<{
    $implicit: TextBlockCategory;
  }>;
  protected readonly tpls = computed<Record<string, TemplateRef<{ $implicit: TextBlockCategory }>>>(
    () => ({
      name: this.nameTpl,
      isActive: this.activeTpl,
    }),
  );

  protected readonly visible = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items()
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  });

  protected typeLabel(c: TextBlockCategory): string {
    return c.isActive ? 'Активна' : 'Архив';
  }

  /** TZ-DICT-307: compact muted count for the shell title (D2 canon). */
  protected readonly totalLabel = computed(() => {
    const total = this.items().length;
    const shown = this.visible().length;
    if (total === 0) return '';
    return shown !== total
      ? `${shown} из ${total} ${pluralGenitive(total)}`
      : `${total} ${pluralRu(total, RU_CATEGORIES)}`;
  });

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.loading.set(false);
        if (res.ok) {
          this.items.set(res.data ?? []);
        } else {
          this.error.set(extractErrorMessage(res.error));
        }
      });
  }

  protected onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(TextBlockCategoryFormDialogComponent, {
      data: null,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected openEdit(c: TextBlockCategory): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(TextBlockCategoryFormDialogComponent, {
      data: c,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected onToggleActive(c: TextBlockCategory, active: boolean): void {
    if (c.isSystem) return;
    this.svc.update(c._id, { isActive: active }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(active ? `«${c.name}» активирована` : `«${c.name}» деактивирована`);
        this.items.update((arr) =>
          arr.map((x) => (x._id === c._id ? { ...x, isActive: active } : x)),
        );
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(c: TextBlockCategory): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить категорию?',
        message: `«${c.name}» будет удалена. Категорию, которую используют текстовые блоки, удалить нельзя.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.svc.remove(c._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Категория удалена');
          this.items.update((arr) => arr.filter((x) => x._id !== c._id));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
