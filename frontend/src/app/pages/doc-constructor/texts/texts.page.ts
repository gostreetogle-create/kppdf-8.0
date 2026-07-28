import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, filter, switchMap } from 'rxjs';
import { PiEntityListComponent } from '../../../shared/dsl/entity-list/pi-entity-list.component';
import { toEntityService } from '../../../shared/dsl/entity/entity-service';
import { TextBlockEditorComponent } from './text-block-editor.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../../shared/ui/toast';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { TextBlock, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { pluralRu, RU_BLOCKS, RU_COLUMNS } from '../../../shared/util/russian-plural';
import { ColumnDef } from '../../../shared/ui/pi-table.component';

/**
 * TZ-232.F.4 — TextsPage migrated to `<pi-entity-list>`.
 *
 * Hybrid approach per TZ-232.F design review:
 *  - Catalog zone (right side) → `<pi-entity-list>` wrapper. The
 *    wrapper handles table layout, search debounce, pagination,
 *    loading + error states. Page binds `(create)`, `(rowClick)`,
 *    `(rowDelete)` outputs to coordinate with the editor zone.
 *  - Editor zone (left side) → kept native. The page's
 *    `<app-text-block-editor>` is a full-featured rich-text editor
 *    (not a typical form dialog) and doesn't fit the wrapper's
 *    standard dialog pattern. Editor signals (`editingId`,
 *    `editingBlock`, `creatingNew`) remain page-owned.
 *
 * Pre-migration `reload$` Subject + manual `<table>` + 200-LOC CSS
 * dropped. Status indicator moved to `[cellTemplates]` slot with
 * inline dot + label.
 *
 * Row click → `openEdit(block)` opens the editor zone. Wrapper's
 * built-in search debounces + forwards via `service.list(params)`.
 */
@Component({
  selector: 'app-texts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextBlockEditorComponent, PiEntityListComponent],
  template: `
    <div class="texts-stack">
      <!-- ───── Editor zone (native, kept intact) ───── -->
      <div class="texts-editor-zone">
        @if (editorOpen()) {
          <app-text-block-editor
            [block]="editingBlock()"
            (save)="onEditorSaved()"
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
              <button
                type="button"
                class="pi-btn pi-btn--default pi-btn--sm"
                (click)="openCreate()"
              >
                + Новый блок
              </button>
            </div>
          </section>
        }
      </div>

      <!-- ───── Catalog zone (migrated to <pi-entity-list>) ───── -->
      <section class="texts-catalog" aria-label="Сохранённые блоки">
        <header class="texts-catalog-head">
          <div class="texts-catalog-head-left">
            <h2 class="texts-catalog-title font-display">
              Сохранённые блоки
            </h2>
          </div>
        </header>

        <div class="texts-catalog-scroll">
          <app-pi-entity-list
            #listRef
            [service]="listService"
            [cols]="cols"
            [cellTemplates]="cellTemplates()"
            [showCreate]="true"
            createLabel="Новый"
            searchPlaceholder="Поиск…"
            ariaLabel="Каталог текстовых блоков"
            emptyMessage="Блоков пока нет."
            [initialSortKey]="'name'"
            [initialSortDir]="'asc'"
            [showSearch]="true"
            (create)="openCreate()"
            (rowClick)="openEdit($event)"
            (rowDelete)="onDelete($event)"
          >
          </app-pi-entity-list>
        </div>

        <!-- ───── Status cell with dot indicator ───── -->
        <ng-template #statusTpl let-row>
          <span class="texts-status" data-test="status-cell">
            <span
              class="texts-status-dot"
              [class.texts-status-dot--on]="row.isActive"
              [class.texts-status-dot--off]="!row.isActive"
              aria-hidden="true"
            ></span>
            {{ row.isActive ? 'Активен' : 'Архив' }}
          </span>
        </ng-template>
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

      .texts-catalog-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
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
    `,
  ],
})
export class TextsPage {
  private readonly service = inject(TextBlocksService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  /** Wrapper ref for post-action reload. */
  private readonly listRef = viewChild<PiEntityListComponent<TextBlock>>('listRef');

  /**
   * Adapter: 1-LOC bridge `TextBlocksService` → `EntityService<TextBlock, …>`.
   * Service.list() returns canonical envelope `{items, total}` so the
   * `toEntityService` helper handles the structural conversion.
   */
  protected readonly listService = toEntityService(this.service);

  /** Page-owned editor zone state. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly editingBlock = signal<TextBlock | null>(null);
  protected readonly creatingNew = signal<boolean>(false);

  protected readonly editorOpen = computed(
    () => this.creatingNew() || this.editingBlock() !== null,
  );

  constructor() {
    // Auto-open editor when navigated from builder with ?editId=X
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

  // ─── Cell templates (viewChild signal) ─────────────────────────────
  private readonly statusTplRef = viewChild<
    TemplateRef<{ $implicit: TextBlock }>
  >('statusTpl');

  protected readonly cellTemplates = computed<
    Record<string, TemplateRef<{ $implicit: TextBlock }>>
  >(() => {
    const result: Record<string, TemplateRef<{ $implicit: TextBlock }>> = {};
    const tpl = this.statusTplRef();
    if (tpl) {
      result['status'] = tpl;
    }
    return result;
  });

  // ─── Column definitions ────────────────────────────────────────────
  protected readonly cols: ColumnDef<TextBlock>[] = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      width: '240px',
    },
    {
      key: 'columns',
      label: 'Конфигурация',
      cellClass: 'texts-table-config',
      format: (r) => this.columnConfigUpper(r.columns?.length ?? 1),
    },
    {
      key: 'isActive',
      label: 'Статус',
      width: '120px',
    },
  ];

  // ─── Event handlers ────────────────────────────────────────────────
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

  protected onEditorSaved(): void {
    this.editingBlock.set(null);
    this.editingId.set(null);
    this.creatingNew.set(false);
    this.listRef()?.reload();
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
          this.listRef()?.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected totalLabel(n: number): string {
    return pluralRu(n, RU_BLOCKS);
  }

  protected columnConfigUpper(n: number): string {
    return pluralRu(n, RU_COLUMNS).toUpperCase();
  }
}
