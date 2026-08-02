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
  ColorReferencesService,
  ColorReference,
} from '../../shared/services/pi-color-references.service';
import { ColorReferenceFormDialogComponent } from './color-references-form-dialog.component';
import { pluralRu } from '../../shared/util/russian-plural';

const RU_COLORS = ['цвет', 'цвета', 'цветов'] as const;

/**
 * TZ-PRODUCTS-301 — справочник «Цвета» (hex + RAL).
 *
 * CRUD over `/color-references` (admin/manager mutations, admin/manager/user
 * reads — backend RBAC). System colors («Не выбран», seed-managed) are shown
 * but NOT editable/deletable: the backend refuses 409, and the UI disables
 * the actions up front for a clear contract.
 *
 * Distinct from the generic Category page: this is a flat dictionary used by
 * the product/«Товар» forms (dropdown + swatch). It powers the color select
 * in product creation and the catalog filter.
 */
@Component({
  selector: 'app-color-references-page',
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
      title="Цвета"
      description="Палитра RAL / HEX для товаров и модулей. Выбор цвета — в форме товара и фильтре каталога."
    />

    <app-pi-toolbar>
      <input
        type="search"
        class="pi-input w-72"
        placeholder="Поиск по названию или slug…"
        [value]="searchQuery()"
        (input)="onSearch($event)"
        aria-label="Поиск цветов"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-color-button">
        + Создать цвет
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
          [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет цветов. Создайте первый.'"
        />
      } @else {
        <div class="hairline rounded-sm overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="pi-cell eyebrow text-left w-16">Цвет</th>
                <th class="pi-cell eyebrow text-left">Название</th>
                <th class="pi-cell eyebrow text-left">Slug</th>
                <th class="pi-cell eyebrow text-center w-24">По умолчанию</th>
                <th class="pi-cell eyebrow text-center w-20">Активен</th>
                <th class="pi-cell eyebrow text-right w-28">Действия</th>
              </tr>
            </thead>
            <tbody>
              @for (c of visible(); track c._id) {
                <tr class="pi-table-row pi-table-row-odd group" [class.opacity-50]="!c.isActive">
                  <td class="pi-cell">
                    <span
                      class="inline-block w-8 h-6 rounded-sm hairline align-middle"
                      [style.background-color]="c.hex"
                      [attr.aria-label]="'Цвет ' + c.hex"
                      [title]="c.hex"
                    ></span>
                  </td>
                  <td class="pi-cell font-medium">
                    <span class="inline-flex items-center gap-2">
                      {{ c.name }}
                      @if (c.isSystem) {
                        <span
                          class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground"
                          title="Системный цвет"
                          >системный</span
                        >
                      }
                    </span>
                  </td>
                  <td class="pi-cell font-mono text-xs text-muted-foreground">
                    {{ c.slug }}
                    <span class="ml-2 font-mono text-[10px] uppercase">{{ c.hex }}</span>
                  </td>
                  <td class="pi-cell text-center">
                    @if (c.isDefault) {
                      <span
                        class="text-sunrise-warm"
                        aria-label="Цвет по умолчанию"
                        title="По умолчанию"
                        >★</span
                      >
                    } @else {
                      <span class="text-muted-foreground/40" aria-hidden="true">☆</span>
                    }
                  </td>
                  <td class="pi-cell text-center">
                    <app-pi-switch
                      [checked]="c.isActive"
                      [disabled]="c.isSystem"
                      [ariaLabel]="(c.isActive ? 'Деактивировать ' : 'Активировать ') + c.name"
                      (checkedChange)="onToggleActive(c, $event)"
                      data-test="color-active-switch"
                    />
                  </td>
                  <td class="pi-cell text-right">
                    <app-pi-row-actions
                      [row]="c"
                      [showEdit]="!c.isSystem"
                      [editLabel]="c.isSystem ? 'Системный — нельзя изменять' : 'Редактировать'"
                      [deleteLabel]="c.isSystem ? 'Системный — нельзя удалить' : 'Удалить'"
                      [deleteDisabled]="c.isSystem"
                      [deleteTitle]="
                        c.isSystem
                          ? 'Системный цвет управляется сервером'
                          : 'Цвет, используемый товарами, удалить нельзя (409)'
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
export class ColorReferencesPage {
  private readonly svc = inject(ColorReferencesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<ColorReference[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly visible = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items()
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'));
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
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
    return pluralRu(n, RU_COLORS);
  }

  protected onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ColorReferenceFormDialogComponent, {
      data: null,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected openEdit(c: ColorReference): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(ColorReferenceFormDialogComponent, {
      data: c,
      width: 'md',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected onToggleActive(c: ColorReference, active: boolean): void {
    if (c.isSystem) return;
    this.svc.update(c._id, { isActive: active }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(active ? `«${c.name}» активирован` : `«${c.name}» деактивирован`);
        this.items.update((arr) =>
          arr.map((x) => (x._id === c._id ? { ...x, isActive: active } : x)),
        );
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(c: ColorReference): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить цвет?',
        message: `«${c.name}» (${c.hex}) будет удалён. Цвет, который используют товары, удалить нельзя.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.svc.remove(c._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Цвет удалён');
          this.items.update((arr) => arr.filter((x) => x._id !== c._id));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
