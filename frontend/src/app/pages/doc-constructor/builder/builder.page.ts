import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Subject,
  catchError,
  debounceTime,
  forkJoin,
  fromEvent,
  groupBy,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { LucideAngularModule, Eye, Pencil } from 'lucide-angular';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import {
  TextBlockCategoriesService,
  type TextBlockCategory,
} from '../../../shared/services/pi-text-block-categories.service';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { extractErrorMessage, SilentResult } from '../../../core/silent-http';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';
import { defaultBlockLayout } from '../../../shared/template-block/template-block-layout';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../../shared/ui/dialog/pi-alert-dialog.component';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { CatalogReturnStore } from '../../../shared/navigation/catalog-return.util';
import type { AddBlockPayload } from './builder.types';
import { BuilderCanvasComponent } from './builder-canvas.component';
import { BuilderInspectorComponent } from './builder-inspector.component';
import { BuilderToolPaneComponent } from './builder-tool-pane.component';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';

/**
 * Полная документация страницы: docs/pages/builder.page.md
 *
 * TZ-86 Phase D.1 + D.2 — `BuilderPage` (3-pane shell, state orchestrator).
 *
 * Layout (top palette + canvas | inspector):
 *   ┌────────────────────────────────────────────────────┐
 *   │ ToolPane — horizontal palette (full width)         │
 *   ├──────────────────────────┬─────────────────────────┤
 *   │ Canvas (cdkDropList id=…)│ Inspector (320px)       │
 *   │ flex-1                   │                         │
 *   └──────────────────────────┴─────────────────────────┘
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
    BuilderCanvasComponent,
    BuilderInspectorComponent,
    BuilderToolPaneComponent,
  ],
  template: `
    <!--
      TZ-DOC-324 (IA): BuilderPage is now pure editor for /:id.
      The empty-state template picker is gone — registry CRUD lives at
      /doc-constructor/templates (TemplatesPage). /doc-constructor/builder
      exact path redirects there (see app.routes.ts).
      TZ-UI-405 B-04: no breadcrumbs here is a confirmed intentional exception
      (canvas-first editor), do not add page-chrome crumbs.
    -->
    <!-- Builder toolbar — title + editor/preview (add blocks: left palette rail) -->
    <div class="builder-toolbar">
      <div class="builder-toolbar__title">
        <button
          type="button"
          class="builder-back pi-focus-ring"
          (click)="goToTemplates()"
          data-test="builder-back-templates"
          [attr.title]="backButtonTitle()"
          [attr.aria-label]="backButtonTitle()"
        >
          {{ backButtonLabel() }}
        </button>
        <span class="text-xs text-muted-foreground">{{ headerSubtitle() }}</span>
        @if (templateId()) {
          <button
            type="button"
            class="builder-category-chip pi-focus-ring"
            (click)="onCategoryChipReset()"
            [title]="selectedCategoryId() ? 'Кликните, чтобы сбросить фильтр' : ''"
            [attr.aria-label]="'Категория: ' + currentCategoryLabel()"
            data-test="builder-category-chip"
          >
            Категория: {{ currentCategoryLabel() }}
          </button>
        }
      </div>

      <div class="builder-view-toggle">
        @switch (saveStatus()) {
          @case ('saving') {
            <span class="status-chip status-chip--saving" data-test="builder-save-status"
              >Сохранение…</span
            >
          }
          @case ('saved') {
            <span class="status-chip status-chip--saved" data-test="builder-save-status"
              >Сохранено</span
            >
          }
          @case ('error') {
            <span class="status-chip status-chip--error" data-test="builder-save-status"
              >Ошибка сохранения</span
            >
          }
        }
        <button
          type="button"
          class="builder-view-toggle__btn"
          [class.builder-view-toggle__btn--active]="viewMode() === 'editor'"
          (click)="viewMode.set('editor')"
          [attr.aria-pressed]="viewMode() === 'editor'"
        >
          <lucide-icon [img]="EditIcon" [size]="13"></lucide-icon>
          Редактор
        </button>
        <button
          type="button"
          class="builder-view-toggle__btn"
          [class.builder-view-toggle__btn--active]="viewMode() === 'preview'"
          (click)="viewMode.set('preview')"
          [attr.aria-pressed]="viewMode() === 'preview'"
        >
          <lucide-icon [img]="EyeIcon" [size]="13"></lucide-icon>
          Превью
        </button>
      </div>
    </div>

    <!-- Main builder area: left palette rail | canvas | inspector -->
    <div class="builder-shell">
      <app-builder-tool-pane
        [groups]="paletteGroups()"
        (addBlock)="onAddBlock($event)"
        (photoSelected)="onPhotoFile($event)"
        (selectGroup)="onSelectGroup($event)"
        (ungroupGroup)="onUngroupById($event)"
      ></app-builder-tool-pane>

      <div class="builder-canvas-wrap">
        <app-builder-canvas
          [blocks]="blocks()"
          [selectedId]="selectedId()"
          [selectedIds]="selectedIds()"
          [backgroundImages]="backgroundImages()"
          [orientation]="orientation()"
          [backgroundOpacity]="template()?.backgroundOpacity ?? 0.3"
          [pageNumbering]="template()?.pageNumbering ?? false"
          [pageSize]="template()?.pageSize ?? 'A4'"
          [snapEnabled]="snapEnabled()"
          [gridSize]="gridSize()"
          [boundaryPadding]="boundaryPadding()"
          [gridVisible]="false"
          [viewMode]="viewMode()"
          (select)="onSelect($event)"
          (multiSelect)="onMultiSelect($event)"
          (marqueeSelect)="onMarqueeSelect($event)"
          (reorder)="onReorder($event)"
          (dropAdd)="onDropAdd($event)"
          (blockWidthChange)="onBlockWidthChange($event)"
          (overlayMove)="onOverlayMove($event)"
          (overlayResize)="onOverlayResize($event)"
          (layoutChanges)="onLayoutChanges($event)"
          (canvasClick)="onCanvasClick()"
          (deleteRequest)="onDeleteBlock($event)"
        />
        @if (viewMode() === 'preview') {
          @if (previewBuildLoading()) {
            <div class="builder-build-preview-loading">Подстановка данных…</div>
          } @else if (previewBuildHtml()) {
            <iframe
              class="builder-build-preview"
              title="Превью с подстановкой"
              [attr.srcdoc]="previewBuildHtml()"
            ></iframe>
          }
        }
      </div>

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
          [gridVisible]="false"
          [grouped]="selectionIsPersistedGroup()"
          (snapSettingsChange)="onSnapSettingsChange($event)"
          (layoutOrderChange)="onLayoutChanges($event)"
          (groupSelected)="onGroupSelected()"
          (ungroupSelected)="onUngroupSelected()"
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
        position: relative;
      }

      .builder-canvas-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
      }

      .builder-build-preview {
        position: absolute;
        inset: 0;
        z-index: 20;
        width: 100%;
        height: 100%;
        border: none;
        background: var(--color-paper);
      }

      .builder-build-preview-loading {
        position: absolute;
        inset: 0;
        z-index: 21;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.85);
        font-size: 13px;
        color: var(--color-muted-foreground-strong);
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .builder-subtitle {
        padding: var(--space-1) 0 var(--space-2);
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: var(--space-1) var(--space-2);
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
        padding: var(--space-8) var(--space-4);
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
        padding: calc(var(--space-2) - var(--space-1) / 2) var(--space-3);
        border-bottom: 1px solid var(--color-rule);
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
      }

      .builder-toolbar__title {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .builder-back {
        display: inline-flex;
        align-items: center;
        height: 28px;
        padding: 0 var(--space-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        color: var(--color-ink);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }

      .builder-back:hover {
        background: var(--color-sunrise-soft);
      }

      .builder-category-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: var(--space-1) var(--space-2);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-gold, var(--color-sunrise-warm));
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
        border: 1px solid color-mix(in oklch, var(--color-sunrise-warm) 30%, transparent);
        border-radius: 2px;
        cursor: pointer;
        transition: all 120ms ease;
      }

      .builder-category-chip:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 55%, transparent);
      }

      /* ═══ View Mode Toggle — graphite track + gold labels (dark-safe) ═══ */
      .builder-view-toggle {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 0;
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        padding: var(--space-1);
      }

      .builder-view-toggle__btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: var(--space-1) calc(var(--space-2) + var(--space-1) / 2);
        font-size: 11px;
        font-weight: 500;
        font-family: var(--font-mono);
        color: var(--color-muted);
        background: transparent;
        border: 1px solid transparent;
        border-radius: 1px;
        cursor: pointer;
        transition:
          color 100ms ease,
          background 100ms ease,
          border-color 100ms ease;
        white-space: nowrap;
      }

      .builder-view-toggle__btn:hover {
        color: var(--color-ink);
      }

      .builder-view-toggle__btn--active {
        background: color-mix(in oklch, var(--color-gold) 22%, var(--color-paper));
        color: var(--color-ink);
        border-color: color-mix(in oklch, var(--color-gold) 55%, var(--color-rule));
        font-weight: 600;
        box-shadow: none;
      }

      /* ═══ Inspector Panel — TZ-211: Design System ═══ */
      .builder-inspector-panel {
        width: 320px;
        flex-shrink: 0;
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
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
  private readonly catalogReturn = inject(CatalogReturnStore);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly textBlocksSvc = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  // Icons
  protected readonly EyeIcon = Eye;
  protected readonly EditIcon = Pencil;

  // State
  protected readonly templateId = signal<string | null>(null);
  protected readonly template = signal<DocumentTemplate | null>(null);
  protected readonly blocks = signal<TemplateBlock[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly isLoading = signal<boolean>(false);
  protected readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  /** When true, inspector shows template properties instead of block properties */
  protected readonly templateSelected = signal<boolean>(false);
  /** TZ-211: View mode toggle — 'editor' | 'preview' */
  protected readonly viewMode = signal<'editor' | 'preview'>('editor');
  /** TZ-DOC-525: server-built HTML when preview mode is active */
  protected readonly previewBuildHtml = signal<string | null>(null);
  protected readonly previewBuildLoading = signal(false);
  private readonly liveRefresh$ = new Subject<void>();
  private liveRefreshInFlight = 0;
  /** Snap-to-grid enabled for overlay blocks (persisted to localStorage). */
  protected readonly snapEnabled = signal<boolean>(loadSnapSettings().snapEnabled);
  /** Grid size for snapping (px) (persisted to localStorage). */
  protected readonly gridSize = signal<number>(loadSnapSettings().gridSize);
  /** Padding from paper edges that overlay blocks cannot cross (px) (persisted to localStorage). */
  protected readonly boundaryPadding = signal<number>(loadSnapSettings().boundaryPadding);
  /**
   * TZ-DOC-269 (revoked 2026-08-02): декоративная сетка (dots) удалена
   * из UI и из canvas-renderer; магнитная привязка работает через
   * `gridSize` без визуального слоя. Сигнал сохранён как константа
   * `false` ради совместимости binding'ов и e2e-селекторов, но не
   * отображается ни на одном из path render.
   */
  protected readonly showGrid = signal<boolean>(false);

  // Dropdown state for inline toolbar

  // TZ-DOC-317 — shared category filter for the «Тексты» surfaces (pane + dropdown).
  protected readonly textFilter = inject(BuilderTextFilterService);
  private readonly textBlockCategories = inject(TextBlockCategoriesService);
  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly categoryLoading = signal(true);
  protected readonly selectedCategoryId = computed(() => this.textFilter.categoryId());

  protected onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // «Все» (empty) → null → no categoryId param on the request.
    this.textFilter.categoryId.set(value ? value : null);
  }

  // TZ-DOC-318 — breadcrumb badge in the topbar: friendly name of the
  // active text category (or «Все»). Clicking the chip clears the filter.
  protected readonly currentCategoryLabel = computed<string>(() => {
    const id = this.selectedCategoryId();
    if (!id) return 'Все';
    return this.categories().find((c) => c._id === id)?.name ?? 'Все';
  });

  // TZ-DOC-326 — dropdown item hint resolves the categoryId FK → friendly
  // name via the loaded catalog (the legacy `category` enum was removed in 323).
  protected categoryName(id: string | undefined): string | undefined {
    if (!id) return undefined;
    return this.categories().find((c) => c._id === id)?.name;
  }

  protected onCategoryChipReset(): void {
    this.textFilter.categoryId.set(null);
  }

  // Auto-save Subject — grouped by _id, debounced per group.
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();
  /** TZ-QA-445C: latest unsaved patch per block — flushed before preview build. */
  private readonly pendingPatches = new Map<string, Partial<TemplateBlock>>();

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

  /** True when current multi-selection is exactly one persisted group. */
  protected readonly selectionIsPersistedGroup = computed<boolean>(() => {
    const selected = this.selectedBlocks();
    if (selected.length < 2) return false;
    const gid = selected[0]?.groupId;
    if (!gid) return false;
    return selected.every((b) => b.groupId === gid);
  });

  /** Palette list: one entry per distinct non-null groupId. */
  protected readonly paletteGroups = computed<
    Array<{ groupId: string; label: string; count: number; memberKeys: string[] }>
  >(() => {
    const map = new Map<string, TemplateBlock[]>();
    for (const b of this.blocks()) {
      const gid = b.groupId;
      if (!gid) continue;
      const list = map.get(gid) ?? [];
      list.push(b);
      map.set(gid, list);
    }
    let i = 0;
    return Array.from(map.entries()).map(([groupId, members]) => {
      i += 1;
      return {
        groupId,
        label: `Группа ${i}`,
        count: members.length,
        memberKeys: members.map((m) => blockKey(m)),
      };
    });
  });

  // TZ-UX-316 — explicit deep-link return: «Редактировать шаблон» из Create КП
  // приходит с ?returnUrl=/proposals/create[?id=…]. Кнопка «←» чтит его;
  // без returnUrl — смарт-возврат CatalogReturnStore с fallback на Шаблоны.
  protected readonly returnUrl = signal<string | null>(null);

  protected readonly backButtonLabel = computed<string>(() =>
    this.returnUrl() ? '← К созданию КП' : '← Шаблоны',
  );

  protected readonly backButtonTitle = computed<string>(() =>
    this.returnUrl() ? 'Вернуться к созданию КП' : 'К списку шаблонов',
  );

  protected readonly headerSubtitle = computed<string>(() => {
    const id = this.templateId();
    if (!id) return 'Загрузка шаблона…';
    const name = this.template()?.name?.trim();
    const count = this.blocks().length;
    const label = name && name.length > 0 ? name : `Шаблон ${id.slice(-6)}`;
    return `${label} · ${count} ${pluralBlocks(count)}`;
  });

  /** TZ-UX-316: явный same-origin returnUrl → туда; иначе smart-back с fallback. */
  protected goToTemplates(): void {
    const target = this.returnUrl();
    if (target) {
      void this.router.navigateByUrl(target);
      return;
    }
    this.catalogReturn.navigateBackOr('/doc-constructor/templates');
  }

  /**
   * D.2.1 / TZ-DOC-344: canvas always paints **one** background — the default.
   * Invalid / missing `defaultBackgroundIndex` → fall back to index 0 (never stack all).
   */
  protected readonly backgroundImages = computed<string[]>(() => {
    const t = this.template();
    if (!t) return [];
    const all = t.backgroundImage ?? [];
    if (all.length === 0) return [];
    const idx = t.defaultBackgroundIndex ?? -1;
    const safe = idx >= 0 && idx < all.length ? idx : 0;
    return [all[safe]];
  });

  protected readonly orientation = computed<'portrait' | 'landscape'>(() => {
    return this.template()?.orientation ?? 'portrait';
  });

  constructor() {
    // TZ-DOC-317 — active catalog for the «Тексты» filter dropdowns
    // (TZ-DOC-309 cache reuse, never a raw duplicate GET).
    this.textBlockCategories
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.categoryLoading.set(false);
        if (res.ok) this.categories.set(res.data ?? []);
      });

    // 1) Initialize save$ pipeline (groupBy _id → debounce 1500 → switchMap).
    //    D.2.3: `tap` before switchMap to set 'saving'; success path sets
    //    'saved' (auto-revert to 'idle' after 2s via timer), failure sets 'error'.
    //    TZ-DOC-333 belt-and-braces: a transient blob:/data: imageUrl could
    //    still ride in a settings PATCH emitted during the create→upload
    //    window (before the local block is swapped to the /uploads/ URL) —
    //    the backend 400s those, so scrub them here too.
    this.save$
      .pipe(
        tap(({ _id, patch }) => {
          this.pendingPatches.set(_id, this.mergePendingPatch(_id, patch));
          this.saveStatus.set('saving');
        }),
        groupBy((p) => p._id),
        mergeMap((group$) =>
          group$.pipe(
            debounceTime(1500),
            switchMap(({ _id }) => {
              const patch = this.pendingPatches.get(_id);
              if (!patch) return of(null);
              return this.blocksSvc.update(_id, this.sanitizeOutgoingPatch(patch)).pipe(
                tap((res) => {
                  if (res?.ok) this.pendingPatches.delete(_id);
                }),
              );
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res) this.handleSaveResult(res);
      });

    // 2) Watch route param :id + query params (Phase E.3: ?source + ?sourceId).
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.templateId.set(id);
      // TZ-DOC-317 step f: switching templates resets the «Тексты» category
      // filter back to «Все». A category selected for template A is a UX
      // dead-end on template B (B may have no blocks in that category).
      this.textFilter.reset();
      this.pendingPatches.clear();
      this.blocks.set([]);
      this.template.set(null);
      this.selectedId.set(null);
      this.saveStatus.set('idle');
      if (id) {
        this.loadBlocks(id);
      } else {
        // Bare /builder is redirected in routes; defense if somehow opened without :id.
        void this.router.navigate(['/doc-constructor/templates'], {
          queryParamsHandling: 'preserve',
          replaceUrl: true,
        });
      }
    });

    // TZ-DOC-318 step b: two-way bind `?categoryId=<id>` query param ↔
    // shared filter signal (shareable link, F5-refresh). Read on URL
    // change (refresh preserves the selection); write happens in the
    // effect() below so this subscribe is the read-side only. Setting
    // the signal to the same value is a no-op (Angular signal equality
    // for primitives), so the round-trip is loop-free in steady state.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((qp) => {
      const category = qp.get('categoryId');
      this.textFilter.categoryId.set(category ?? null);

      // Phase E.3: read ?source + ?sourceId query params (preserved across
      // template-pick navigation). Logged for future use; binding logic is
      // out of scope until the doc-template service supports pre-binding.
      const source = qp.get('source');
      const sourceId = qp.get('sourceId');
      if (source && sourceId) {
        this.sourceContext.set({ source, sourceId });
      } else {
        this.sourceContext.set(null);
      }

      // TZ-UX-316: ?returnUrl — same-origin deep-link return target (Create КП).
      const rawReturn = qp.get('returnUrl');
      this.returnUrl.set(isSafeReturnUrl(rawReturn) ? rawReturn : null);
    });

    // TZ-DOC-318 step b (write side): whenever the shared filter signal
    // changes, write ?categoryId=<id> to the URL (shareable link).
    // `replaceUrl: true` keeps the back button clean (router state is for
    // navigation, not filter ticks). `categoryId: null` removes the param
    // (Angular treats null in queryParams as a removal under merge).
    //
    // Loop guard: skip the write when the URL already carries the same
    // value (covers the initial effect emission on creation, where the
    // read-side subscription has already synced categoryId ← URL).
    effect(() => {
      const c = this.textFilter.categoryId();
      const current = this.route.snapshot.queryParamMap.get('categoryId');
      const desired = c ?? null;
      if ((current ?? null) === desired) return;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoryId: desired },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    // TZ-DOC-524: debounced live text-block refresh (focus + after load)
    this.liveRefresh$
      .pipe(
        debounceTime(300),
        switchMap(() => this.refreshLiveTextBlocks$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    if (typeof window !== 'undefined') {
      fromEvent(window, 'focus')
        .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.templateId()) this.scheduleLiveTextRefresh();
        });
    }

    // TZ-DOC-525 / TZ-QA-445C: preview → flush pending autosaves, then server
    // build; rewrite /uploads for srcdoc so photos match the editor.
    effect(() => {
      const mode = this.viewMode();
      const tid = this.templateId();
      if (mode !== 'preview' || !tid) {
        this.previewBuildHtml.set(null);
        this.previewBuildLoading.set(false);
        return;
      }
      const tpl = this.template();
      const rawOrg = tpl?.organizationId;
      const organizationId =
        rawOrg && typeof rawOrg === 'object' && '_id' in (rawOrg as object)
          ? String((rawOrg as { _id: string })._id)
          : rawOrg
            ? String(rawOrg)
            : undefined;
      this.previewBuildLoading.set(true);
      this.flushPendingSaves$()
        .pipe(
          switchMap(() => this.templatesSvc.build(tid, organizationId ? { organizationId } : {})),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (res) => {
            this.previewBuildLoading.set(false);
            if (res.ok && typeof res.data === 'string') {
              this.previewBuildHtml.set(this.withPreviewBaseHref(res.data));
            } else {
              this.previewBuildHtml.set(null);
            }
          },
          error: () => {
            this.previewBuildLoading.set(false);
            this.previewBuildHtml.set(null);
          },
        });
    });
  }

  /**
   * TZ-QA-445C: flush debounced block PATCHes before preview so the server
   * build matches the editor canvas (not the last-saved snapshot).
   */
  private flushPendingSaves$() {
    const entries = [...this.pendingPatches.entries()];
    if (entries.length === 0) return of(true);
    this.saveStatus.set('saving');
    return forkJoin(
      entries.map(([_id, patch]) =>
        this.blocksSvc.update(_id, this.sanitizeOutgoingPatch(patch)).pipe(
          tap((res) => {
            if (res.ok) this.pendingPatches.delete(_id);
            this.handleSaveResult(res);
          }),
          catchError(() => of(null)),
        ),
      ),
    ).pipe(map(() => true));
  }

  private mergePendingPatch(_id: string, patch: Partial<TemplateBlock>): Partial<TemplateBlock> {
    const prev = this.pendingPatches.get(_id) ?? {};
    const merged: Partial<TemplateBlock> = { ...prev, ...patch };
    if (prev.settings || patch.settings) {
      merged.settings = {
        ...((prev.settings as Record<string, unknown> | undefined) ?? {}),
        ...((patch.settings as Record<string, unknown> | undefined) ?? {}),
      } as TemplateBlock['settings'];
    }
    if (prev.layout || patch.layout) {
      merged.layout = {
        ...(prev.layout ?? {}),
        ...(patch.layout ?? {}),
      } as TemplateBlock['layout'];
    }
    return merged;
  }

  /** Make /uploads resolve inside about:srcdoc iframes (browser preview). */
  private withPreviewBaseHref(html: string): string {
    const origin =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
    if (!origin) return html;
    const rewritten = html.replace(/(["'(])\/uploads\//g, `$1${origin}/uploads/`);
    if (/<base\s/i.test(rewritten)) {
      return rewritten.replace(/<base\s[^>]*>/i, `<base href="${origin}/">`);
    }
    const baseTag = `<base href="${origin}/">`;
    if (/<head[^>]*>/i.test(rewritten)) {
      return rewritten.replace(/<head[^>]*>/i, (open) => `${open}${baseTag}`);
    }
    return `<!DOCTYPE html><html><head>${baseTag}</head><body>${rewritten}</body></html>`;
  }

  /** Phase E.3: source context (order/contract ID pre-binding for future expansion). */
  protected readonly sourceContext = signal<{ source: string; sourceId: string } | null>(null);

  /**
   * Apply template from API; heal legacy `defaultBackgroundIndex=-1` when
   * backgrounds exist so star + canvas agree (TZ-DOC-344).
   */
  private applyLoadedTemplate(data: DocumentTemplate | null | undefined): void {
    if (!data) {
      this.template.set(null);
      return;
    }
    const bg = data.backgroundImage ?? [];
    let defIdx = data.defaultBackgroundIndex ?? -1;
    if (bg.length > 0 && (defIdx < 0 || defIdx >= bg.length)) {
      defIdx = 0;
      this.template.set({ ...data, defaultBackgroundIndex: defIdx });
      const tid = data._id;
      if (tid) {
        this.templatesSvc.setDefaultBackground(tid, 0).subscribe({
          error: () => {
            /* non-fatal — UI already shows index 0 */
          },
        });
      }
      return;
    }
    this.template.set(data);
  }

  // ─────────────────────────────────────────────────────────────
  // Initial load — fetches BOTH blocks AND template (D.2.1 needs template).
  // ─────────────────────────────────────────────────────────────
  private loadBlocks(id: string): void {
    this.isLoading.set(true);
    // Fetch template first (lightweight); blocks second.
    this.templatesSvc.findById(id).subscribe({
      next: (tRes) => {
        if (tRes.ok) this.applyLoadedTemplate(tRes.data);
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
          this.scheduleLiveTextRefresh();
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
          let needsDefaultPersist = false;
          this.template.update((t) => {
            if (!t) return t;
            const prevLen = t.backgroundImage?.length ?? 0;
            const bg = res.data.backgroundImage ?? [];
            let defIdx = res.data.defaultBackgroundIndex ?? t.defaultBackgroundIndex ?? -1;
            if (prevLen === 0 || defIdx < 0 || defIdx >= bg.length) {
              defIdx = bg.length > 0 ? 0 : -1;
              // Legacy templates: server still -1 with existing images — persist heal.
              if (prevLen > 0 && defIdx === 0) needsDefaultPersist = true;
            }
            return { ...t, backgroundImage: bg, defaultBackgroundIndex: defIdx };
          });
          if (needsDefaultPersist) {
            this.templatesSvc.setDefaultBackground(tid, 0).subscribe({
              error: () => {
                /* non-fatal — UI already shows index 0 */
              },
            });
          }
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

  protected onPhotoFile(file: File): void {
    if (this.viewMode() === 'preview') return;
    const localUrl = URL.createObjectURL(file);
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
  }

  // ─────────────────────────────────────────────────────────────
  // Tool pane → add block (Phase D.1) / drop from palette (D.2.2)
  // ─────────────────────────────────────────────────────────────
  protected onAddBlock(payload: AddBlockPayload): void {
    if (this.viewMode() === 'preview') return;
    return this.insertBlock(payload, this.blocks().length);
  }

  /** D.2.2: drag-from-palette handler — adds block at the dropped index. */
  protected onDropAdd(event: { payload: AddBlockPayload; insertIndex: number }): void {
    if (this.viewMode() === 'preview') return;
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

    // TZ-DOC-333: `blob:` URLs are session-local and the backend now rejects
    // them on create/update (400). When a photo file will be uploaded right
    // after persist, send the block WITHOUT `settings.imageUrl` — the upload
    // endpoint writes the canonical /uploads/... URL into Mongo itself.
    // The blob stays in the local block only as an optimistic preview.
    const settingsForCreate: Record<string, unknown> | undefined = newBlock.settings
      ? { ...newBlock.settings }
      : undefined;
    if (file && settingsForCreate && 'imageUrl' in settingsForCreate) {
      delete settingsForCreate['imageUrl'];
    }
    const blobUrl = newBlock.settings?.['imageUrl'];
    const revokeBlob = (): void => {
      if (typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };

    this.blocksSvc
      .add(tid, {
        type: newBlock.type,
        order: newBlock.order,
        ...(newBlock.title ? { title: newBlock.title } : {}),
        ...(newBlock.content ? { content: newBlock.content } : {}),
        ...(newBlock.height ? { height: newBlock.height } : {}),
        showLine: newBlock.showLine,
        ...(settingsForCreate ? { settings: settingsForCreate } : {}),
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

          // Upload file to server if provided (e.g. photo upload). TZ-DOC-333:
          // the endpoint persists settings.imageUrl itself; on success we swap
          // the local blob preview for the canonical /uploads/... URL and
          // release the object URL. On failure we drop the dead blob from the
          // local block so a reload never shows a broken image.
          if (file && res.data._id) {
            this.blocksSvc.uploadImage(res.data._id, file).subscribe({
              next: (uploadRes) => {
                if (uploadRes.ok) {
                  revokeBlob();
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
                  revokeBlob();
                  this.blocks.update((arr) =>
                    arr.map((b) =>
                      b._id === res.data._id
                        ? { ...b, settings: { ...(b.settings ?? {}), imageUrl: '' } }
                        : b,
                    ),
                  );
                  this.toast.error(extractErrorMessage(uploadRes.error));
                }
              },
              error: () => {
                revokeBlob();
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
      this.toast.error('Шаблон ещё не открыт. Создайте или откройте его в «Шаблоны».');
      void this.router.navigate(['/doc-constructor/templates']);
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
          height: undefined,
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
    this.templateSelected.set(false);
    const gid = block.groupId;
    if (gid) {
      const keys = this.blocks()
        .filter((b) => b.groupId === gid)
        .map((b) => blockKey(b));
      this.selectedIds.set(new Set(keys));
      this.selectedId.set(null);
      return;
    }
    this.selectedId.set(blockKey(block));
    this.selectedIds.set(new Set());
  }

  protected onMultiSelect(block: TemplateBlock): void {
    const key = blockKey(block);
    const ids = new Set(this.selectedIds());
    // Preserve the current single selection when the user starts a
    // Ctrl/Cmd group selection, then toggle the clicked block.
    const currentId = this.selectedId();
    if (currentId && ids.size === 0) ids.add(currentId);
    // If clicking a persisted-group member with Ctrl, toggle the whole group.
    if (block.groupId) {
      const members = this.blocks()
        .filter((b) => b.groupId === block.groupId)
        .map((b) => blockKey(b));
      const allSelected = members.every((k) => ids.has(k));
      if (allSelected) {
        for (const k of members) ids.delete(k);
      } else {
        for (const k of members) ids.add(k);
      }
    } else if (ids.has(key)) {
      ids.delete(key);
    } else {
      ids.add(key);
    }
    this.selectedIds.set(ids);
    this.selectedId.set(null);
    this.templateSelected.set(ids.size === 0);
  }

  protected onCanvasClick(): void {
    // Clear selection only — do NOT clear groupId membership.
    this.selectedId.set(null);
    this.selectedIds.set(new Set());
    this.templateSelected.set(true);
  }

  /**
   * Marquee drag finished → replace the selection with the
   * intersecting blocks (expand any hit group members to full groups).
   */
  protected onMarqueeSelect(ids: string[]): void {
    const expanded = new Set<string>();
    const byKey = new Map(this.blocks().map((b) => [blockKey(b), b]));
    for (const id of ids) {
      const block = byKey.get(id);
      if (!block) {
        expanded.add(id);
        continue;
      }
      if (block.groupId) {
        for (const b of this.blocks()) {
          if (b.groupId === block.groupId) expanded.add(blockKey(b));
        }
      } else {
        expanded.add(id);
      }
    }
    this.selectedIds.set(expanded);
    this.selectedId.set(null);
    this.templateSelected.set(expanded.size === 0);
  }

  /** Persist a flat group for the current multi-selection. */
  protected onGroupSelected(): void {
    const selected = this.selectedBlocks().filter((b) => !!b.layout);
    if (selected.length < 2) return;
    const groupId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `group-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.applyGroupId(selected, groupId);
  }

  /** Clear groupId on the currently selected persisted group (or multi-select). */
  protected onUngroupSelected(): void {
    const selected = this.selectedBlocks();
    if (selected.length === 0) return;
    const gid = selected[0]?.groupId;
    const targets =
      gid && selected.every((b) => b.groupId === gid)
        ? this.blocks().filter((b) => b.groupId === gid)
        : selected;
    this.applyGroupId(targets, null);
  }

  protected onSelectGroup(groupId: string): void {
    const keys = this.blocks()
      .filter((b) => b.groupId === groupId)
      .map((b) => blockKey(b));
    if (keys.length === 0) return;
    this.selectedIds.set(new Set(keys));
    this.selectedId.set(null);
    this.templateSelected.set(false);
  }

  protected onUngroupById(groupId: string): void {
    const targets = this.blocks().filter((b) => b.groupId === groupId);
    this.applyGroupId(targets, null);
  }

  private applyGroupId(targets: TemplateBlock[], groupId: string | null): void {
    if (targets.length === 0) return;
    const keys = new Set(targets.map((b) => blockKey(b)));
    this.blocks.update((arr) => arr.map((b) => (keys.has(blockKey(b)) ? { ...b, groupId } : b)));

    const ops = targets
      .filter((b): b is TemplateBlock & { _id: string } => !!b._id)
      .map((b) => this.blocksSvc.update(b._id, { groupId }));
    if (ops.length === 0) return;

    this.saveStatus.set('saving');
    forkJoin(ops).subscribe({
      next: (results) => {
        const failed = results.some((r) => !r.ok);
        if (failed) {
          this.saveStatus.set('error');
          this.toast.error('Не удалось сохранить группу');
          return;
        }
        this.saveStatus.set('saved');
        const myTick = ++this.savedTick;
        timer(2000).subscribe(() => {
          if (myTick === this.savedTick) this.saveStatus.set('idle');
        });
      },
      error: () => {
        this.saveStatus.set('error');
        this.toast.error('Не удалось сохранить группу');
      },
    });
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
      case 'table': {
        const tableId =
          block.source?.kind === 'table-template' ? block.source.refId : block.dataBinding?.value;
        if (tableId) {
          this.router.navigate(['/doc-constructor/tables'], {
            queryParams: { editId: tableId },
          });
        } else {
          this.router.navigate(['/doc-constructor/tables']);
        }
        break;
      }
      default:
        break;
    }
  }

  protected onDeleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.size === 0) return;

    const previous = this.blocks();
    const locked = previous.filter((b) => ids.has(blockKey(b)) && b.locked);
    if (locked.length > 0) {
      this.toast.warning('Среди выбранных есть заблокированные — разблокируйте их в Геометрии');
      return;
    }

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

  /**
   * TZ-DOC-333 belt-and-braces: scrub any ephemeral `blob:`/`data:` imageUrl
   * from an outgoing settings PATCH. The normal photo flow already swaps the
   * local block to the canonical /uploads/... URL before any debounced save,
   * but during the create→upload window a position/size change could still
   * carry the optimistic blob — the backend rejects those with 400.
   */
  private sanitizeOutgoingPatch(patch: Partial<TemplateBlock>): Partial<TemplateBlock> {
    if (!patch.settings) return patch;
    const settings = patch.settings as Record<string, unknown>;
    const url = settings['imageUrl'];
    if (typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('data:'))) {
      return { ...patch, settings: { ...settings, imageUrl: '' } };
    }
    return patch;
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
          // Prefer server list, but keep local groupId if the payload omits it
          // (defensive: layout-only $set must never wipe membership).
          if (res.data) {
            const prevById = new Map(previous.map((b) => [b._id, b]));
            this.blocks.set(
              res.data.map((server) => {
                const prev = server._id ? prevById.get(server._id) : undefined;
                if (prev?.groupId && (server.groupId === undefined || server.groupId === null)) {
                  return { ...server, groupId: prev.groupId };
                }
                return server;
              }),
            );
          }
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
              if (tRes.ok) this.applyLoadedTemplate(tRes.data);
            },
          });
        }
      },
      error: () => {
        this.templatesSvc.findById(tid).subscribe({
          next: (tRes) => {
            if (tRes.ok) this.applyLoadedTemplate(tRes.data);
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
    if (block?.locked) {
      this.toast.warning('Сначала разблокируйте блок в свойствах → Геометрия');
      return;
    }
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

  /** TZ-DOC-524 — queue refresh of live text-block refs on canvas. */
  private scheduleLiveTextRefresh(): void {
    this.liveRefresh$.next();
  }

  private refreshLiveTextBlocks$() {
    const blocks = this.blocks();
    const refIds = [
      ...new Set(
        blocks
          .map((b) => {
            const src = b.source;
            if (src?.kind !== 'text-block' || src.mode === 'snapshot' || !src.refId) return null;
            return src.refId;
          })
          .filter((id): id is string => !!id),
      ),
    ];
    if (refIds.length === 0) return of(undefined);

    const flight = ++this.liveRefreshInFlight;
    return forkJoin(
      refIds.map((id) =>
        this.textBlocksSvc.findById(id).pipe(
          map((res) => (res.ok && res.data ? { id, text: res.data as TextBlock } : null)),
          catchError(() => of(null)),
        ),
      ),
    ).pipe(
      tap((results) => {
        if (flight !== this.liveRefreshInFlight) return;
        const byId = new Map(results.filter(Boolean).map((r) => [r!.id, r!.text] as const));
        if (byId.size === 0) return;
        this.blocks.update((current) =>
          current.map((block) => {
            const src = block.source;
            if (src?.kind !== 'text-block' || src.mode === 'snapshot' || !src.refId) {
              return block;
            }
            const text = byId.get(src.refId);
            if (!text) return block;
            return {
              ...block,
              content: text.content ?? block.content,
              columns: text.columns ?? block.columns,
            };
          }),
        );
      }),
      map(() => undefined),
    );
  }

  /**
   * Phase E.3: preserve ?source + ?sourceId query params when navigating
   * from the empty-state picker to a specific /builder/:id route.
   */

  /**
   * Auto-save result handler. Uses early-return on `!res.ok` so TypeScript
   * narrows the SilentResult<TemplateBlock> discriminated union to
   * `{ok: false, error: HttpErrorResponse}` before accessing `res.error`.
   * D.2.3: also updates `saveStatus` signal — 'saved' for 2s then 'idle',
   * or 'error' indefinitely.
   */
  private handleSaveResult(res: SilentResult<TemplateBlock>): void {
    if (!res.ok) {
      // One toast per error streak — multi-block patches must not stack toasts.
      const alreadyError = this.saveStatus() === 'error';
      if (!alreadyError) {
        const code = res.error.status;
        if (code === 409) {
          this.toast.error('Конфликт: шаблон изменён другим пользователем');
        } else {
          this.toast.error(`Ошибка сохранения: ${extractErrorMessage(res.error)}`);
        }
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

// ═══ TZ-UX-316: returnUrl guard ═══

/**
 * Accept only same-origin absolute paths as `returnUrl` — never `//host`,
 * never a scheme (javascript:/http:/…). Query/hash are allowed.
 */
function isSafeReturnUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(value);
}
