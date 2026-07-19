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
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import {
  Subject,
  catchError,
  debounceTime,
  forkJoin,
  groupBy,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { LucideAngularModule, FileText, Plus, RefreshCw, Check, AlertCircle, Loader2, Trash2 } from 'lucide-angular';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import {
  blockKey,
  type DataBindingSource,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  AddBlockPayload,
  BuilderToolPaneComponent,
} from './builder-tool-pane.component';
import { BuilderCanvasComponent } from './builder-canvas.component';
import { BuilderInspectorComponent } from './builder-inspector.component';

/**
 * Полная документация страницы: docs/pages/builder.page.md
 *
 * TZ-86 Phase D.1 + D.2 — `BuilderPage` (3-pane shell, state orchestrator).
 *
 * Layout (280 + 1fr + 320):
 *   ┌──────────┬──────────────────────────┬──────────────┐
 *   │ Tool     │ Canvas                   │ Inspector    │
 *   │ Pane     │ (cdkDropList id=…)       │              │
 *   │ 280px    │ flex-1                   │ 320px        │
 *   └──────────┴──────────────────────────┴──────────────┘
 *
 * Phase D.2 additions:
 *   1. **Background image** — `template` signal holds the full DocumentTemplate
 *      (with `backgroundImage[]`). Re-fetched on upload. Passed to
 *      BuilderCanvas as `backgroundImages` input → rendered as absolute-
 *      positioned bg layer (opacity 0.4, pointer-events none).
 *   2. **Drag-from-palette** — ToolPane wraps palette items in `cdkDropList`
 *      with `cdkDropListConnectedTo: ['canvas-droplist']`. When a palette
 *      item is dropped on the canvas, BuilderCanvas emits `(dropAdd)` with
 *      `{ payload, insertIndex }`. BuilderPage optimistic-inserts at index
 *      + POSTs add + triggers reorder to lock position server-side.
 *   3. **Last-saved indicator** — `saveStatus` signal tracks 'idle' | 'saving'
 *      | 'saved' | 'error'. Piped into save$ via `tap` (set saving) +
 *      result handler (set saved→idle after 2s, or error). Rendered as
 *      small chip in PiPageHeader next to Reload button.
 *
 * Auto-save architecture (unchanged from D.1):
 *   Subject<{_id, patch}> → groupBy(_id) → debounceTime(1500) → switchMap → service.update()
 */
@Component({
  selector: 'app-builder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    BuilderToolPaneComponent,
    BuilderCanvasComponent,
    BuilderInspectorComponent,
  ],
  template: `
    @if (!templateId()) {
      <app-pi-page-header
        eyebrow="раздел · конструктор документов"
        title="Конструктор документов"
        [subtitle]="headerSubtitle()"
      />

      <app-pi-section title="Выберите шаблон" description="Список доступных шаблонов для редактирования">
        @if (templateListRes.isLoading()) {
          <p class="empty-state">Загрузка шаблонов…</p>
        } @else if (templateListRes.error()) {
          <p class="empty-state empty-state--error">
            Не удалось загрузить шаблоны: {{ templateListErrorMessage() }}
          </p>
        } @else if (templateListRes.value() && templateListRes.value()!.length > 0) {
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Название</th>
                  <th class="pi-cell eyebrow text-right w-40">Действия</th>
                </tr>
              </thead>
              <tbody>
                @for (t of templateListRes.value()!; track t._id) {
                  <tr class="pi-table-row pi-table-row-odd group cursor-pointer"
                      (click)="onTemplatePick(t._id)">
                    <td class="pi-cell font-medium">{{ t.name }}</td>
                    <td class="pi-cell text-right">
                      <div class="flex items-center justify-end gap-2" (click)="$event.stopPropagation()">
                        <app-pi-button
                          variant="outline"
                          size="sm"
                          (click)="onTemplatePick(t._id)"
                          data-test="open-template"
                        >
                          Открыть
                        </app-pi-button>
                        <app-pi-button
                          variant="outline"
                          size="sm"
                          (click)="onDuplicateTemplate(t)"
                          data-test="duplicate-template"
                        >
                          Дублировать
                        </app-pi-button>
                        <app-pi-button
                          variant="destructive"
                          size="sm"
                          (click)="onDeleteTemplate(t)"
                          data-test="delete-template"
                        >
                          Удалить
                        </app-pi-button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <div class="pi-dashed-panel max-w-sm mx-auto p-6 mb-4 flex flex-col items-center gap-3">
              <span class="eyebrow text-sunrise-warm">Нет шаблонов</span>
              <p class="text-sm text-muted-foreground">
                Создайте первый шаблон документа для начала работы с конструктором.
              </p>
              <app-pi-button
                variant="default"
                size="sm"
                [disabled]="isCreating()"
                (click)="onCreateTemplate()"
                data-test="create-template-button"
              >
                <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                {{ isCreating() ? 'Создание…' : '+ Создать шаблон' }}
              </app-pi-button>
              <p class="text-xs text-muted-foreground mt-1">
                Подсказка: перейдите в Тексты / Таблицы чтобы добавить reusable блоки
              </p>
            </div>
          </div>
        }
      </app-pi-section>
    } @else {
      <div class="builder-subtitle">
        <span class="text-xs text-muted-foreground">{{ headerSubtitle() }}</span>
      </div>

      <div class="builder-shell">
        <app-builder-tool-pane
          [backgroundImages]="template()?.backgroundImage ?? []"
          [defaultBackgroundIndex]="template()?.defaultBackgroundIndex ?? -1"
          [backgroundOpacity]="template()?.backgroundOpacity ?? 0.3"
          [orientation]="orientation()"
          (addBlock)="onAddBlock($event)"
          (uploadBackground)="onBackgroundUpload($event)"
          (removeBackground)="onRemoveBackground($event)"
          (setDefaultBackground)="onSetDefaultBackground($event)"
          (setOpacity)="onSetOpacity($event)"
          (setOrientation)="onSetOrientation($event)"
        />

        <app-builder-canvas
          [blocks]="blocks()"
          [selectedId]="selectedId()"
          [selectedIds]="selectedIds()"
          [backgroundImages]="backgroundImages()"
          [orientation]="orientation()"
          [backgroundOpacity]="template()?.backgroundOpacity ?? 0.3"
          (select)="onSelect($event)"
          (multiSelect)="onMultiSelect($event)"
          (reorder)="onReorder($event)"
          (dropAdd)="onDropAdd($event)"
        />

        <app-builder-inspector
          [block]="selectedBlock()"
          [selectedCount]="selectedIds().size"
          (update)="onInspectorUpdate($event)"
          (delete)="onDeleteBlock($event)"
          (deleteSelected)="onDeleteSelected()"
          (editSelected)="onEditSelected()"
        />
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }

      .builder-shell {
        display: flex;
        flex: 1;
        min-height: 0;
        border-top: 1px solid var(--color-rule);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .builder-subtitle {
        padding: 4px 0 8px;
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 8px;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
      }

      .status-chip--saving {
        color: var(--color-muted);
        background: var(--color-paper-2);
      }

      .status-chip--saved {
        color: var(--color-ink);
        background: var(--color-sunrise-soft);
        border-color: var(--color-sunrise-warm);
      }

      .status-chip--error {
        color: var(--color-destructive);
        background: var(--color-paper-2);
        border-color: var(--color-destructive);
      }

      .empty-state {
        text-align: center;
        color: var(--color-muted);
        padding: 32px 16px;
        font-size: 13px;
        margin: 0;
      }

      .empty-state--error {
        color: var(--color-destructive);
      }
    `,
  ],
})
export class BuilderPage {
  // DI
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  // Icons
  protected readonly FileTextIcon = FileText;
  protected readonly PlusIcon = Plus;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly CheckIcon = Check;
  protected readonly AlertIcon = AlertCircle;
  protected readonly LoaderIcon = Loader2;
  protected readonly TrashIcon = Trash2;

  // State
  protected readonly templateId = signal<string | null>(null);
  protected readonly template = signal<DocumentTemplate | null>(null);
  protected readonly blocks = signal<TemplateBlock[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isCreating = signal<boolean>(false);
  protected readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save Subject — grouped by _id, debounced per group.
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();

  // D.2.3 nit (code-reviewer): monotonic counter for the 2s 'saved'→'idle'
  // timer revert. Without this guard, a stale timer from an earlier 'saved'
  // state could revert a NEW 'saved' state set by a more recent save cycle
  // that completed within the 2s window. `++savedTick` returns the new value;
  // each timer callback captures its own `myTick` and only reverts if no
  // newer save has started.
  private savedTick = 0;

  // Selected block derived (works for both single-click and multi-select single)
  protected readonly selectedBlock = computed<TemplateBlock | null>(() => {
    // Single click selection
    const id = this.selectedId();
    if (id) {
      return this.blocks().find((b) => blockKey(b) === id) ?? null;
    }
    // Multi-select: if exactly 1 block selected, treat it as "selected"
    const ids = this.selectedIds();
    if (ids.size === 1) {
      const key = Array.from(ids)[0];
      return this.blocks().find((b) => blockKey(b) === key) ?? null;
    }
    return null;
  });

  protected readonly headerSubtitle = computed<string>(() => {
    const id = this.templateId();
    if (!id) return 'Выберите шаблон для редактирования';
    const count = this.blocks().length;
    return `Шаблон ${id.slice(-6)} · ${count} ${pluralBlocks(count)}`;
  });

  /** D.2.1: derived background images from template — respects defaultBackgroundIndex. */
  protected readonly backgroundImages = computed<string[]>(() => {
    const t = this.template();
    if (!t) return [];
    const all = t.backgroundImage ?? [];
    const idx = t.defaultBackgroundIndex ?? -1;
    if (idx >= 0 && idx < all.length) return [all[idx]];
    return all;
  });

  protected readonly orientation = computed<'portrait' | 'landscape'>(() => {
    return (this.template() as any)?.orientation ?? 'portrait';
  });

  // httpResource for the template picker (only used when no :id).
  protected readonly templateListRes = httpResource<DocumentTemplate[]>(
    () => '/api/document-templates',
    { defaultValue: [] },
  );

  protected readonly templateListErrorMessage = computed<string>(() => {
    const err = this.templateListRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });

  constructor() {
    // 1) Initialize save$ pipeline (groupBy _id → debounce 1500 → switchMap).
    //    D.2.3: `tap` before switchMap to set 'saving'; success path sets
    //    'saved' (auto-revert to 'idle' after 2s via timer), failure sets 'error'.
    this.save$
      .pipe(
        tap(() => this.saveStatus.set('saving')),
        groupBy((p) => p._id),
        mergeMap((group$) =>
          group$.pipe(
            debounceTime(1500),
            switchMap(({ _id, patch }) =>
              this.blocksSvc.update(_id, patch),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => this.handleSaveResult(res));

    // 2) Watch route param :id + query params (Phase E.3: ?source + ?sourceId).
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.templateId.set(id);
      this.blocks.set([]);
      this.template.set(null);
      this.selectedId.set(null);
      this.saveStatus.set('idle');
      if (id) this.loadBlocks(id);
    });

    // Phase E.3: read ?source + ?sourceId query params (preserved across
    // template-pick navigation). Logged for future use; binding logic is
    // out of scope until the doc-template service supports pre-binding.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((qp) => {
        const source = qp.get('source');
        const sourceId = qp.get('sourceId');
        if (source && sourceId) {
          this.sourceContext.set({ source, sourceId });
        } else {
          this.sourceContext.set(null);
        }
      });
  }

  /** Phase E.3: source context (order/contract ID pre-binding for future expansion). */
  protected readonly sourceContext = signal<{ source: string; sourceId: string } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Initial load — fetches BOTH blocks AND template (D.2.1 needs template).
  // ─────────────────────────────────────────────────────────────
  private loadBlocks(id: string): void {
    this.isLoading.set(true);
    // Fetch template first (lightweight); blocks second.
    this.templatesSvc.findById(id).subscribe({
      next: (tRes) => {
        if (tRes.ok) this.template.set(tRes.data);
      },
      error: () => {
        // Non-fatal — canvas can still render without bg images.
      },
    });
    this.blocksSvc.listByTemplate(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.ok) {
          this.blocks.set(res.data ?? []);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // D.2.1: Background upload
  // ─────────────────────────────────────────────────────────────
  protected onBackgroundUpload(file: File): void {
    const tid = this.templateId();
    if (!tid) return;
    const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      this.toast.error('Допустимы только PNG, JPEG, WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Файл больше 5 МБ');
      return;
    }
    this.saveStatus.set('saving');
    this.templatesSvc.uploadBackground(tid, file).subscribe({
      next: (res) => {
        if (res.ok) {
          this.template.update((t) => t ? { ...t, backgroundImage: res.data.backgroundImage } : t);
          this.toast.success('Фон загружен');
          this.saveStatus.set('saved');
          const myTick = ++this.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.savedTick) this.saveStatus.set('idle');
          });
        } else {
          this.toast.error(extractErrorMessage(res.error));
          this.saveStatus.set('error');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractErrorMessage(err));
        this.saveStatus.set('error');
      },
    });
  }

  protected onRemoveBackground(index: number): void {
    const tid = this.templateId();
    if (!tid) return;
    this.templatesSvc.removeBackground(tid, index).subscribe({
      next: (res) => {
        if (res.ok) {
          this.template.update((t) => {
            if (!t) return t;
            const bg = [...(t.backgroundImage ?? [])];
            bg.splice(index, 1);
            let defIdx = (t as any).defaultBackgroundIndex ?? -1;
            if (defIdx === index) defIdx = bg.length > 0 ? 0 : -1;
            else if (defIdx > index) defIdx--;
            return { ...t, backgroundImage: bg, defaultBackgroundIndex: defIdx };
          });
          this.toast.success('Фон удалён');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
    });
  }

  protected onSetDefaultBackground(index: number): void {
    const tid = this.templateId();
    if (!tid) return;
    this.templatesSvc.setDefaultBackground(tid, index).subscribe({
      next: (res) => {
        if (res.ok) {
          this.template.update((t) => t ? { ...t, defaultBackgroundIndex: index } : t);
          this.toast.success(index >= 0 ? 'Фон по умолчанию установлен' : 'Показывать все фоны');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
    });
  }

  protected onSetOrientation(orientation: 'portrait' | 'landscape'): void {
    const tid = this.templateId();
    if (!tid) return;
    this.templatesSvc.setOrientation(tid, orientation).subscribe({
      next: (res) => {
        if (res.ok) {
          this.template.update((t) => t ? { ...t, orientation } : t);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
    });
  }

  protected onSetOpacity(opacity: number): void {
    this.template.update((t) => t ? { ...t, backgroundOpacity: opacity } : t);
    const tid = this.templateId();
    if (tid) {
      this.templatesSvc.update(tid, { backgroundOpacity: opacity }).subscribe();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Tool pane → add block (Phase D.1) / drop from palette (D.2.2)
  // ─────────────────────────────────────────────────────────────
  protected onAddBlock(payload: AddBlockPayload): void {
    return this.insertBlock(payload, this.blocks().length);
  }

  /** D.2.2: drag-from-palette handler — adds block at the dropped index. */
  protected onDropAdd(event: { payload: AddBlockPayload; insertIndex: number }): void {
    const idx = Math.max(0, Math.min(event.insertIndex, this.blocks().length));
    this.insertBlock(event.payload, idx);
  }

  private insertBlock(payload: AddBlockPayload, insertIndex: number): void {
    const tid = this.templateId();
    if (!tid) {
      this.toast.error('Сначала выберите шаблон');
      return;
    }
    const order = insertIndex; // temporary; server will reassign on reorder
    const newBlock = this.buildBlockFromPayload(tid, payload, order);
    // Optimistic insert at index.
    this.blocks.update((arr) => {
      const next = [...arr];
      next.splice(insertIndex, 0, newBlock);
      return next;
    });
    this.selectedId.set(blockKey(newBlock));

    this.blocksSvc
      .add(tid, {
        type: newBlock.type,
        order: newBlock.order,
        ...(newBlock.title ? { title: newBlock.title } : {}),
        ...(newBlock.content ? { content: newBlock.content } : {}),
        ...(newBlock.columns?.length ? { columns: newBlock.columns } : {}),
        ...(newBlock.height ? { height: newBlock.height } : {}),
        showLine: newBlock.showLine,
        ...(newBlock.settings ? { settings: newBlock.settings } : {}),
        ...(newBlock.dataBinding ? { dataBinding: newBlock.dataBinding } : {}),
        isActive: newBlock.isActive,
      })
      .subscribe({
        next: (res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== newBlock.tempId));
            return;
          }
          // Swap tempId for server _id at the same index.
          this.blocks.update((arr) =>
            arr.map((b) => (b.tempId === newBlock.tempId ? res.data : b)),
          );
          this.selectedId.set(res.data._id ?? null);
          // If inserted mid-list (not at end), fire atomic reorder to lock the
          // server-side position — POST /add appends, not inserts at index.
          if (insertIndex < this.blocks().length - 1) {
            const ids = this.blocks()
              .filter((b) => b._id)
              .map((b) => b._id!);
            this.blocksSvc.reorder(tid, { blockIds: ids }).subscribe({
              next: (r) => {
                if (!r.ok) this.toast.error(extractErrorMessage(r.error));
              },
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractErrorMessage(err));
          this.blocks.update((arr) => arr.filter((b) => b.tempId !== newBlock.tempId));
        },
    });
  }

  protected onDuplicateTemplate(t: DocumentTemplate): void {
    this.http.post<DocumentTemplate>(`${this.baseUrl}/document-templates/${t._id}/duplicate`, {})
      .subscribe({
        next: () => {
          this.toast.success('Копия шаблона создана');
          this.templateListRes.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  /**
   * Build a new TemplateBlock from the 4 AddBlockPayload variants.
   * Pinned to BLOCK_TYPES + DATA_BINDING_SOURCES in the types module.
   */
  private buildBlockFromPayload(
    templateId: string,
    payload: AddBlockPayload,
    order: number,
  ): TemplateBlock {
    const tempId = crypto.randomUUID();
    const base = {
      tempId,
      templateId,
      order,
      isActive: true,
      showLine: false,
      dataBinding: null,
    };
    switch (payload.source) {
      case 'block-type':
        return {
          ...base,
          type: payload.type,
          content: '',
          height: payload.type === 'spacer' ? 40 : undefined,
        };
      case 'text-block':
        return {
          ...base,
          type: 'text',
          title: payload.textBlock.name,
          content: payload.textBlock.content,
          columns: payload.textBlock.columns,
          dataBinding: { source: 'static' as DataBindingSource, value: payload.textBlock._id ?? '' },
        };
      case 'table-template':
        return {
          ...base,
          type: 'table',
          title: payload.tableTemplate.name,
          settings: {
            tableTemplateId: payload.tableTemplate._id,
            tableTemplateColumns: payload.tableTemplate.columns,
            tableTemplateSampleRows: payload.tableTemplate.sampleRows,
          },
        };
      case 'data-binding':
        return {
          ...base,
          type: 'text',
          content: `[${payload.field.label}]`,
          dataBinding: { source: payload.dataSource, field: payload.field.key },
        };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Canvas → select / reorder
  // ─────────────────────────────────────────────────────────────
  protected onSelect(block: TemplateBlock): void {
    this.selectedId.set(blockKey(block));
    this.selectedIds.set(new Set());
  }

  protected onMultiSelect(block: TemplateBlock): void {
    const key = blockKey(block);
    const ids = new Set(this.selectedIds());
    if (ids.has(key)) {
      ids.delete(key);
    } else {
      ids.add(key);
    }
    this.selectedIds.set(ids);
    // Clear single selection when multi-selecting
    if (ids.size > 0) {
      this.selectedId.set(null);
    }
  }

  protected onEditSelected(): void {
    const block = this.selectedBlock();
    if (!block) return;

    // Navigate based on block type
    const settings = block.settings as Record<string, unknown> | undefined;

    switch (block.type) {
      case 'text':
        // Text block — go to texts page
        if (settings?.['textBlockId']) {
          this.router.navigate(['/doc-constructor/texts']);
        }
        break;
      case 'table':
        // Table block — go to tables page
        if (settings?.['tableTemplateId']) {
          this.router.navigate(['/doc-constructor/tables']);
        }
        break;
      default:
        // Other types — scroll to inspector (already visible)
        break;
    }
  }

  protected onDeleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.size === 0) return;

    const previous = this.blocks();
    const toDelete = previous.filter((b) => ids.has(blockKey(b)));
    const remaining = previous.filter((b) => !ids.has(blockKey(b)));

    // Optimistic update
    this.blocks.set(remaining.map((b, i) => ({ ...b, order: i })));
    this.selectedIds.set(new Set());
    this.selectedId.set(null);

    const tid = this.templateId();
    if (!tid) return;

    const deleteOps = toDelete
      .filter((b) => b._id)
      .map((b) => ({ key: blockKey(b), obs: this.blocksSvc.remove(b._id!) }));

    if (deleteOps.length === 0) return;

    const safeOps = deleteOps.map(({ key, obs }) =>
      obs.pipe(
        catchError(() => of(null)),
        map((r) => ({ key, ok: r?.ok ?? false })),
      ),
    );

    forkJoin(safeOps).subscribe({
      next: (results) => {
        const failedKeys = new Set(
          results.filter((r) => !r.ok).map((r) => r.key),
        );
        const succeededCount = results.length - failedKeys.size;

        if (succeededCount > 0) {
          this.toast.success(`Удалено блоков: ${succeededCount}`);
        }
        if (failedKeys.size > 0) {
          this.toast.error(`Не удалось удалить ${failedKeys.size} блок(ов)`);
          const failedBlocks = toDelete.filter((b) => failedKeys.has(blockKey(b)));
          this.blocks.update((arr) =>
            [...arr, ...failedBlocks].map((b, i) => ({ ...b, order: i })),
          );
        }

        const currentIds = this.blocks().filter((b) => b._id).map((b) => b._id!);
        if (currentIds.length > 0) {
          this.blocksSvc.reorder(tid, { blockIds: currentIds }).subscribe();
        }
      },
      error: () => {
        this.toast.error('Ошибка при удалении блоков');
        this.blocks.set(previous);
      },
    });
  }

  protected onReorder(next: TemplateBlock[]): void {
    const reindexed = next.map((b, i) => ({ ...b, order: i }));
    const previous = this.blocks();
    this.blocks.set(reindexed);

    const tid = this.templateId();
    if (!tid) return;

    const ids = reindexed.filter((b) => b._id).map((b) => b._id!);
    this.blocksSvc
      .reorder(tid, { blockIds: ids })
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.toast.success('Порядок блоков сохранён');
          } else {
            this.toast.error(extractErrorMessage(res.error));
            this.blocks.set(previous); // rollback
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractErrorMessage(err));
          this.blocks.set(previous); // rollback
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // Inspector → update / delete
  // ─────────────────────────────────────────────────────────────
  protected onInspectorUpdate(patch: Partial<TemplateBlock> & { _id: string }): void {
    const { _id, ...rest } = patch;
    this.blocks.update((arr) =>
      arr.map((b) => (b._id === _id ? { ...b, ...rest } : b)),
    );
    this.save$.next({ _id, patch: rest });
  }

  protected onDeleteBlock(id: string): void {
    this.blocks.update((arr) => arr.filter((b) => b._id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
    this.blocksSvc.remove(id).subscribe({
      next: (res) => {
        if (res.ok) this.toast.success('Блок удалён');
        else {
          this.toast.error(extractErrorMessage(res.error));
          this.loadBlocks(this.templateId() ?? '');
        }
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractErrorMessage(err)),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Misc handlers
  // ─────────────────────────────────────────────────────────────
  /** TZ-87 B.2: Fetch first org + docType, then create template and navigate. */
  protected onCreateTemplate(): void {
    this.isCreating.set(true);
    const org$ = this.http.get<{ items: { _id: string }[] }>(`${this.baseUrl}/organizations?limit=1`);
    const dt$ = this.http.get<{ _id: string }[]>(`${this.baseUrl}/doc-types`);
    forkJoin([org$, dt$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: ([orgRes, dtRes]) => {
        const orgId = orgRes?.items?.[0]?._id;
        const docTypeId = dtRes?.[0]?._id;
        if (!orgId || !docTypeId) {
          this.toast.error('Не найдены организация или тип документа. Сначала создайте их.');
          this.isCreating.set(false);
          return;
        }
        this.doCreateTemplate(orgId, docTypeId);
      },
      error: (err) => {
        this.isCreating.set(false);
        this.toast.error('Ошибка загрузки: ' + extractErrorMessage(err));
      },
    });
  }

  /** Actually create the template with resolved refs. */
  private doCreateTemplate(orgId: string, docTypeId: string): void {
    this.templatesSvc
      .create({
        name: `Шаблон ${new Date().toLocaleDateString('ru-RU')}`,
        organizationId: orgId,
        docTypeId: docTypeId,
        pageSize: 'A4',
        isActive: true,
      })
      .subscribe({
        next: (res) => {
          this.isCreating.set(false);
          if (res.ok) {
            this.toast.success('Шаблон создан');
            this.router.navigate(['/doc-constructor/builder', res.data._id]);
          } else {
            this.toast.error(extractErrorMessage(res.error));
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreating.set(false);
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  protected onReload(): void {
    const tid = this.templateId();
    if (tid) this.loadBlocks(tid);
  }

  /**
   * Phase E.3: preserve ?source + ?sourceId query params when navigating
   * from the empty-state picker to a specific /builder/:id route.
   */
  protected onTemplatePick(value: string | null): void {
    if (!value) return;
    const ctx = this.sourceContext();
    if (ctx) {this.router.navigate(['/doc-constructor/builder', value], {
          queryParams: { source: ctx.source, sourceId: ctx.sourceId },
        });
    } else {
      this.router.navigate(['/doc-constructor/builder', value]);
    }
  }

  protected onDeleteTemplate(t: DocumentTemplate): void {
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить шаблон?',
        message: `«${t.name}» и все его блоки будут удалены.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.templatesSvc.remove(t._id).subscribe({
        next: (res) => {
          if (res.ok) {
            this.toast.success('Шаблон удалён');
            this.templateListRes.reload();
          } else {
            this.toast.error(extractErrorMessage(res.error));
          }
        },
      });
    });
  }

  /**
   * Auto-save result handler. Uses early-return on `!res.ok` so TypeScript
   * narrows the SilentResult<TemplateBlock> discriminated union to
   * `{ok: false, error: HttpErrorResponse}` before accessing `res.error`.
   * D.2.3: also updates `saveStatus` signal — 'saved' for 2s then 'idle',
   * or 'error' indefinitely.
   */
  private handleSaveResult(res: SilentResult<TemplateBlock>): void {
    if (!res.ok) {
      const code = res.error.status;
      if (code === 409) {
        this.toast.error('Конфликт: шаблон изменён другим пользователем');
      } else {
        this.toast.error(`Ошибка сохранения: ${extractErrorMessage(res.error)}`);
      }
      this.saveStatus.set('error');
      return;
    }
    this.blocks.update((arr) =>
      arr.map((b) => (b._id === res.data._id ? res.data : b)),
    );
    this.saveStatus.set('saved');
    // Monotonic-counter guard (see `savedTick` field JSDoc): only revert if
    // no newer save has started in the 2s window.
    const myTick = ++this.savedTick;
    timer(2000).subscribe(() => {
      if (myTick === this.savedTick) this.saveStatus.set('idle');
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Russian noun pluralization (1 блок, 2 блока, 5 блоков)
// ─────────────────────────────────────────────────────────────
function pluralBlocks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'блок';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'блока';
  return 'блоков';
}
