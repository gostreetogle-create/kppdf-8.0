import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  TextBlock,
  TextBlocksService,
} from '../../../shared/services/pi-text-blocks.service';
import { TextBlockEditorComponent } from './text-block-editor.component';

type SortKey = 'name' | null;
type SortDir = 'asc' | 'desc';

/**
 * TZ-104.6 — TextsPage (single-column layout).
 *
 * Top: full-width visual editor.
 * Bottom: list of saved blocks for browsing/searching.
 */
@Component({
  selector: 'app-texts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    SwitchComponent,
    TextBlockEditorComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · конструктор документов"
      title="Текстовые блоки"
      description="Создавайте текстовые блоки с форматированием и разбивкой на колонки. Готовые блоки можно вставлять в шаблоны документов через конструктор."
    />

    @if (error()) {
      <div role="alert" class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
        {{ error() }}
      </div>
    }

    <!-- ── Toolbar: search + create ── -->
    <div class="texts-toolbar">
      <div class="texts-toolbar-search">
        <input
          type="search"
          name="texts-search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск блоков…"
          aria-label="Поиск текстовых блоков"
          class="pi-input"
        />
      </div>
      <app-pi-button variant="default" (click)="openCreate()" data-test="create-button">
        + Создать
      </app-pi-button>
    </div>

    <!-- ── Editor area (full-width) ── -->
    <div class="texts-editor">
      @if (editingBlock(); as editingBlock) {
        <app-text-block-editor
          [block]="editingBlock"
          (save)="onEditorSaved($event)"
          (cancel)="onEditorCancel()"
        />
      } @else if (creatingNew()) {
        <app-text-block-editor
          (save)="onEditorSaved($event)"
          (cancel)="onEditorCancel()"
        />
      } @else {
        <div class="texts-editor-empty">
          <p class="texts-editor-empty-title">Выберите или создайте блок</p>
          <p class="texts-editor-empty-hint">
            Нажмите «Создать», чтобы добавить новый текстовый блок,<br />
            или выберите готовый блок из списка ниже.
          </p>
        </div>
      }
    </div>

    <!-- ── Saved blocks list ── -->
    <div class="texts-list">
      <div class="texts-list-header">
        <span class="texts-list-title">Сохранённые блоки</span>
        <span class="texts-list-count">{{ data().length }} {{ totalLabel(data().length) }}</span>
      </div>

      @if (loading() && data().length === 0) {
        <div class="texts-list-body">
          <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
        </div>
      } @else if (sortedRows().length === 0 && !loading()) {
        <div class="texts-list-body">
          <app-pi-empty-state
            [colspan]="1"
            [message]="searchQuery() ? 'Ничего не найдено.' : 'Пока нет блоков. Нажмите «Создать».'"
            state="empty"
          />
        </div>
      } @else {
        <div class="texts-list-body">
          <div class="texts-list-items">
            @for (row of sortedRows(); track row._id) {
              <div
                class="texts-list-item"
                [class.is-selected]="editingId() === row._id"
                [class.is-inactive]="!row.isActive"
                (click)="openEdit(row)"
                role="button"
                tabindex="0"
                (keydown.enter)="openEdit(row)"
                [attr.data-test]="'text-row-' + row._id"
              >
                <div class="texts-list-item-body">
                  <span class="texts-list-item-name">{{ row.name }}</span>
                  <span class="texts-list-item-meta">
                    @if (row.columns && row.columns.length > 0) {
                      {{ row.columns.length }} кол.
                    }
                  </span>
                </div>
                <div class="texts-list-item-actions">
                  <app-pi-switch
                    [checked]="row.isActive"
                    [id]="'switch-' + row._id"
                    [ariaLabel]="(row.isActive ? 'Деактивировать ' : 'Активировать ') + row.name"
                    (checkedChange)="onToggleActive(row, $event)"
                    data-test="active-switch"
                  />
                  <app-pi-row-actions
                    [row]="row"
                    [editLabel]="'Редактировать ' + row.name"
                    [deleteLabel]="'Удалить ' + row.name"
                    [dataTestEdit]="'edit-button-' + row._id"
                    [dataTestDelete]="'delete-button-' + row._id"
                    (edit)="openEdit(row)"
                    (delete)="onDelete(row)"
                  />
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        gap: 12px;
      }

      /* ── Toolbar ── */
      .texts-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .texts-toolbar-search {
        flex: 1;
        max-width: 320px;
      }

      .texts-toolbar-search .pi-input {
        width: 100%;
      }

      /* ── Editor area ── */
      .texts-editor {
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
        background: oklch(var(--color-paper));
        padding: 16px 20px;
      }

      .texts-editor-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 120px;
        text-align: center;
        color: oklch(var(--color-muted));
        padding: 24px;
      }

      .texts-editor-empty-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px;
      }

      .texts-editor-empty-hint {
        font-size: 12px;
        margin: 0;
        max-width: 320px;
        line-height: 1.5;
      }

      /* ── Saved blocks list ── */
      .texts-list {
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
        background: oklch(var(--color-paper));
        overflow: hidden;
      }

      .texts-list-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: oklch(var(--color-paper-2));
        border-bottom: 1px solid oklch(var(--color-rule));
      }

      .texts-list-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: oklch(var(--color-ink));
      }

      .texts-list-count {
        font-size: 11px;
        color: oklch(var(--color-muted));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .texts-list-body {
        max-height: 320px;
        overflow-y: auto;
      }

      .texts-list-items {
        display: flex;
        flex-direction: column;
      }

      .texts-list-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        cursor: pointer;
        border-left: 2px solid transparent;
        transition: all 80ms ease;
      }

      .texts-list-item:hover {
        background: oklch(var(--color-sunrise-soft) / 0.4);
      }

      .texts-list-item.is-selected {
        background: oklch(var(--color-sunrise-soft));
        border-left-color: oklch(var(--color-ink));
      }

      .texts-list-item.is-inactive {
        opacity: 0.5;
      }

      .texts-list-item-body {
        flex: 1;
        min-width: 0;
      }

      .texts-list-item-name {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: oklch(var(--color-ink));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .texts-list-item-meta {
        font-size: 10px;
        color: oklch(var(--color-muted));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .texts-list-item-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class TextsPage {
  private readonly service = inject(TextBlocksService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  // ── Data ──

  private readonly reload$ = new Subject<void>();

  private readonly listRes = this.reload$.pipe(
    switchMap(() => this.service.list()),
    takeUntilDestroyed(this.destroyRef),
  ).subscribe((res) => {
    if (res.ok) {
      this.data.set(res.data.items);
    } else {
      this.error.set(extractErrorMessage(res.error));
    }
    this.loading.set(false);
  });

  protected readonly data = signal<TextBlock[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  /** ID of block currently being edited. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly editingBlock = signal<TextBlock | null>(null);
  protected readonly creatingNew = signal<boolean>(false);

  protected readonly searchQuery = signal<string>('');
  protected readonly sortKey = signal<'name' | null>('name');
  protected readonly sortDir = signal<SortDir>('asc');

  private readonly visible = computed<TextBlock[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.content ?? '').toLowerCase().includes(q),
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
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  constructor() {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reload$.next();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected totalLabel(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'блок';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блока';
    return 'блоков';
  }

  // ── Actions ──

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

  protected onEditorSaved(saved: TextBlock): void {
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

  protected onToggleActive(block: TextBlock, checked: boolean): void {
    this.service.update(block._id, { isActive: checked }).subscribe((res) => {
      if (res.ok) {
        this.toast.success(
          checked ? `«${block.name}» активирован` : `«${block.name}» деактивирован`,
        );
        this.reload();
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
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.service.remove(block._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Текстовый блок удалён');
          this.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }
}
