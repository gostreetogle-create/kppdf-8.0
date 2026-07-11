import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { httpResource, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../../shared/page/pi-toolbar.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService, type DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { API_BASE_URL } from '../../../core/api.tokens';
import { TextBlock, TextBlockListResponse, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockFormDialogComponent } from './text-block-dialog.component';

type SortKey = 'name' | 'category' | 'sortOrder' | null;
type SortDir = 'asc' | 'desc';

/**
 * TZ-86 Phase C.1 — TextsPage.
 *
 * /doc-constructor/texts — sub-page для CRUD операций с text-блоками.
 * Источник блоков для Constructor canvas (Phase D — «Тексты» в tool pane).
 *
 * Каноничный Paper & Ink list-page паттерн (mirror work-types.page.ts / TZ-83B):
 *   - OnPush + signal-based
 *   - httpResource для list-GET (auto-fire)
 *   - data/loading/error — computed wrappers
 *   - search через signal
 *   - CRUD через silent-http Observable<SilentResult<T>>
 *   - dialogs через onDialogCloseOnce
 *
 * Backend возвращает `{ items, total }` envelope (Phase B.1 service convention),
 * поэтому data() сразу идёт через .items без дополнительной обёртки.
 */
@Component({
  selector: 'app-texts-page',
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
      eyebrow="раздел · конструктор документов"
      title="Тексты"
      description="Переиспользуемые текстовые блоки (CommonMark markdown) — вставляются в шаблоны документов через конструктор. Группируются по категориям: юридические, вступление, заключение, прочее."
    />

    <app-pi-toolbar>
      <input
        type="search"
        name="texts-search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию или содержимому…"
        aria-label="Поиск текстовых блоков"
        class="pi-input w-72"
      />
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
      <span hint>{{ data().length }} {{ totalLabel(data().length) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" eyebrow="I" hint="клик по заголовку — сортировка">
      @if (error()) {
        <div role="alert" class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
          {{ error() }}
        </div>
      }
      <div class="hairline rounded-sm overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="hairline-b">
            <tr>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left" (click)="setSort('name')">
                Название <span class="ml-1 opacity-40">{{ sortIcon('name') }}</span>
              </th>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left">Slug</th>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left" (click)="setSort('category')">
                Категория <span class="ml-1 opacity-40">{{ sortIcon('category') }}</span>
              </th>
              <th class="pi-cell eyebrow text-left">Теги</th>
              <th class="pi-cell eyebrow cursor-pointer select-none text-left w-28" (click)="setSort('sortOrder')">
                Порядок <span class="ml-1 opacity-40">{{ sortIcon('sortOrder') }}</span>
              </th>
              <th class="pi-cell eyebrow w-20 text-center">Активен</th>
              <th class="pi-cell eyebrow w-40 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track row._id) {
              <tr class="pi-table-row pi-table-row-odd" [class.opacity-50]="!row.isActive" [attr.data-test]="'text-row-' + row._id">
                <td class="pi-cell align-top font-medium">{{ row.name }}</td>
                <td class="pi-cell align-top text-muted-foreground font-mono text-xs empty-cell">{{ row.slug }}</td>
                <td class="pi-cell align-top text-muted-foreground empty-cell">{{ categoryLabel(row.category) }}</td>
                <td class="pi-cell align-top text-muted-foreground text-xs empty-cell">
                  {{ row.tags?.length ? row.tags.join(', ') : '—' }}
                </td>
                <td class="pi-cell align-top text-muted-foreground font-mono text-xs empty-cell">{{ row.sortOrder ?? 0 }}</td>
                <td class="pi-cell align-top text-center">
                  <button
                    type="button"
                    role="switch"
                    [attr.aria-checked]="row.isActive"
                    (click)="onToggleActive(row)"
                    class="inline-flex items-center justify-center w-9 h-5 rounded-full transition-colors"
                    [class.bg-sunrise-warm]="row.isActive"
                    [class.bg-rule]="!row.isActive"
                    [attr.aria-label]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
                  >
                    <span class="block w-4 h-4 rounded-full bg-paper transition-transform" [class.translate-x-2]="row.isActive" [class.-translate-x-2]="!row.isActive"></span>
                  </button>
                </td>
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
                [colspan]="7"
                [message]="searchQuery() ? 'Ничего не найдено.' : 'Нет текстовых блоков. Нажмите «Создать», чтобы добавить первый.'"
                state="empty"
              />
            }
            @if (loading() && sortedRows().length === 0) {
              <app-pi-empty-state [colspan]="7" message="Загрузка…" state="loading" />
            }
          </tbody>
        </table>
      </div>
    </app-pi-section>
  `,
})
export class TextsPage {
  private readonly service = inject(TextBlocksService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * GET /api/text-blocks через httpResource (Angular 20 signals-native).
   * Backend возвращает raw TextBlock[] (Phase A.1 — список unpaginated);
   * обёртка в {items,total} делается в TextBlocksService.list().
   * Здесь data() готова к употреблению.
   */
  private readonly listRes = httpResource<TextBlockListResponse>(() => ({
    url: `${this.baseUrl}/text-blocks`,
  }));

  protected readonly data = computed<TextBlock[]>(() => this.listRes.value()?.items ?? []);
  protected readonly loading = computed<boolean>(() => this.listRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.listRes.error() as HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  private readonly visible = computed<TextBlock[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q),
    );
  });

  protected readonly sortedRows = computed<TextBlock[]>(() => {
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
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
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

  protected categoryLabel(c: TextBlock['category']): string {
    return { legal: 'Юридическое', intro: 'Вступление', outro: 'Заключение', custom: 'Прочее' }[c] ?? c;
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'блок';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блока';
    return 'блоков';
  }

  protected openCreate(): void {
    const ref = this.dialog.open(TextBlockFormDialogComponent, { data: null, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(block: TextBlock): void {
    const ref = this.dialog.open(TextBlockFormDialogComponent, { data: block, width: 'lg' });
    this.refreshOnDialogClose(ref);
  }

  private refreshOnDialogClose<TResult>(ref: DialogRef<TResult>): void {
    onDialogCloseOnce(ref, this.injector, () => this.listRes.reload());
  }

  protected onToggleActive(block: TextBlock): void {
    this.service.update(block._id, { isActive: !block.isActive }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(block.isActive ? `«${block.name}» деактивирован` : `«${block.name}» активирован`);
        this.listRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDelete(block: TextBlock): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить текстовый блок?',
        description: `Удалить «${block.name}»? Если блок используется в шаблонах документов — операция может быть отклонена сервером.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(block._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Текстовый блок удалён');
          this.listRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}

// httpResource is imported at top with @angular/common/http.
