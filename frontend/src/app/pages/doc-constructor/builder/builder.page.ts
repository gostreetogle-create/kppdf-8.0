import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { debounceTime, forkJoin, groupBy, mergeMap, switchMap, tap, timer } from 'rxjs';
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
// TextBlocksService + TableTemplatesService + AddBlockPayload moved to
// BuilderStateService (no longer used directly in page.ts).
import { API_BASE_URL } from '../../../core/api.tokens';
import { extractErrorMessage } from '../../../core/silent-http';
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

import { BuilderStateService } from './builder-state.service';
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
  providers: [BuilderStateService],
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
    @if (!state.templateId()) {
      <app-pi-page-header
        eyebrow="раздел · конструктор документов"
        title="Конструктор документов"
        [subtitle]="state.headerSubtitle()"
      />

      <app-pi-section
        title="Выберите шаблон"
        description="Список доступных шаблонов для редактирования"
      >
        <div slot="actions">
          <app-pi-button
            variant="default"
            size="sm"
            [disabled]="state.isCreating()"
            (click)="onCreateTemplate()"
            data-test="create-template-button-header"
          >
            <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
            {{ state.isCreating() ? 'Создание…' : 'Новый шаблон' }}
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
                    (click)="state.onTemplatePick(t._id)"
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
                          (click)="state.onTemplatePick(t._id)"
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
                [disabled]="state.isCreating()"
                (click)="onCreateTemplate()"
                data-test="create-template-button"
              >
                <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                {{ state.isCreating() ? 'Создание…' : '+ Создать шаблон' }}
              </app-pi-button>
            </div>
          </div>
        }
      </app-pi-section>
    } @else {
      <!-- Builder toolbar — horizontal dropdowns for adding blocks -->
      <div class="builder-toolbar">
        <div class="builder-toolbar__title">
          <span class="text-xs text-muted-foreground">{{ state.headerSubtitle() }}</span>
        </div>

        <!-- TZ-211: View mode toggle -->
        <div class="builder-view-toggle">
          <button
            type="button"
            class="builder-view-toggle__btn"
            [class.builder-view-toggle__btn--active]="state.viewMode() === 'editor'"
            (click)="state.viewMode.set('editor')"
          >
            <lucide-icon [img]="EditIcon" [size]="13"></lucide-icon>
            Редактор
          </button>
          <button
            type="button"
            class="builder-view-toggle__btn"
            [class.builder-view-toggle__btn--active]="state.viewMode() === 'preview'"
            (click)="state.viewMode.set('preview')"
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
              (click)="state.toggleDropdown('texts')"
            >
              <lucide-icon [img]="FileTextIcon" [size]="14"></lucide-icon>
              Тексты
            </button>
            @if (state.openDropdown() === 'texts') {
              <div class="builder-dropdown__panel">
                @if (state.textsRes.isLoading()) {
                  <p class="builder-dropdown__loading">Загрузка…</p>
                } @else if (state.textsRes.error()) {
                  <p class="builder-dropdown__error">Ошибка загрузки</p>
                } @else if ((state.textsRes.value() ?? []).length > 0) {
                  @for (t of state.textsRes.value(); track t._id) {
                    <button
                      type="button"
                      class="builder-dropdown__item"
                      (click)="state.onAddTextBlock(t); state.closeDropdown()"
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
              (click)="state.toggleDropdown('tables')"
            >
              <lucide-icon [img]="TableIcon" [size]="14"></lucide-icon>
              Таблицы
            </button>
            @if (state.openDropdown() === 'tables') {
              <div class="builder-dropdown__panel">
                @if (state.tablesRes.isLoading()) {
                  <p class="builder-dropdown__loading">Загрузка…</p>
                } @else if (state.tablesRes.error()) {
                  <p class="builder-dropdown__error">Ошибка загрузки</p>
                } @else if ((state.tablesRes.value() ?? []).length > 0) {
                  @for (t of state.tablesRes.value(); track t._id) {
                    <button
                      type="button"
                      class="builder-dropdown__item"
                      (click)="state.onAddTableTemplate(t); state.closeDropdown()"
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
              (change)="state.onPhotoFileSelected($event)"
            />
          </div>

          <!-- Отступ button -->
          <button type="button" class="builder-toolbar__btn" (click)="state.onAddSpacer()">
            — Отступ
          </button>
        </div>
      </div>

      <!-- Main builder area: canvas + inspector -->
      <div class="builder-shell">
        <app-builder-canvas
          [blocks]="state.blocks()"
          [selectedId]="state.selectedId()"
          [selectedIds]="state.selectedIds()"
          [backgroundImages]="state.backgroundImages()"
          [orientation]="state.orientation()"
          [backgroundOpacity]="state.template()?.backgroundOpacity ?? 0.3"
          [headerText]="state.template()?.headerText ?? ''"
          [footerText]="state.template()?.footerText ?? ''"
          [pageNumbering]="state.template()?.pageNumbering ?? false"
          [pageSize]="state.template()?.pageSize ?? 'A4'"
          [snapEnabled]="state.snapEnabled()"
          [gridSize]="state.gridSize()"
          [boundaryPadding]="state.boundaryPadding()"
          (select)="state.onSelect($event)"
          (multiSelect)="state.onMultiSelect($event)"
          (reorder)="state.onReorder($event)"
          (dropAdd)="state.onDropAdd($event)"
          (blockWidthChange)="state.onBlockWidthChange($event)"
          (overlayMove)="state.onOverlayMove($event)"
          (overlayResize)="state.onOverlayResize($event)"
          (positionedGeometryChange)="state.onPositionedGeometryChange($event)"
          (canvasClick)="state.onCanvasClick()"
          (deleteRequest)="onDeleteBlock($event)"
        />

        <div class="builder-inspector-panel">
          <app-builder-inspector
            [block]="state.selectedBlock()"
            [selectedCount]="state.selectedIds().size"
            [selectedBlocks]="state.selectedBlocks()"
            [paperWidth]="state.orientation() === 'landscape' ? 900 : 720"
            [templateSelected]="state.templateSelected()"
            [template]="state.template()"
            [allBlocks]="state.blocks()"
            [snapEnabled]="state.snapEnabled()"
            [gridSize]="state.gridSize()"
            [boundaryPadding]="state.boundaryPadding()"
            (snapSettingsChange)="state.onSnapSettingsChange($event)"
            (update)="state.onInspectorUpdate($event)"
            (delete)="onDeleteBlock($event)"
            (deleteSelected)="state.onDeleteSelected()"
            (editSelected)="state.onEditSelected()"
            (marginReset)="state.onMarginReset($event)"
            (multiMarginUpdate)="state.onMultiMarginUpdate($event)"
            (templateUpdate)="onTemplateUpdate($event)"
            (uploadBackground)="onBackgroundUpload($event)"
            (removeBackground)="onRemoveBackground($event)"
            (setDefaultBackground)="onSetDefaultBackground($event)"
            (closePanel)="state.onCloseInspectorPanel()"
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
  protected readonly state = inject(BuilderStateService);
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
    // TZ-235.A Round 2.5: subscribe to public saveEvents$ (Subject itself is private).
    this.state.saveEvents$
      .pipe(
        tap(() => this.state.saveStatus.set('saving')),
        groupBy((p) => p._id),
        mergeMap((group$) =>
          group$.pipe(
            debounceTime(1500),
            switchMap(({ _id, patch }) => this.blocksSvc.update(_id, patch)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => this.state.handleSaveResult(res));

    // 2) Watch route param :id + query params (Phase E.3: ?source + ?sourceId).
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.state.templateId.set(id);
      this.state.blocks.set([]);
      this.state.template.set(null);
      this.state.selectedId.set(null);
      this.state.saveStatus.set('idle');
      if (id) this.state.loadBlocks(id);
    });

    // Phase E.3: read ?source + ?sourceId query params (preserved across
    // template-pick navigation). Logged for future use; binding logic is
    // out of scope until the doc-template service supports pre-binding.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((qp) => {
      const source = qp.get('source');
      const sourceId = qp.get('sourceId');
      if (source && sourceId) {
        this.state.sourceContext.set({ source, sourceId });
      } else {
        this.state.sourceContext.set(null);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Initial load (state.loadBlocks) + text-block source sync
  // (state.syncTextBlockSources, private to service) are owned by
  // BuilderStateService.
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // D.2.1: Background upload
  // ─────────────────────────────────────────────────────────────
  protected onBackgroundUpload(file: File): void {
    const tid = this.state.templateId();
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
    this.state.saveStatus.set('saving');
    this.templatesSvc.uploadBackground(tid, file).subscribe({
      next: (res) => {
        if (res.ok) {
          this.state.template.update((t) =>
            t ? { ...t, backgroundImage: res.data.backgroundImage } : t,
          );
          this.toast.success('Фон загружен');
          this.state.saveStatus.set('saved');
          const myTick = ++this.state.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.state.savedTick) this.state.saveStatus.set('idle');
          });
        } else {
          this.toast.error(extractErrorMessage(res.error));
          this.state.saveStatus.set('error');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractErrorMessage(err));
        this.state.saveStatus.set('error');
      },
    });
  }

  protected onRemoveBackground(index: number): void {
    const tid = this.state.templateId();
    if (!tid) return;
    this.templatesSvc.removeBackground(tid, index).subscribe({
      next: (res) => {
        if (res.ok) {
          this.state.template.update((t) => {
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
    const tid = this.state.templateId();
    if (!tid) return;
    this.templatesSvc.setDefaultBackground(tid, index).subscribe({
      next: (res) => {
        if (res.ok) {
          this.state.template.update((t) => (t ? { ...t, defaultBackgroundIndex: index } : t));
          this.toast.success(index >= 0 ? 'Фон по умолчанию установлен' : 'Показывать все фоны');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Inline toolbar dropdown handlers are owned by BuilderStateService.
  // Page only owns the `document:click` host listener (close-on-outside-click).
  // ─────────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────────────────────────────────────────────
  // Dropdown закрытие при клике вне dropdown (TZ-170 §4.1)
  // HostListener('document:click') - Dropdown открывается только пока триггер в @Component template.
  // Stope propagation на dropdown контейнере, чтобы click через dropdown panel не закрывал его.
  // ─────────────────────────────────────────────────────────────
  onDocumentClick(event: MouseEvent): void {
    if (this.state.openDropdown() === null) return;
    const target = event.target as HTMLElement;
    if (target.closest('.builder-dropdown')) return;
    this.state.openDropdown.set(null);
  }

  // ─────────────────────────────────────────────────────────────
  // Toolbar block creation handlers are owned by BuilderStateService:
  //   state.onAddTextBlock(t), state.onAddTableTemplate(t),
  //   state.onAddSpacer(), state.onPhotoFileSelected(event).
  // ─────────────────────────────────────────────────────────────

  // Block insertion logic moved to BuilderStateService:
  //   state.insertBlock(payload, insertIndex)
  //   state.insertNewBlock(newBlock, file?)
  //   state.buildBlockFromPayload (private to service)

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

  // ─────────────────────────────────────────────────────────────
  // Canvas selection / reorder / edit / delete handlers are owned by
  // BuilderStateService. Page only owns template-level CRUD and Dialog UI.
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // Inspector update handlers (onInspectorUpdate / onBlockWidthChange /
  // onOverlayMove / onOverlayResize / onPositionedGeometryChange /
  // onMarginReset / onMultiMarginUpdate)
  // are owned by BuilderStateService. Page only owns template-level
  // (onTemplateUpdate) and Dialog UI handlers.
  // ─────────────────────────────────────────────────────────────

  protected onTemplateUpdate(patch: Partial<DocumentTemplate>): void {
    const tid = this.state.templateId();
    if (!tid) return;
    // Optimistic local update for instant visual feedback
    this.state.template.update((t) => (t ? { ...t, ...patch } : t));
    this.templatesSvc.update(tid, patch).subscribe({
      next: (res) => {
        if (!res.ok) {
          // Revert on failure — reload from server
          this.templatesSvc.findById(tid).subscribe({
            next: (tRes) => {
              if (tRes.ok) this.state.template.set(tRes.data);
            },
          });
        }
      },
      error: () => {
        this.templatesSvc.findById(tid).subscribe({
          next: (tRes) => {
            if (tRes.ok) this.state.template.set(tRes.data);
          },
        });
      },
    });
  }

  protected onDeleteBlock(id: string): void {
    const block = this.state.blocks().find((b) => b._id === id);
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
      this.state.blocks.update((arr) => arr.filter((b) => b._id !== id));
      if (this.state.selectedId() === id) this.state.selectedId.set(null);
      this.blocksSvc.remove(id).subscribe({
        next: (res) => {
          if (res.ok) this.toast.success('Блок удалён');
          else {
            this.toast.error(extractErrorMessage(res.error));
            this.state.loadBlocks(this.state.templateId() ?? '');
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
      this.state.isCreating.set(true);
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
              this.state.isCreating.set(false);
              return;
            }
            this.doCreateTemplate(orgId, docTypeId, result);
          },
          error: (err) => {
            this.state.isCreating.set(false);
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
          this.state.isCreating.set(false);
          if (res.ok) {
            this.toast.success('Шаблон создан');
            this.router.navigate(['/doc-constructor/builder', res.data._id]);
          } else {
            this.toast.error(extractErrorMessage(res.error));
          }
        },
        error: (err: HttpErrorResponse) => {
          this.state.isCreating.set(false);
          this.toast.error(extractErrorMessage(err));
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // Snap settings + reload + template-pick navigation handlers are owned by
  // BuilderStateService (state.onSnapSettingsChange / state.onReload /
  // state.onTemplatePick). Page only owns template-level CRUD and Dialog UI.
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // Auto-save result handler (state.handleSaveResult) is owned by
  // BuilderStateService. Constructor subscribes to state.saveEvents$
  // and delegates via state.handleSaveResult.
  // ─────────────────────────────────────────────────────────────
}
