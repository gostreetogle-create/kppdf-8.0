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
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
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
 */
@Component({
  selector: 'app-document-template-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Категории шаблонов"
      description="Классификация шаблонов документов. Выбор категории — в настройках шаблона и фильтре реестра."
    />

    <app-pi-toolbar>
      <input
        type="search"
        class="pi-input w-72"
        placeholder="Поиск по названию…"
        [value]="searchQuery()"
        (input)="onSearch($event)"
        aria-label="Поиск категорий шаблонов"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-category-button">
        + Создать категорию
      </app-pi-button>
      <span hint>{{ visible().length }} {{ totalLabel(visible().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" eyebrow="I">
      @if (loading()) {
        <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
      } @else if (error()) {
        <div
          role="alert"
          class="hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
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
            searchQuery() ? 'Ничего не найдено.' : 'Нет категорий шаблонов. Создайте первую.'
          "
        />
      } @else {
        <div class="hairline rounded-sm overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="pi-cell eyebrow text-left">Название</th>
                <th class="pi-cell eyebrow text-left">Slug</th>
                <th class="pi-cell eyebrow text-center w-20">Активна</th>
                <th class="pi-cell eyebrow text-center w-24">По умолчанию</th>
                <th class="pi-cell eyebrow text-right w-28">Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (c of visible(); track c._id) {
                <tr class="pi-table-row pi-table-row-odd group" [class.opacity-50]="!c.isActive">
                  <td class="pi-cell font-medium">
                    <span class="inline-flex items-center gap-2">
                      {{ c.name }}
                      @if (c.isSystem) {
                        <span
                          class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground"
                          title="Системная категория"
                          >системная</span
                        >
                      }
                    </span>
                  </td>
                  <td class="pi-cell font-mono text-xs text-muted-foreground">{{ c.slug }}</td>
                  <td class="pi-cell text-center">
                    <app-pi-switch
                      [checked]="c.isActive"
                      [disabled]="c.isSystem"
                      [ariaLabel]="(c.isActive ? 'Деактивировать ' : 'Активировать ') + c.name"
                      (checkedChange)="onToggleActive(c, $event)"
                      data-test="category-active-switch"
                    />
                  </td>
                  <td class="pi-cell text-center">
                    @if (c.isDefault) {
                      <span
                        class="text-sunrise-warm"
                        aria-label="Категория по умолчанию"
                        title="По умолчанию"
                        >★</span
                      >
                    } @else {
                      <span class="text-muted-foreground/40" aria-hidden="true">☆</span>
                    }
                  </td>
                  <td class="pi-cell text-right">
                    <app-pi-row-actions
                      [row]="c"
                      [showEdit]="!c.isSystem"
                      [editLabel]="c.isSystem ? 'Системная — нельзя изменять' : 'Переименовать'"
                      [deleteLabel]="c.isSystem ? 'Системная — нельзя удалить' : 'Удалить'"
                      [deleteDisabled]="c.isSystem"
                      [deleteTitle]="
                        c.isSystem
                          ? 'Системная категория управляется сервером'
                          : 'Категорию с шаблонами нельзя удалить (409)'
                      "
                      (edit)="openEdit($event)"
                      (delete)="onDelete($event)"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </app-pi-section>
  `,
})
export class DocumentTemplateCategoriesPage {
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

  protected totalLabel(n: number): string {
    return pluralRu(n, RU_CATEGORIES);
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
