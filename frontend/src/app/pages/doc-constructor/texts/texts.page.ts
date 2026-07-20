import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PiEmptyStateComponent } from '../../../shared/ui/pi-empty-state/pi-empty-state.component';
import { PiRowActionsComponent } from '../../../shared/ui/pi-row-actions/pi-row-actions.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { TextBlock, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TextBlockEditorComponent } from './text-block-editor.component';
import { pluralRu, RU_BLOCKS, RU_COLUMNS } from '../../../shared/util/russian-plural';

type SortDir = 'asc' | 'desc';

/**
 * Полная документация страницы: docs/pages/texts.page.md
 */
@Component({
  selector: 'app-texts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiEmptyStateComponent,
    PiRowActionsComponent,
    ButtonComponent,
    TextBlockEditorComponent,
  ],
  template: `
    @if (error()) {
      <div
        role="alert"
        class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive flex items-center gap-2"
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

    <div class="texts-stack">
      <div class="texts-editor-zone">
        @if (editorOpen()) {
          <app-text-block-editor
            [block]="editingBlock()"
            (save)="onEditorSaved($event)"
            (cancel)="onEditorCancel()"
          />
        } @else {
          <section class="texts-shell-empty">
            <div class="texts-shell-accent" aria-hidden="true"></div>
            <header class="texts-shell-head">
              <span class="eyebrow text-sunrise-warm">Конструктор · Тексты</span>
              <h1 class="font-display texts-shell-title">Текстовые блоки</h1>
            </header>
            <div class="texts-shell-body pi-dashed-panel">
              <p class="text-sm text-muted-foreground">
                Выберите блок в каталоге ниже или создайте новый
              </p>
              <app-pi-button variant="default" size="sm" (click)="openCreate()"
                >+ Новый блок</app-pi-button
              >
            </div>
          </section>
        }
      </div>

      <section class="texts-catalog" aria-label="Сохранённые блоки">
        <header class="texts-catalog-head">
          <div class="texts-catalog-head-left">
            <h2 class="texts-catalog-title font-display">
              Сохранённые блоки · {{ data().length }} {{ totalLabel(data().length) }}
            </h2>
            <div class="texts-search-wrap">
              <span class="texts-search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                class="texts-search-input"
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                placeholder="Поиск…"
                aria-label="Поиск текстовых блоков"
              />
            </div>
          </div>
          <app-pi-button
            variant="default"
            size="sm"
            (click)="openCreate()"
            data-test="create-button"
          >
            + Новый
          </app-pi-button>
        </header>

        <div class="texts-catalog-scroll">
          @if (loading() && data().length === 0) {
            <app-pi-empty-state [colspan]="1" message="Загрузка…" state="loading" />
          } @else if (sortedRows().length === 0 && !loading()) {
            <p class="texts-catalog-empty text-sm text-muted-foreground">
              @if (searchQuery()) {
                Ничего не найдено
              } @else {
                Блоков пока нет
              }
            </p>
          } @else {
            <table class="texts-table">
              <thead>
                <tr>
                  <th class="eyebrow">Название</th>
                  <th class="eyebrow">Конфигурация</th>
                  <th class="eyebrow">Статус</th>
                  <th class="eyebrow texts-table-actions-col">Действия</th>
                </tr>
              </thead>
              <tbody>
                @for (row of sortedRows(); track row._id) {
                  <tr
                    class="texts-table-row"
                    [class.is-active]="editingId() === row._id"
                    [class.is-inactive-row]="!row.isActive"
                    (click)="openEdit(row)"
                    [attr.data-test]="'text-row-' + row._id"
                  >
                    <td class="texts-table-name">{{ row.name }}</td>
                    <td class="texts-table-config">
                      {{ columnConfigUpper(row.columns?.length || 1) }}
                    </td>
                    <td>
                      <span class="texts-status">
                        <span
                          class="texts-status-dot"
                          [class.texts-status-dot--on]="row.isActive"
                          [class.texts-status-dot--off]="!row.isActive"
                        ></span>
                        {{ row.isActive ? 'Активен' : 'Архив' }}
                      </span>
                    </td>
                    <td class="texts-table-actions" (click)="$event.stopPropagation()">
                      <app-pi-row-actions
                        [row]="row"
                        [editLabel]="'Редактировать'"
                        [deleteLabel]="'Удалить'"
                        (edit)="openEdit(row)"
                        (delete)="onDelete(row)"
                      />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 0 0 8px;
      }

      .texts-stack {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .texts-editor-zone {
        min-height: 0;
      }

      .texts-shell-empty {
        position: relative;
        background: var(--color-paper);
        border: 2px solid var(--color-ink);
        overflow: hidden;
      }
      .texts-shell-accent {
        height: 4px;
        background: linear-gradient(
          90deg,
          var(--color-sunrise-warm),
          var(--color-sunrise-glow),
          var(--color-sunrise-warm)
        );
      }
      .texts-shell-head {
        padding: 24px 32px 16px;
      }
      .texts-shell-title {
        margin: 8px 0 0;
        font-size: 32px;
        font-weight: 600;
        color: var(--color-ink);
      }
      .texts-shell-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 200px;
        margin: 0 32px 32px;
      }

      .texts-catalog {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        background: var(--color-paper);
        border: 2px solid var(--color-ink);
        overflow: hidden;
      }

      .texts-catalog-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--color-rule);
        flex-shrink: 0;
      }
      .texts-catalog-head-left {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .texts-catalog-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-ink);
      }

      .texts-search-wrap {
        position: relative;
      }
      .texts-search-icon {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        color: var(--color-muted-foreground-strong);
        pointer-events: none;
      }
      .texts-search-input {
        width: 192px;
        padding: 6px 8px 6px 26px;
        font-size: 14px;
        border: 1px solid var(--color-rule);
        background: var(--color-paper-2);
        color: var(--color-ink);
      }
      .texts-search-input:focus {
        outline: none;
        outline: 1px solid var(--color-sunrise-warm);
        outline-offset: -1px;
      }

      .texts-catalog-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }
      .texts-catalog-empty {
        padding: 24px;
        text-align: center;
      }

      .texts-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .texts-table thead {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--color-paper-2);
        border-bottom: 1px solid var(--color-rule);
      }
      .texts-table th {
        padding: 8px 24px;
        color: var(--color-muted-foreground-strong);
      }
      .texts-table-actions-col {
        text-align: right;
      }

      .texts-table-row {
        cursor: pointer;
        border-bottom: 1px solid var(--color-rule);
        transition: background 100ms ease;
      }
      .texts-table-row:hover {
        background: color-mix(in oklch, var(--color-paper-2) 70%, transparent);
      }
      .texts-table-row.is-active {
        background: color-mix(in oklch, var(--color-sunrise-warm) 8%, transparent);
        border-left: 4px solid var(--color-sunrise-warm);
      }
      .texts-table-row.is-inactive-row {
        opacity: 0.72;
      }

      .texts-table td {
        padding: 10px 24px;
        vertical-align: middle;
      }
      .texts-table-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-ink);
      }
      .texts-table-config {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        color: var(--color-muted-foreground-strong);
        text-transform: uppercase;
      }
      .texts-table-actions {
        text-align: right;
      }

      .texts-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .texts-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .texts-status-dot--on {
        background: var(--color-accent-cool);
      }
      .texts-status-dot--off {
        background: var(--color-muted-foreground-strong);
      }
      .texts-table-row.is-inactive-row .texts-status {
        color: var(--color-muted-foreground-strong);
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

  private readonly visible = computed<TextBlock[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(
      (b) => b.name.toLowerCase().includes(q) || (b.content ?? '').toLowerCase().includes(q),
    );
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
