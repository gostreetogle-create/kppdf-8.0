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
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { DOCUMENTS_REF_CHIPS, DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  DocumentTemplateCategoriesService,
  DocumentTemplateCategory,
} from '../../shared/services/pi-document-template-categories.service';
import { DocumentTemplateCategoryFormDialogComponent } from './document-template-category-form-dialog.component';
import { pluralRu } from '../../shared/util/russian-plural';

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
 * TZ-DOC-308 — справочник категорий шаблонов документов.
 *
 * CRUD over `/document-template-categories` (admin mutations, admin/manager
 * reads — backend RBAC). System categories («Общее», seed-managed) are
 * shown but NOT editable/deletable: the backend refuses 409, and the UI
 * disables the actions up front for a clear contract.
 *
 * Distinct from the generic Category page (materials/products tree): this
 * is a flat, template-only dictionary. It powers the category dropdown in
 * the template setup dialog and the templates registry filter.
 *
 * TZ-DICT-307 / TZ-DICT-310: Group Chip Workspace (documents-ref group,
 * chip «Категории шаблонов»). Sibling chip → text-block categories.
 */
@Component({
  selector: 'app-document-template-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
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
      activeId="doc-templates"
    >
      <!-- Sticky tools: search + primary CTA -->
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          class="pi-input w-72"
          placeholder="Поиск по названию…"
          [value]="searchQuery()"
          (input)="onSearch($event)"
          aria-label="Поиск категорий шаблонов"
        />
        <span class="flex-1"></span>
        <app-pi-button variant="default" (click)="openCreate()" data-test="create-category-button">
          + Создать категорию
        </app-pi-button>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          <p>{{ error() }}</p>
          <app-pi-button class="mt-3" variant="outline" size="sm" (click)="reload()">
            Повторить
          </app-pi-button>
        </div>
      }

      <app-pi-table
        [data]="visible()"
        [columns]="columns"
        [cellTemplates]="tpls()"
        [rowActions]="rowActionsTpl"
        [loading]="loading()"
        [emptyMessage]="
          searchQuery() ? 'Ничего не найдено.' : 'Нет категорий шаблонов. Создайте первую.'
        "
        [initialSortKey]="'name'"
        [initialSortDir]="'asc'"
        ariaLabel="Категории шаблонов"
        data-test="template-categories-table"
      />

      <ng-template #rowActionsTpl let-c>
        <app-pi-row-actions
          [row]="c"
          [editLabel]="c.isSystem ? 'Системная — нельзя изменять' : 'Переименовать'"
          [deleteLabel]="c.isSystem ? 'Системная — нельзя удалить' : 'Удалить'"
          [deleteDisabled]="c.isSystem"
          [deleteTitle]="
            c.isSystem
              ? 'Системная категория управляется сервером'
              : 'Категорию с шаблонами нельзя удалить (409)'
          "
          [dataTestEdit]="'edit-cat-' + c.slug"
          [dataTestDelete]="'delete-cat-' + c.slug"
          (edit)="openEdit($event)"
          (delete)="onDelete($event)"
        />
      </ng-template>

      <ng-template #nameTpl let-c>
        <span class="inline-flex items-center gap-2">
          <span class="font-medium">{{ c.name }}</span>
          @if (c.isSystem) {
            <span
              class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground"
              title="Системная категория"
              >системная</span
            >
          }
        </span>
      </ng-template>

      <ng-template #defaultTpl let-c>
        @if (c.isDefault) {
          <span class="text-sunrise-warm" aria-label="Категория по умолчанию" title="По умолчанию"
            >★</span
          >
        } @else {
          <span class="text-muted-foreground/40" aria-hidden="true">☆</span>
        }
      </ng-template>

      <ng-template #activeSwitchTpl let-c>
        <app-pi-switch
          [checked]="c.isActive"
          [disabled]="c.isSystem"
          [ariaLabel]="(c.isActive ? 'Деактивировать ' : 'Активировать ') + c.name"
          (checkedChange)="onToggleActive(c, $event)"
          data-test="category-active-switch"
        />
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class DocumentTemplateCategoriesPage {
  protected readonly toc = DICTIONARY_TOC_CHIPS;
  protected readonly chips = DOCUMENTS_REF_CHIPS;
  private readonly svc = inject(DocumentTemplateCategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<DocumentTemplateCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly visible = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items()
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  });

  /** TZ-DICT-307: compact muted count for the shell title (D2 canon). */
  protected readonly totalLabel = computed(() => {
    const total = this.items().length;
    const shown = this.visible().length;
    if (total === 0) return '';
    return shown !== total
      ? `${shown} из ${total} ${pluralGenitive(total)}`
      : `${total} ${pluralRu(total, RU_CATEGORIES)}`;
  });

  /** TZ-UX-304: pi-table column definitions (replaces raw <table>). */
  protected readonly columns: ColumnDef<DocumentTemplateCategory>[] = [
    { key: 'name', label: 'Название', sortable: true, sticky: 'left' },
    { key: 'slug', label: 'Slug', sortable: true, cellClass: 'font-mono text-xs' },
    { key: 'isActive', label: 'Активна', align: 'center', width: '5rem', sortable: true },
    { key: 'isDefault', label: 'По умолчанию', align: 'center', width: '6rem' },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: DocumentTemplateCategory }>;

  @ViewChild('nameTpl', { static: true })
  protected readonly nameTpl!: TemplateRef<{ $implicit: DocumentTemplateCategory }>;

  @ViewChild('defaultTpl', { static: true })
  protected readonly defaultTpl!: TemplateRef<{ $implicit: DocumentTemplateCategory }>;

  @ViewChild('activeSwitchTpl', { static: true })
  protected readonly activeSwitchTpl!: TemplateRef<{ $implicit: DocumentTemplateCategory }>;

  /** TZ-UX-304: per-column rich templates via pi-table [cellTemplates]. */
  protected readonly tpls = computed<
    Record<string, TemplateRef<{ $implicit: DocumentTemplateCategory }>>
  >(() => ({
    name: this.nameTpl,
    isDefault: this.defaultTpl,
    isActive: this.activeSwitchTpl,
  }));

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
    const ref = this.dialog.open(DocumentTemplateCategoryFormDialogComponent, {
      data: null,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected openEdit(c: DocumentTemplateCategory): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(DocumentTemplateCategoryFormDialogComponent, {
      data: c,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected onToggleActive(c: DocumentTemplateCategory, active: boolean): void {
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

  protected onDelete(c: DocumentTemplateCategory): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить категорию?',
        message: `«${c.name}» будет удалена. Категорию, которую используют шаблоны, удалить нельзя.`,
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
