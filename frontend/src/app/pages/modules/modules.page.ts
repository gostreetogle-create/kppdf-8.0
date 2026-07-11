import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductModule, ProductModulesService } from '../../shared/services/pi-product-modules.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';

type SortKey = 'name' | 'article' | null;
type SortDir = 'asc' | 'desc';

/**
 * TZ-83 Phase C: ModulesPage — list каталог модулей продукции.
 *
 * Колонки:
 *  - Название
 *  - Артикул
 *  - Габариты модуля (W×H×D + unit)
 *  - Кол-во материалов в составе
 *  - Кол-во видов работ
 *  - Действия (edit / delete)
 *
 * Клик на row → `/modules/:id` (детальная страница с 4 секциями).
 * Edit/Delete через dialogs.
 */
@Component({
  selector: 'app-modules-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · каталог"
      title="Модули"
      description="Составные части продукции: материалы + виды работ. Модуль переиспользуется между товарами."
    />

    <app-pi-toolbar>
      <input
        id="modules-search"
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или артикулу…"
        aria-label="Поиск модулей"
        data-test="search-input"
        class="pi-input w-72"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <span hint>{{ visible().length }} {{ totalLabel(visible().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section
      title="Каталог модулей"
      hint="клик на строку → детальная страница · габариты: W=Ширина H=Высота D=Глубина"
      eyebrow="I"
    >
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }
      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm min-w-[800px]">
          <thead class="hairline-b">
            <tr>
              <th class="pi-cell eyebrow text-left cursor-pointer select-none group" (click)="setSort('name')">
                Название
                <span [class.text-sunrise-warm]="isSortedBy('name')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('name') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left cursor-pointer select-none group" (click)="setSort('article')">
                Артикул
                <span [class.text-sunrise-warm]="isSortedBy('article')" class="ml-1 opacity-40 group-hover:opacity-70">{{ sortIcon('article') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left min-w-32">Габариты модуля</th>
              <th class="pi-cell-numeric eyebrow w-32">Материалов</th>
              <th class="pi-cell-numeric eyebrow w-32">Работ</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr
                class="pi-table-row pi-table-row-odd last:border-0 cursor-pointer hover:bg-paper-2"
                [attr.data-test]="'module-row-' + row._id"
                (click)="onRowClick(row)"
              >
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top font-mono text-xs empty-cell">{{ row.article }}</td>
                <td class="pi-cell align-top font-mono text-xs whitespace-nowrap empty-cell">{{ moduleDimensions(row) }}</td>
                <td class="pi-cell-numeric align-top">{{ row.materials.length }}</td>
                <td class="pi-cell-numeric align-top">{{ row.workTypes.length }}</td>
                <td class="pi-cell align-top">
                  <app-pi-row-actions
                    [row]="row"
                    [editLabel]="'Редактировать ' + row.name"
                    [deleteLabel]="'Удалить ' + row.name"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (edit)="openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </td>
              </tr>
            }
            @if (sortedRows().length === 0 && !loading()) {
              <app-pi-empty-state
                [colspan]="6"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет модулей. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state [colspan]="6" message="Загрузка…" state="loading" />
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class ModulesPage implements OnInit {
  private readonly service = inject(ProductModulesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);

  protected readonly listRes = httpResource<ProductModule[]>(() => ({
    url: `${this.baseUrl}/product-modules`,
  }));

  protected readonly data = computed<ProductModule[]>(
    () => this.listRes.value() ?? [],
  );
  protected readonly visible = computed<ProductModule[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (m) => m.name.toLowerCase().includes(q) || (m.article ?? '').toLowerCase().includes(q),
    );
  });
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  protected readonly sortedRows = computed<ProductModule[]>(() => {
    const rows = this.visible().slice();
    const k = this.sortKey();
    if (!k) return rows;
    const sign = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  ngOnInit(): void {
    // listRes auto-fire
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected setSort(key: Exclude<SortKey, null>): void {
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else if (this.sortDir() === 'asc') {
      this.sortDir.set('desc');
    } else {
      this.sortKey.set(null);
      this.sortDir.set('asc');
    }
  }
  protected sortIcon(key: Exclude<SortKey, null>): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }
  protected isSortedBy(key: Exclude<SortKey, null>): boolean {
    return this.sortKey() === key;
  }

  protected totalLabel(n: number): string {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'модуль';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'модуля';
    return 'модулей';
  }

  protected moduleDimensions(row: ProductModule): string {
    const d = row.dimensions;
    if (!d || (d.width == null && d.height == null && d.depth == null)) return '';
    const parts: string[] = [];
    if (d.width != null) parts.push(`W ${d.width}`);
    if (d.height != null) parts.push(`H ${d.height}`);
    if (d.depth != null) parts.push(`D ${d.depth}`);
    return `${parts.join(' × ')} ${d.unit ?? ''}`.trim();
  }

  protected onRowClick(row: ProductModule): void {
    this.router.navigate(['/modules', row._id]);
  }

  protected openCreate(): void {
    const ref = this.dialog.open(ModuleFormDialogComponent, { data: null, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }
  protected openEdit(row: ProductModule): void {
    const ref = this.dialog.open(ModuleFormDialogComponent, { data: row, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }
  protected onDelete(row: ProductModule): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить модуль?',
        description: `Удалить «${row.name}»? Если он используется в товарах — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Модуль удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }
}
