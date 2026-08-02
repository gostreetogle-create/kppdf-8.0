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
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PiToastService } from '../../shared/ui/toast';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { TableComponent, ColumnDef } from '../../shared/ui/pi-table.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import {
  PiColorReferencesService,
  ColorReference,
} from '../../shared/services/pi-color-references.service';
import { ColorReferenceFormDialogComponent } from './color-reference-form-dialog.component';
import { pluralRu } from '../../shared/util/russian-plural';

const RU_COLORS = ['цвет', 'цвета', 'цветов'] as const;

/**
 * TZ-PRODUCTS-301 — справочник цветов (RAL).
 *
 * CRUD over `/color-references` (admin/manager mutations, user reads —
 * backend RBAC). System colors («Не выбран», seed-managed) are shown but
 * NOT editable/deletable: the backend refuses 409, and the UI disables the
 * actions up front for a clear contract.
 *
 * The active catalog powers the RAL dropdown in the product form dialog
 * (TZ-PRODUCTS-302) via `PiColorReferencesService.list({ activeOnly: true })`.
 */
@Component({
  selector: 'app-color-references-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TableComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Цвета (RAL)"
      description="Справочник цветов для товаров. Системный цвет «Не выбран» управляется сервером."
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
      <span hint>{{ filtered().length }} {{ totalLabel(filtered().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог цветов" eyebrow="I">
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
      } @else {
        <app-pi-table
          [data]="visible()"
          [columns]="columns"
          [cellTemplates]="tpls()"
          [rowActions]="rowActionsTpl"
          [total]="filtered().length"
          [pageSize]="pageSize"
          [page]="page()"
          (pageChange)="onPageChange($event)"
          [loading]="loading()"
          [emptyMessage]="searchQuery() ? 'Ничего не найдено.' : 'Нет цветов. Создайте первый.'"
          [initialSortKey]="'name'"
          [initialSortDir]="'asc'"
          ariaLabel="Справочник цветов"
          data-test="colors-table"
        />

        <ng-template #rowActionsTpl let-c>
          <app-pi-row-actions
            [row]="c"
            copyLabel="Создать копию"
            [editLabel]="c.isSystem ? 'Системный — нельзя изменять' : 'Редактировать'"
            [deleteLabel]="c.isSystem ? 'Системный — нельзя удалить' : 'Удалить'"
            [deleteDisabled]="c.isSystem"
            [deleteTitle]="c.isSystem ? 'Системный цвет управляется сервером' : 'Удалить цвет'"
            [dataTestCopy]="'copy-color-' + c.slug"
            [dataTestEdit]="'edit-color-' + c.slug"
            [dataTestDelete]="'delete-color-' + c.slug"
            (copy)="onCopy($event)"
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
                title="Системный цвет"
                >системный</span
              >
            }
            @if (c.isDefault) {
              <span class="text-sunrise-warm" title="Цвет по умолчанию" aria-label="По умолчанию"
                >★</span
              >
            }
          </span>
        </ng-template>

        <ng-template #hexTpl let-c>
          <span class="inline-flex items-center gap-2" [attr.title]="c.hex ?? '—'">
            @if (c.hex) {
              <span
                class="block w-5 h-5 rounded-full hairline shrink-0"
                [style.background]="c.hex"
                [attr.aria-label]="'Swatch ' + c.hex"
              ></span>
            } @else {
              <span class="block w-5 h-5 rounded-full bg-paper-2 hairline shrink-0"></span>
            }
            <span class="font-mono text-xs text-muted-foreground">{{ c.hex ?? '—' }}</span>
          </span>
        </ng-template>

        <ng-template #activeSwitchTpl let-c>
          <app-pi-switch
            [checked]="c.isActive"
            [disabled]="c.isSystem"
            [ariaLabel]="(c.isActive ? 'Деактивировать ' : 'Активировать ') + c.name"
            (checkedChange)="onToggleActive(c, $event)"
            data-test="color-active-switch"
          />
        </ng-template>
      }
    </app-pi-section>
  `,
})
export class ColorReferencesPage {
  private readonly svc = inject(PiColorReferencesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly items = signal<ColorReference[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 100;

  /**
   * Full filtered + sorted list (name/slug search; name then slug sort).
   * Drives `[total]` and the toolbar hint so the pi-table pager can render
   * for N>100 — passing the already-sliced `visible()` length would never
   * exceed pageSize and the pager would stay hidden (reviewer finding).
   */
  protected readonly filtered = computed<ColorReference[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.items()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'ru') || a.slug.localeCompare(b.slug));
    return q
      ? list.filter(
          (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
        )
      : list;
  });

  /** Client-side pagination slice at N>100 (pageSize contract). */
  protected readonly visible = computed<ColorReference[]>(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  /** Column defs — name/hex/isActive render via cellTemplates. */
  protected readonly columns: ColumnDef<ColorReference>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      sticky: 'left',
    },
    { key: 'slug', label: 'Slug', sortable: true, cellClass: 'font-mono text-xs' },
    { key: 'hex', label: 'Цвет', width: '9rem' },
    { key: 'isActive', label: 'Активен', align: 'center', width: '5rem', sortable: true },
  ];

  @ViewChild('rowActionsTpl', { static: true })
  protected readonly rowActionsTpl!: TemplateRef<{ $implicit: ColorReference }>;

  @ViewChild('nameTpl', { static: true })
  protected readonly nameTpl!: TemplateRef<{ $implicit: ColorReference }>;

  @ViewChild('hexTpl', { static: true })
  protected readonly hexTpl!: TemplateRef<{ $implicit: ColorReference }>;

  @ViewChild('activeSwitchTpl', { static: true })
  protected readonly activeSwitchTpl!: TemplateRef<{ $implicit: ColorReference }>;

  protected readonly tpls = computed<
    Record<string, TemplateRef<{ $implicit: ColorReference }>>
  >(() => ({
    name: this.nameTpl,
    hex: this.hexTpl,
    isActive: this.activeSwitchTpl,
  }));

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe((res) => {
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
    this.page.set(1);
  }

  protected onPageChange(p: number): void {
    this.page.set(p);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ColorReferenceFormDialogComponent, {
      data: null,
      width: 'xl',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected openEdit(c: ColorReference): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(ColorReferenceFormDialogComponent, {
      data: c,
      width: 'xl',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected onCopy(c: ColorReference): void {
    if (c.isSystem) return;
    // Client-side copy: open the create dialog pre-filled (slug regenerated
    // server-side from the suffixed name → no uniqueness collision).
    // `isDefault` is NOT carried over — duplicating the default «Не выбран»
    // must not create a second default (resolveDefault contract, reviewer finding).
    const ref = this.dialog.open(ColorReferenceFormDialogComponent, {
      data: { ...c, _id: undefined, name: `${c.name} (копия)`, slug: undefined, isDefault: false },
      width: 'xl',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.reload();
    });
  }

  protected onToggleActive(c: ColorReference, active: boolean): void {
    if (c.isSystem) return;
    // Optimistic update: flip locally first, roll back on failure.
    this.items.update((arr) =>
      arr.map((x) => (x._id === c._id ? { ...x, isActive: active } : x)),
    );
    this.svc.update(c._id, { isActive: active }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(active ? `«${c.name}» активирован` : `«${c.name}» деактивирован`);
      } else {
        this.items.update((arr) =>
          arr.map((x) => (x._id === c._id ? { ...x, isActive: c.isActive } : x)),
        );
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(c: ColorReference): void {
    if (c.isSystem) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить цвет?',
        message: `«${c.name}» будет удалён. Системные цвета и цвет по умолчанию удалить нельзя.`,
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
