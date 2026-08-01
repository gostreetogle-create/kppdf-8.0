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
import {
  LucideAngularModule,
  FileText,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Table as TableIcon,
  Eye,
  Pencil,
  Image as ImageIcon,
} from 'lucide-angular';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { defaultBlockLayout } from '../../../shared/template-block/template-block-layout';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { PiPageHeaderComponent } from '../../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../../shared/page/pi-section.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  TemplateSetupDialogComponent,
  type TemplateSetupResult,
} from './template-setup-dialog.component';
import type { AddBlockPayload } from './builder.types';
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
    BuilderCanvasComponent,
    BuilderInspectorComponent,
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    @if (!templateId()) {
      <app-pi-page-header
        eyebrow="раздел · конструктор документов"
        title="Конструктор документов"
        [subtitle]="headerSubtitle()"
      />

      <app-pi-section
        title="Выберите шаблон"
        description="Список доступных шаблонов для редактирования"
      >
        <div slot="actions">
          <app-pi-button
            variant="default"
            size="sm"
            [disabled]="isCreating()"
            (click)="onCreateTemplate()"
            data-test="create-template-button-header"
          >
            <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
            {{ isCreating() ? 'Создание…' : 'Новый шаблон' }}
          </app-pi-button>
        </div>
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
                  <tr
                    class="pi-table-row pi-table-row-odd group cursor-pointer"
                    (click)="onTemplatePick(t._id)"
                  >
                    <td class="pi-cell font-medium">{{ t.name }}</td>
                    <td class="pi-cell text-right">
                      <div
                        class="flex items-center justify-end gap-2"
                        (click)="$event.stopPropagation()"
                      >
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
            </div>
          </div>
        }
      </app-pi-section>
    } @else {
      <!-- Builder toolbar — horizontal dropdowns for adding blocks -->
      <div class="builder-toolbar">
        <div class="builder-toolbar__title">
          <span class="text-xs text-muted-foreground">{{ headerSubtitle() }}</span>
        </div>

        <!-- TZ-211: View mode toggle -->
        <div class="builder-view-toggle">
          <button
            type="button"
            class="builder-view-toggle__btn"
            [class.builder-view-toggle__btn--active]="viewMode() === 'editor'"
            (click)="viewMode.set('editor')"
          >
            <lucide-icon [img]="EditIcon" [size]="13"></lucide-icon>
            Редактор
          </button>
          <button
            type="button"
            class="builder-view-toggle__btn"
            [class.builder-view-toggle__btn--active]="viewMode() === 'preview'"
            (click)="viewMode.set('preview')"
          >
            <lucide-icon [img]="EyeIcon" [size]="13"></lucide-icon>
            Превью
          </button>
        </div>

        <div class="builder-toolbar__actions">
          <!-- Тексты dropdown -->
          <div class="builder-dropdown">
            <button
              type="button"
              class="builder-dropdown__trigger"
              (click)="toggleDropdown('texts')"
            >
              <lucide-icon [img]="FileTextIcon" [size]="14"></lucide-icon>
              Тексты
            </button>
            @if (openDropdown() === 'texts') {
              <div class="builder-dropdown__panel">
                @if (textsRes.isLoading()) {
                  <p class="builder-dropdown__loading">Загрузка…</p>
                } @else if (textsRes.error()) {
                  <p class="builder-dropdown__error">Ошибка загрузки</p>
                } @else if (textsRes.value() && textsRes.value()!.length > 0) {
                  @for (t of textsRes.value(); track t._id) {
                    <button
                      type="button"
                      class="builder-dropdown__item"
                      (click)="onAddTextBlock(t); closeDropdown()"
                    >
                      <span class="builder-dropdown__item-label">{{ t.name }}</span>
                      @if (t.category) {
                        <span class="builder-dropdown__item-hint">{{ t.category }}</span>
                      }
                    </button>
                  }
                } @else {
                  <p class="builder-dropdown__empty">Нет текстов</p>
                }
              </div>
            }
          </div>

          <!-- Таблицы dropdown -->
          <div class="builder-dropdown">
            <button
              type="button"
              class="builder-dropdown__trigger"
              (click)="toggleDropdown('tables')"
            >
              <lucide-icon [img]="TableIcon" [size]="14"></lucide-icon>
              Таблицы
            </button>
            @if (openDropdown() === 'tables') {
              <div class="builder-dropdown__panel">
                @if (tablesRes.isLoading()) {
                  <p class="builder-dropdown__loading">Загрузка…</p>
                } @else if (tablesRes.error()) {
                  <p class="builder-dropdown__error">Ошибка загрузки</p>
                } @else if (tablesRes.value() && tablesRes.value()!.length > 0) {
                  @for (t of tablesRes.value(); track t._id) {
                    <button
                      type="button"
                      class="builder-dropdown__item"
                      (click)="onAddTableTemplate(t); closeDropdown()"
                    >
                      <span class="builder-dropdown__item-label">{{ t.name }}</span>
                      @if (t.description) {
                        <span class="builder-dropdown__item-hint">{{ t.description }}</span>
                      }
                    </button>
                  }
                } @else {
                  <p class="builder-dropdown__empty">Нет таблиц</p>
                }
              </div>
            }
          </div>

          <!-- Фото button (file picker) -->
          <div class="builder-dropdown">
            <button type="button" class="builder-toolbar__btn" (click)="photoInput.click()">
              <lucide-icon [img]="ImageIcon" [size]="14"></lucide-icon>
              Фото
            </button>
            <input
              #photoInput
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="sr-only"
              (change)="onPhotoFileSelected($event)"
            />
          </div>

          <!-- Отступ button -->
          <button type="button" class="builder-toolbar__btn" (click)="onAddSpacer()">
            — Отступ
          </button>
        </div>
      </div>

      <!-- Main builder area: canvas + inspector -->
      <div class="builder-shell">
        <app-builder-canvas
          [blocks]="blocks()"
          [selectedId]="selectedId()"
          [selectedIds]="selectedIds()"
          [backgroundImages]="backgroundImages()"
          [orientation]="orientation()"
          [backgroundOpacity]="template()?.backgroundOpacity ?? 0.3"
          [headerText]="template()?.headerText ?? ''"
          [footerText]="template()?.footerText ?? ''"
          [pageNumbering]="template()?.pageNumbering ?? false"
          [pageSize]="template()?.pageSize ?? 'A4'"
          [snapEnabled]="snapEnabled()"
          [gridSize]="gridSize()"
          [boundaryPadding]="boundaryPadding()"
          [viewMode]="viewMode()"
          (select)="onSelect($event)"
          (multiSelect)="onMultiSelect($event)"
          (reorder)="onReorder($event)"
          (dropAdd)="onDropAdd($event)"
          (blockWidthChange)="onBlockWidthChange($event)"
          (overlayMove)="onOverlayMove($event)"
          (overlayResize)="onOverlayResize($event)"
          (layoutChanges)="onLayoutChanges($event)"
          (canvasClick)="onCanvasClick()"
          (deleteRequest)="onDeleteBlock($event)"
        />

        <div class="builder-inspector-panel">
          <app-builder-inspector
            [block]="selectedBlock()"
            [selectedCount]="selectedIds().size"
            [selectedBlocks]="selectedBlocks()"
            [paperWidth]="orientation() === 'landscape' ? 900 : 720"
            [paperHeight]="orientation() === 'landscape' ? 636 : 1018"
            [templateSelected]="templateSelected()"
            [template]="template()"
            [allBlocks]="blocks()"
            [snapEnabled]="snapEnabled()"
            [gridSize]="gridSize()"
            [boundaryPadding]="boundaryPadding()"
            (snapSettingsChange)="onSnapSettingsChange($event)"
            (update)="onInspectorUpdate($event)"
            (delete)="onDeleteBlock($event)"
            (deleteSelected)="onDeleteSelected()"
            (editSelected)="onEditSelected()"
            (marginReset)="onMarginReset($event)"
            (multiMarginUpdate)="onMultiMarginUpdate($event)"
            (templateUpdate)="onTemplateUpdate($event)"
            (uploadBackground)="onBackgroundUpload($event)"
            (removeBackground)="onRemoveBackground($event)"
            (setDefaultBackground)="onSetDefaultBackground($event)"
            (closePanel)="onCloseInspectorPanel()"
          />
        </div>
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

      /* ═══ Builder toolbar — TZ-211: Design System ═══ */
      .builder-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 12px;
        border-bottom: 1px solid var(--color-rule);
        background: var(--color-paper-2);
      }

      .builder-toolbar__title {
        flex-shrink: 0;
      }

      .builder-toolbar__actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
      }

      .builder-toolbar__btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
        white-space: nowrap;
      }

      .builder-toolbar__btn:hover {
        background: var(--color-paper-3);
        border-color: var(--color-ink);
      }

      /* ═══ Dropdown — TZ-211: Design System ═══ */
      .builder-dropdown {
        position: relative;
      }

      .builder-dropdown__trigger {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
        white-space: nowrap;
      }

      .builder-dropdown__trigger:hover {
        background: var(--color-paper-3);
        border-color: var(--color-ink);
      }

      .builder-dropdown__panel {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 100;
        min-width: 220px;
        max-height: 320px;
        overflow-y: auto;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        margin-top: 2px;
        box-shadow: var(--shadow-executive);
      }

      .builder-dropdown__item {
        display: flex;
        flex-direction: column;
        gap: 1px;
        width: 100%;
        padding: 6px 12px;
        text-align: left;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: background 100ms ease;
      }

      .builder-dropdown__item:hover {
        background: var(--color-paper-3);
      }

      .builder-dropdown__item-label {
        font-size: 12px;
        color: var(--color-ink);
      }

      .builder-dropdown__item-hint {
        font-size: 10px;
        color: var(--color-muted);
      }

      .builder-dropdown__loading,
      .builder-dropdown__error,
      .builder-dropdown__empty {
        padding: 8px 12px;
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
      }

      .builder-dropdown__error {
        color: var(--color-destructive);
      }

      /* ═══ View Mode Toggle — TZ-211 ═══ */
      .builder-view-toggle {
        display: flex;
        align-items: center;
        gap: 0;
        background: var(--color-paper-3);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        padding: 1px;
      }

      .builder-view-toggle__btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 500;
        font-family: var(--font-mono);
        color: var(--color-muted);
        background: transparent;
        border: none;
        border-radius: 1px;
        cursor: pointer;
        transition: all 100ms ease;
        white-space: nowrap;
      }

      .builder-view-toggle__btn:hover {
        color: var(--color-ink);
      }

      .builder-view-toggle__btn--active {
        background: var(--color-paper);
        color: var(--color-ink);
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }

      /* ═══ Inspector Panel — TZ-211: Design System ═══ */
      .builder-inspector-panel {
        width: 320px;
        flex-shrink: 0;
        background: var(--color-paper-2);
        border-left: 1px solid var(--color-rule);
        overflow-y: auto;
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
  protected readonly TableIcon = TableIcon;
  protected readonly EyeIcon = Eye;
  protected readonly EditIcon = Pencil;
  protected readonly ImageIcon = ImageIcon;

  // State
  protected readonly templateId = signal<string | null>(null);
  protected readonly template = signal<DocumentTemplate | null>(null);
  protected readonly blocks = signal<TemplateBlock[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isCreating = signal<boolean>(false);
  protected readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  /** When true, inspector shows template properties instead of block properties */
  protected readonly templateSelected = signal<boolean>(false);
  /** TZ-211: View mode toggle — 'editor' | 'preview' */
  protected readonly viewMode = signal<'editor' | 'preview'>('editor');
  /** Snap-to-grid enabled for overlay blocks (persisted to localStorage). */
  protected readonly snapEnabled = signal<boolean>(loadSnapSettings().snapEnabled);
  /** Grid size for snapping (px) (persisted to localStorage). */
  protected readonly gridSize = signal<number>(loadSnapSettings().gridSize);
  /** Padding from paper edges that overlay blocks cannot cross (px) (persisted to localStorage). */
  protected readonly boundaryPadding = signal<number>(loadSnapSettings().boundaryPadding);

  // Dropdown state for inline toolbar
  protected readonly openDropdown = signal<string | null>(null);

  // httpResources for inline toolbar dropdowns
  protected readonly textsRes = httpResource<
    Array<{ _id: string; name: string; category?: string; content?: string; columns?: unknown[] }>
  >(() => '/api/text-blocks?isActive=true', { defaultValue: [] });
  protected readonly tablesRes = httpResource<
    Array<{
      _id: string;
      name: string;
      description?: string;
      columns?: unknown[];
      sampleRows?: unknown[][];
    }>
  >(() => '/api/table-templates?isActive=true', { defaultValue: [] });

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

  // All selected blocks (for multi-select margin controls)
  protected readonly selectedBlocks = computed<TemplateBlock[]>(() => {
    const ids = this.selectedIds();
    if (ids.size === 0) return [];
    return this.blocks().filter((b) => ids.has(blockKey(b)));
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
    return this.template()?.orientation ?? 'portrait';
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
            switchMap(({ _id, patch }) => this.blocksSvc.update(_id, patch)),
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
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((qp) => {
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
          this.template.update((t) =>
            t ? { ...t, backgroundImage: res.data.backgroundImage } : t,
          );
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
            let defIdx = t.defaultBackgroundIndex ?? -1;
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
          this.template.update((t) => (t ? { ...t, defaultBackgroundIndex: index } : t));
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
          this.template.update((t) => (t ? { ...t, orientation } : t));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
    });
  }

  protected onSetOpacity(opacity: number): void {
    this.template.update((t) => (t ? { ...t, backgroundOpacity: opacity } : t));
    const tid = this.templateId();
    if (tid) {
      this.templatesSvc.update(tid, { backgroundOpacity: opacity }).subscribe();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Inline toolbar dropdown handlers
  // ─────────────────────────────────────────────────────────────
  protected toggleDropdown(name: string): void {
    this.openDropdown.update((current) => (current === name ? null : name));
  }

  protected closeDropdown(): void {
    this.openDropdown.set(null);
  }

  // ──────────────────────────────────────────────────────────────────────────────────────────────────
  // Dropdown закрытие при клике вне dropdown (TZ-170 §4.1)
  // HostListener('document:click') - Dropdown открывается только пока триггер в @Component template.
  // Stope propagation на dropdown контейнере, чтобы click через dropdown panel не закрывал его.
  // ─────────────────────────────────────────────────────────────
  onDocumentClick(event: MouseEvent): void {
    if (this.openDropdown() === null) return;
    const target = event.target as HTMLElement;
    if (target.closest('.builder-dropdown')) return;
    this.openDropdown.set(null);
  }

  protected onAddTextBlock(t: {
    _id: string;
    name: string;
    content?: string;
    columns?: unknown[];
  }): void {
    this.onAddBlock({
      source: 'text-block',
      textBlock: t as import('../../../shared/services/pi-text-blocks.service').TextBlock,
    });
  }

  protected onAddTableTemplate(t: {
    _id: string;
    name: string;
    columns?: unknown[];
    sampleRows?: unknown[][];
  }): void {
    this.onAddBlock({
      source: 'table-template',
      tableTemplate:
        t as import('../../../shared/services/pi-table-templates.service').TableTemplate,
    });
  }

  protected onAddSpacer(): void {
    this.onAddBlock({ source: 'block-type', type: 'spacer' });
  }

  protected onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    // Create an image block with a local preview URL (will be replaced after upload)
    const tempId = crypto.randomUUID();
    const block: TemplateBlock = {
      tempId,
      templateId: this.templateId()!,
      order: this.blocks().length,
      type: 'image',
      title: file.name.replace(/\.[^.]+$/, ''),
      content: '',
      isActive: true,
      showLine: false,
      dataBinding: null,
      layout: defaultBlockLayout(this.blocks().length),
      settings: { imageUrl: localUrl, overlay: true },
    };
    this.insertNewBlock(block, file);
    input.value = '';
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

  /** Insert a pre-built block (used by photo upload). If `file` is provided,
   *  uploads it to the server after block creation and patches the imageUrl. */
  private insertNewBlock(newBlock: TemplateBlock, file?: File): void {
    const tid = this.templateId();
    if (!tid) return;
    this.blocks.update((arr) => [...arr, newBlock]);
    this.selectedId.set(blockKey(newBlock));

    this.blocksSvc
      .add(tid, {
        type: newBlock.type,
        order: newBlock.order,
        ...(newBlock.title ? { title: newBlock.title } : {}),
        ...(newBlock.content ? { content: newBlock.content } : {}),
        ...(newBlock.height ? { height: newBlock.height } : {}),
        showLine: newBlock.showLine,
        ...(newBlock.settings ? { settings: newBlock.settings } : {}),
        ...(newBlock.dataBinding ? { dataBinding: newBlock.dataBinding } : {}),
        ...(newBlock.layout ? { layout: newBlock.layout } : {}),
        ...(newBlock.source ? { source: newBlock.source } : {}),
        isActive: newBlock.isActive,
      })
      .subscribe({
        next: (res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== newBlock.tempId));
            return;
          }
          this.blocks.update((arr) =>
            arr.map((b) => (b.tempId === newBlock.tempId ? res.data : b)),
          );
          this.selectedId.set(res.data._id ?? null);

          // Upload file to server if provided (e.g. photo upload)
          if (file && res.data._id) {
            this.blocksSvc.uploadImage(res.data._id, file).subscribe({
              next: (uploadRes) => {
                if (uploadRes.ok) {
                  this.blocks.update((arr) =>
                    arr.map((b) =>
                      b._id === res.data._id
                        ? {
                            ...b,
                            settings: { ...(b.settings ?? {}), imageUrl: uploadRes.data.url },
                          }
                        : b,
                    ),
                  );
                } else {
                  this.toast.error(extractErrorMessage(uploadRes.error));
                }
              },
              error: () => {
                this.toast.error('Не удалось загрузить изображение на сервер');
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
        ...(newBlock.layout ? { layout: newBlock.layout } : {}),
        ...(newBlock.source ? { source: newBlock.source } : {}),
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
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'duplicate' },
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.http
        .post<DocumentTemplate>(`${this.baseUrl}/document-templates/${t._id}/duplicate`, {})
        .subscribe({
          next: (copy) => {
            // Apply chosen format/orientation to the duplicate
            this.templatesSvc
              .update(copy._id, {
                pageSize: result.pageSize,
                orientation: result.orientation,
              })
              .subscribe({
                next: () => {
                  this.toast.success('Копия шаблона создана');
                  this.templateListRes.reload();
                },
                error: () => {
                  this.toast.success('Копия шаблона создана');
                  this.templateListRes.reload();
                },
              });
          },
          error: (err: HttpErrorResponse) => {
            this.toast.error(extractErrorMessage(err));
          },
        });
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
      layout: defaultBlockLayout(order),
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
          content: payload.textBlock.content ?? '',
          columns: payload.textBlock.columns?.map((c) => ({
            id: c.id,
            content: c.content ?? '',
            width: c.width ?? 1,
            fontSize: c.fontSize ?? 14,
          })),
          source: {
            kind: 'text-block',
            refId: payload.textBlock._id,
            mode: 'live',
          },
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
          source: {
            kind: 'table-template',
            refId: payload.tableTemplate._id,
            mode: 'live',
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
    this.templateSelected.set(false);
  }

  protected onMultiSelect(block: TemplateBlock): void {
    const key = blockKey(block);
    const ids = new Set(this.selectedIds());
    // Preserve the current single selection when the user starts a
    // Ctrl/Cmd group selection, then toggle the clicked block.
    const currentId = this.selectedId();
    if (currentId && ids.size === 0) ids.add(currentId);
    if (ids.has(key)) {
      ids.delete(key);
    } else {
      ids.add(key);
    }
    this.selectedIds.set(ids);
    this.selectedId.set(null);
    this.templateSelected.set(ids.size === 0);
  }

  protected onCanvasClick(): void {
    // Always clear block selection and show template properties
    this.selectedId.set(null);
    this.selectedIds.set(new Set());
    this.templateSelected.set(true);
  }

  protected onEditSelected(): void {
    const block = this.selectedBlock();
    if (!block) return;

    switch (block.type) {
      case 'text': {
        const textBlockId =
          block.source?.kind === 'text-block' ? block.source.refId : block.dataBinding?.value;
        if (textBlockId) {
          this.router.navigate(['/doc-constructor/texts'], {
            queryParams: { editId: textBlockId },
          });
        } else {
          this.router.navigate(['/doc-constructor/texts']);
        }
        break;
      }
      case 'table':
        // Table block — navigate to tables page for editing
        this.router.navigate(['/doc-constructor/tables']);
        break;
      default:
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
        const failedKeys = new Set(results.filter((r) => !r.ok).map((r) => r.key));
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

        const currentIds = this.blocks()
          .filter((b) => b._id)
          .map((b) => b._id!);
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
    this.blocksSvc.reorder(tid, { blockIds: ids }).subscribe({
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
    this.blocks.update((arr) => arr.map((b) => (b._id === _id ? { ...b, ...rest } : b)));
    this.save$.next({ _id, patch: rest });
  }

  protected onBlockWidthChange(event: {
    block: TemplateBlock;
    width: number;
    marginLeft: number;
    imageWidth?: number;
    imageHeight?: number;
  }): void {
    const { block, width, marginLeft, imageWidth, imageHeight } = event;
    if (!block._id) return;
    const settings: Record<string, unknown> = {
      ...(block.settings as Record<string, unknown> | undefined),
      width,
      marginLeft,
    };
    if (imageWidth !== undefined) settings['imageWidth'] = imageWidth;
    if (imageHeight !== undefined) settings['imageHeight'] = imageHeight;
    this.blocks.update((arr) => arr.map((b) => (b._id === block._id ? { ...b, settings } : b)));
    this.save$.next({ _id: block._id, patch: { settings } });
  }

  /** Persist single/group canonical layout changes as one atomic server update. */
  protected onLayoutChanges(
    changes: Array<{
      _id?: string;
      block: TemplateBlock;
      layout: NonNullable<TemplateBlock['layout']>;
    }>,
  ): void {
    const tid = this.templateId();
    if (!tid || changes.length === 0) return;

    const updates = changes
      .map((change) => ({ blockId: change._id ?? change.block._id, layout: change.layout }))
      .filter(
        (update): update is { blockId: string; layout: NonNullable<TemplateBlock['layout']> } =>
          !!update.blockId,
      );
    if (updates.length === 0) return;

    const previous = this.blocks();
    const nextById = new Map(updates.map((update) => [update.blockId, update.layout]));
    this.blocks.update((arr) =>
      arr.map((block) => {
        const layout = block._id ? nextById.get(block._id) : undefined;
        return layout ? { ...block, layout } : block;
      }),
    );
    this.saveStatus.set('saving');

    this.blocksSvc.updateLayouts(tid, updates).subscribe({
      next: (res) => {
        if (res.ok) {
          if (res.data) this.blocks.set(res.data);
          this.saveStatus.set('saved');
          const myTick = ++this.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.savedTick) this.saveStatus.set('idle');
          });
          return;
        }
        this.blocks.set(previous);
        this.saveStatus.set('error');
        this.toast.error(extractErrorMessage(res.error));
      },
      error: (err: HttpErrorResponse) => {
        this.blocks.set(previous);
        this.saveStatus.set('error');
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  /** Handle overlay block position change (drag). */
  protected onOverlayMove(event: {
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }): void {
    const { block, overlayLeft, overlayTop } = event;
    if (!block._id) return;
    const settings: Record<string, unknown> = {
      ...(block.settings as Record<string, unknown> | undefined),
      overlayLeft,
      overlayTop,
    };
    this.blocks.update((arr) => arr.map((b) => (b._id === block._id ? { ...b, settings } : b)));
    this.save$.next({ _id: block._id, patch: { settings } });
  }

  /** Handle overlay image proportional resize (corner handle). */
  protected onOverlayResize(event: {
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }): void {
    const { block, imageWidth, imageHeight } = event;
    if (!block._id) return;
    const settings: Record<string, unknown> = {
      ...(block.settings as Record<string, unknown> | undefined),
      imageWidth,
      imageHeight,
    };
    this.blocks.update((arr) => arr.map((b) => (b._id === block._id ? { ...b, settings } : b)));
    this.save$.next({ _id: block._id, patch: { settings } });
  }

  protected onMarginReset(blockId: string): void {
    const settings = { width: 100, marginLeft: 0 };
    this.blocks.update((arr) => arr.map((b) => (b._id === blockId ? { ...b, settings } : b)));
    this.save$.next({ _id: blockId, patch: { settings } });
  }

  protected onMultiMarginUpdate(
    updates: Array<{ _id: string; settings: Record<string, unknown> }>,
  ): void {
    for (const { _id, settings } of updates) {
      this.blocks.update((arr) => arr.map((b) => (b._id === _id ? { ...b, settings } : b)));
      this.save$.next({ _id, patch: { settings } });
    }
  }

  protected onTemplateUpdate(patch: Partial<DocumentTemplate>): void {
    const tid = this.templateId();
    if (!tid) return;
    // Optimistic local update for instant visual feedback
    this.template.update((t) => (t ? { ...t, ...patch } : t));
    this.templatesSvc.update(tid, patch).subscribe({
      next: (res) => {
        if (!res.ok) {
          // Revert on failure — reload from server
          this.templatesSvc.findById(tid).subscribe({
            next: (tRes) => {
              if (tRes.ok) this.template.set(tRes.data);
            },
          });
        }
      },
      error: () => {
        this.templatesSvc.findById(tid).subscribe({
          next: (tRes) => {
            if (tRes.ok) this.template.set(tRes.data);
          },
        });
      },
    });
  }

  protected onCloseInspectorPanel(): void {
    this.templateSelected.set(false);
    this.selectedId.set(null);
  }

  protected onDeleteBlock(id: string): void {
    const block = this.blocks().find((b) => b._id === id);
    const blockTitle = block?.title || block?.type || 'блок';
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить блок?',
        description: `«${blockTitle}» будет удалён. Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
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
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Misc handlers
  // ─────────────────────────────────────────────────────────────
  /** TZ-87 B.2: Fetch first org + docType, then create template and navigate. */
  protected onCreateTemplate(): void {
    const ref = this.dialog.open<TemplateSetupResult>(TemplateSetupDialogComponent, {
      data: { mode: 'create' },
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.isCreating.set(true);
      const org$ = this.http.get<{ items: { _id: string }[] }>(
        `${this.baseUrl}/organizations?limit=1`,
      );
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
            this.doCreateTemplate(orgId, docTypeId, result);
          },
          error: (err) => {
            this.isCreating.set(false);
            this.toast.error('Ошибка загрузки: ' + extractErrorMessage(err));
          },
        });
    });
  }

  /** Actually create the template with resolved refs. */
  private doCreateTemplate(orgId: string, docTypeId: string, settings: TemplateSetupResult): void {
    this.templatesSvc
      .create({
        name: `Шаблон ${new Date().toLocaleDateString('ru-RU')}`,
        organizationId: orgId,
        docTypeId: docTypeId,
        pageSize: settings.pageSize,
        orientation: settings.orientation,
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

  /** Handle snap settings changes from the inspector (persisted to localStorage). */
  protected onSnapSettingsChange(settings: {
    snapEnabled: boolean;
    gridSize: number;
    boundaryPadding?: number;
  }): void {
    this.snapEnabled.set(settings.snapEnabled);
    this.gridSize.set(settings.gridSize);
    if (settings.boundaryPadding !== undefined) {
      this.boundaryPadding.set(settings.boundaryPadding);
    }
    saveSnapSettings({
      snapEnabled: settings.snapEnabled,
      gridSize: settings.gridSize,
      boundaryPadding: settings.boundaryPadding ?? this.boundaryPadding(),
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
    if (ctx) {
      this.router.navigate(['/doc-constructor/builder', value], {
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
        description: `«${t.name}» и все его блоки будут удалены.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (!ok) return;
      this.templatesSvc.remove(t._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Шаблон удалён');
          this.templateListRes.reload();
        } else {
          this.toast.error(
            extractErrorMessage(res.error as import('@angular/common/http').HttpErrorResponse),
          );
        }
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
    this.blocks.update((arr) => arr.map((b) => (b._id === res.data._id ? res.data : b)));
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

// ─────────────────────────────────────────────────────────────
// localStorage persistence for overlay positioning settings
// ─────────────────────────────────────────────────────────────
const SNAP_STORAGE_KEY = 'pi-builder-snap-settings';

interface SnapSettings {
  snapEnabled: boolean;
  gridSize: number;
  boundaryPadding: number;
}

const DEFAULT_SNAP: SnapSettings = {
  snapEnabled: true,
  gridSize: 20,
  boundaryPadding: 8,
};

function loadSnapSettings(): SnapSettings {
  try {
    const raw = localStorage.getItem(SNAP_STORAGE_KEY);
    if (!raw) return DEFAULT_SNAP;
    const parsed = JSON.parse(raw) as Partial<SnapSettings>;
    return {
      snapEnabled:
        typeof parsed.snapEnabled === 'boolean' ? parsed.snapEnabled : DEFAULT_SNAP.snapEnabled,
      gridSize:
        typeof parsed.gridSize === 'number' && parsed.gridSize >= 5 && parsed.gridSize <= 50
          ? parsed.gridSize
          : DEFAULT_SNAP.gridSize,
      boundaryPadding:
        typeof parsed.boundaryPadding === 'number' && parsed.boundaryPadding >= 0
          ? parsed.boundaryPadding
          : DEFAULT_SNAP.boundaryPadding,
    };
  } catch {
    return DEFAULT_SNAP;
  }
}

function saveSnapSettings(settings: SnapSettings): void {
  try {
    localStorage.setItem(SNAP_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}
