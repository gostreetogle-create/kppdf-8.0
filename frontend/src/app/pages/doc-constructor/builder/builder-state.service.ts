/**
 * BuilderStateService — extracted state & data orchestration for the Конструктор
 * (Template Builder). Source-of-truth for all reactive state inside
 * `frontend/src/app/pages/doc-constructor/builder/`.
 *
 * TZ-235.A (Wave 1, Round 2). Migrated from `builder.page.ts` god-component
 * (1790 lines → 1636 lines) to:
 *   - Make SAFE addition of snap guides (TZ-235.B), group drag (TZ-235.D),
 *     undo/redo (TZ-235.C), placeholders (TZ-235.E).
 *   - Reduce coupling between BuilderPage's Template (HTML/CSS) and its
 *     imperative action handlers.
 *
 * Scope (this batch — TZ-235.A round 2):
 *   - 14 signals (templateId / template / blocks / selectedId(s) / loading /
 *     creating / saveStatus / templateSelected / viewMode / snapEnabled /
 *     gridSize / boundaryPadding / openDropdown / sourceContext)
 *   - 5 computed (selectedBlock / selectedBlocks / headerSubtitle /
 *     backgroundImages / orientation)
 *   - 2 httpResource (toolbar dropdowns: textsRes / tablesRes)
 *   - private save$ Subject + savedTick counter (save pipeline plumbing)
 *   - localStorage persistence for snap settings
 *   - 16 handler methods (selection / dropdown / block mutation / delete /
 *     reorder / loadBlocks) — extracted from page.ts
 *   - service injection (TemplateBlocksService, DocumentTemplatesService,
 *     TextBlocksService, TableTemplatesService, HttpClient, PiToastService,
 *     API_BASE_URL, ActivatedRoute, Router, DestroyRef)
 *
 * Out of scope (next rounds):
 *   - Template CRUD (onCreateTemplate / doCreateTemplate /
 *     onDuplicateTemplate / onDeleteTemplate / onTemplatePick / onReload)
 *   - Template config mutators (onBackgroundUpload / onRemoveBackground /
 *     onSetDefaultBackground / onSetOrientation / onSetOpacity)
 *   - onTemplateUpdate / onEditSelected / handleSaveResult (save pipeline)
 *
 * Lifetime: COMPONENT-SCOPED. Registered via `providers: [BuilderStateService]`
 * on `BuilderPage`'s `@Component` decorator. Rationale (thinker verdict, 2026-07-30):
 *   - `providedIn: 'root'` pollutes state across SPA navigations
 *     (open Template A → back → open Template B → still has Template A's
 *     selection, blocks, etc.)
 *   - Component-scoped guarantees state dies when BuilderPage navigates away.
 *   - Two browser tabs have separate JS contexts anyway, no cross-tab bleed.
 */
import {
  DestroyRef,
  Injectable,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  HttpClient,
  HttpErrorResponse,
  httpResource,
} from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  timer,
} from 'rxjs';
import { API_BASE_URL } from '../../../core/api.tokens';
import {
  extractErrorMessage,
  SilentResult,
} from '../../../core/silent-http';
import {
  blockKey,
  type DataBindingSource,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import type { AddBlockPayload } from './builder.types';

// ─────────────────────────────────────────────────────────────────────
// LocalStorage persistence for snap settings
// ─────────────────────────────────────────────────────────────────────

const SNAP_SETTINGS_KEY = 'kppdf.builder.snapSettings';

interface SnapSettings {
  snapEnabled: boolean;
  gridSize: number;
  boundaryPadding: number;
}

const DEFAULT_SNAP: SnapSettings = {
  snapEnabled: true,
  gridSize: 20,
  boundaryPadding: 0,
};

function loadSnapSettings(): SnapSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SNAP;
  try {
    const LEGACY_SNAP_KEY = 'pi-builder-snap-settings';
    const legacyRaw = localStorage.getItem(LEGACY_SNAP_KEY);
    if (legacyRaw !== null) {
      try {
        const parsed = JSON.parse(legacyRaw) as Partial<SnapSettings>;
        if (
          parsed &&
          (typeof parsed.snapEnabled === 'boolean' ||
            typeof parsed.gridSize === 'number' ||
            typeof parsed.boundaryPadding === 'number')
        ) {
          localStorage.setItem(SNAP_SETTINGS_KEY, legacyRaw);
          localStorage.removeItem(LEGACY_SNAP_KEY);
        } else {
          localStorage.removeItem(LEGACY_SNAP_KEY);
        }
      } catch {
        try {
          localStorage.removeItem(LEGACY_SNAP_KEY);
        } catch {
          /* swallow */
        }
      }
    }
    const raw = localStorage.getItem(SNAP_SETTINGS_KEY);
    if (!raw) return DEFAULT_SNAP;
    const parsed = JSON.parse(raw) as Partial<SnapSettings>;
    return {
      snapEnabled: parsed.snapEnabled ?? DEFAULT_SNAP.snapEnabled,
      gridSize: parsed.gridSize ?? DEFAULT_SNAP.gridSize,
      boundaryPadding: parsed.boundaryPadding ?? DEFAULT_SNAP.boundaryPadding,
    };
  } catch {
    return DEFAULT_SNAP;
  }
}

function saveSnapSettings(s: SnapSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SNAP_SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* swallow quota / disabled storage */
  }
}

// Russian plural-form for "блок".
function pluralBlocks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'блок';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блока';
  return 'блоков';
}

// ─────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────

/**
 * Component-scoped. Register via:
 *
 * ```ts
 * @Component({
 *   selector: 'app-builder-page',
 *   providers: [BuilderStateService],
 *   // ...
 * })
 * export class BuilderPage {
 *   protected readonly state = inject(BuilderStateService);
 * }
 * ```
 */
@Injectable()
export class BuilderStateService {
  // ── DI ─────────────────────────────────────────────────────────────
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly textBlocksSvc = inject(TextBlocksService);
  private readonly tableTemplatesSvc = inject(TableTemplatesService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  // ── Core state signals ────────────────────────────────────────────
  readonly templateId = signal<string | null>(null);
  readonly template = signal<DocumentTemplate | null>(null);
  readonly blocks = signal<TemplateBlock[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);
  readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly templateSelected = signal<boolean>(false);
  readonly viewMode = signal<'editor' | 'preview'>('editor');

  // ── Snap settings (persisted to localStorage) ──────────────────────
  readonly snapEnabled = signal<boolean>(loadSnapSettings().snapEnabled);
  readonly gridSize = signal<number>(loadSnapSettings().gridSize);
  readonly boundaryPadding = signal<number>(loadSnapSettings().boundaryPadding);

  // ── UI ephemeral state ────────────────────────────────────────────
  readonly openDropdown = signal<string | null>(null);
  readonly sourceContext = signal<{ source: string; sourceId: string } | null>(null);

  // ── httpResource for inline toolbar dropdowns ─────────────────────
  readonly textsRes = httpResource<
    Array<{ _id: string; name: string; category?: string; content?: string; columns?: unknown[] }>
  >(() => '/api/text-blocks?isActive=true', { defaultValue: [] });

  readonly tablesRes = httpResource<
    Array<{
      _id: string;
      name: string;
      description?: string;
      columns?: unknown[];
      sampleRows?: unknown[][];
    }>
  >(() => '/api/table-templates?isActive=true', { defaultValue: [] });

  // ── Auto-save plumbing ─────────────────────────────────────────────
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();

  readonly saveEvents$: Observable<{ _id: string; patch: Partial<TemplateBlock> }> =
    this.save$.asObservable();

  /** Public API for handlers: enqueue a save operation. */
  saveBlock(_id: string, patch: Partial<TemplateBlock>): void {
    this.save$.next({ _id, patch });
  }

  // Monotonic counter guard for saveStatus 'saved' → 'idle' revert.
  // Each save increments the counter; the timer callback only reverts if
  // its captured value matches the current value (no newer save has started).
  // Public — page.ts handlers (onBackgroundUpload etc.) under Dialog UI need
  // the same monotonic guard to avoid revert races.
  savedTick = 0;

  // NOTE: onDeleteBlock with Dialog UI is intentionally NOT in the service.
  // PiDialogService + AlertDialogComponent are template concerns; page.ts wraps
  // the dialog flow and calls this.blocksSvc.remove() directly via templates.

  // ── Computed signals ───────────────────────────────────────────────

  readonly selectedBlock = computed<TemplateBlock | null>(() => {
    const id = this.selectedId();
    if (id) {
      return this.blocks().find((b) => blockKey(b) === id) ?? null;
    }
    const ids = this.selectedIds();
    if (ids.size === 1) {
      const only = Array.from(ids)[0];
      return this.blocks().find((b) => blockKey(b) === only) ?? null;
    }
    return null;
  });

  readonly selectedBlocks = computed<TemplateBlock[]>(() => {
    const ids = this.selectedIds();
    if (ids.size === 0) return [];
    return this.blocks().filter((b) => ids.has(blockKey(b)));
  });

  readonly headerSubtitle = computed<string>(() => {
    const id = this.templateId();
    if (!id) return 'Выберите шаблон для редактирования';
    const count = this.blocks().length;
    return `Шаблон ${id.slice(-6)} · ${count} ${pluralBlocks(count)}`;
  });

  readonly backgroundImages = computed<string[]>(() => {
    const t = this.template();
    if (!t) return [];
    const all = t.backgroundImage ?? [];
    const idx = t.defaultBackgroundIndex ?? -1;
    if (idx >= 0 && idx < all.length) return [all[idx]];
    return all;
  });

  readonly orientation = computed<'portrait' | 'landscape'>(() => {
    return this.template()?.orientation ?? 'portrait';
  });

  // ── public helpers ─────────────────────────────────────────────────

  persistSnapSettings(): void {
    saveSnapSettings({
      snapEnabled: this.snapEnabled(),
      gridSize: this.gridSize(),
      boundaryPadding: this.boundaryPadding(),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // TZ-235.A Round 2: HANDLER METHODS (extracted from page.ts)
  // ─────────────────────────────────────────────────────────────────

  // ── Selection handlers ─────────────────────────────────────────────
  onSelect(block: TemplateBlock): void {
    this.selectedId.set(blockKey(block));
    this.selectedIds.set(new Set());
    this.templateSelected.set(false);
  }

  onMultiSelect(block: TemplateBlock): void {
    const key = blockKey(block);
    const ids = new Set(this.selectedIds());
    if (ids.has(key)) {
      ids.delete(key);
    } else {
      ids.add(key);
    }
    this.selectedIds.set(ids);
    if (ids.size > 0) {
      this.selectedId.set(null);
      this.templateSelected.set(false);
    }
  }

  onCanvasClick(): void {
    this.selectedId.set(null);
    this.selectedIds.set(new Set());
    this.templateSelected.set(true);
  }

  onCloseInspectorPanel(): void {
    this.templateSelected.set(false);
    this.selectedId.set(null);
  }

  // ── Dropdown handlers ─────────────────────────────────────────────
  toggleDropdown(name: string): void {
    this.openDropdown.update((current) => (current === name ? null : name));
  }

  closeDropdown(): void {
    this.openDropdown.set(null);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.openDropdown() === null) return;
    const target = event.target as HTMLElement;
    if (target.closest('.builder-dropdown')) return;
    this.openDropdown.set(null);
  }

  // ── Snap settings (from inspector) ─────────────────────────────────
  onSnapSettingsChange(settings: {
    snapEnabled: boolean;
    gridSize: number;
    boundaryPadding?: number;
  }): void {
    this.snapEnabled.set(settings.snapEnabled);
    this.gridSize.set(settings.gridSize);
    if (settings.boundaryPadding !== undefined) {
      this.boundaryPadding.set(settings.boundaryPadding);
    }
    this.persistSnapSettings();
  }

  // ── Inspector + save handlers ──────────────────────────────────────
  onInspectorUpdate(patch: Partial<TemplateBlock> & { _id: string }): void {
    const { _id, ...rest } = patch;
    this.blocks.update((arr) => arr.map((b) => (b._id === _id ? { ...b, ...rest } : b)));
    this.saveBlock(_id, rest);
  }

  onBlockWidthChange(event: {
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
    this.saveBlock(block._id, { settings });
  }

  onOverlayMove(event: {
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
    this.saveBlock(block._id, { settings });
  }

  onOverlayResize(event: {
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
    this.saveBlock(block._id, { settings });
  }

  onMarginReset(blockId: string): void {
    const settings = { width: 100, marginLeft: 0 };
    this.blocks.update((arr) => arr.map((b) => (b._id === blockId ? { ...b, settings } : b)));
    this.saveBlock(blockId, { settings });
  }

  onMultiMarginUpdate(
    updates: Array<{ _id: string; settings: Record<string, unknown> }>,
  ): void {
    for (const { _id, settings } of updates) {
      this.blocks.update((arr) => arr.map((b) => (b._id === _id ? { ...b, settings } : b)));
      this.saveBlock(_id, { settings });
    }
  }

  // ── OnEditSelected (router navigation) ─────────────────────────────
  onEditSelected(): void {
    const block = this.selectedBlock();
    if (!block) return;
    switch (block.type) {
      case 'text': {
        const textBlockId = block.dataBinding?.value;
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
        this.router.navigate(['/doc-constructor/tables']);
        break;
      default:
        break;
    }
  }

  // ── Initial load ──────────────────────────────────────────────────
  loadBlocks(id: string): void {
    this.isLoading.set(true);
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
          this.syncTextBlockSources();
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

  /**
   * Sync text block content from source text blocks.
   * When a text block is added to the template, its content is snapshotted.
   * This method refreshes the snapshot from the current source text block,
   * so edits on the texts page are reflected in the template.
   */
  private syncTextBlockSources(): void {
    const blocks = this.blocks();
    const textBlockIds = blocks
      .filter((b) => b.type === 'text' && b.dataBinding?.source === 'static' && b.dataBinding?.value)
      .map((b) => b.dataBinding!.value!)
      .filter((id): id is string => !!id);

    if (textBlockIds.length === 0) return;

    this.textBlocksSvc.list({ activeOnly: false }).subscribe({
      next: (res) => {
        if (!res.ok) return;
        const sourceMap = new Map(res.data.items.map((tb) => [tb._id, tb]));
        let changed = false;

        const updated = blocks.map((b) => {
          if (b.type !== 'text' || b.dataBinding?.source !== 'static' || !b.dataBinding?.value) return b;
          const source = sourceMap.get(b.dataBinding.value);
          if (!source) return b;
          const newContent = source.content ?? '';
          const newColumns = source.columns;
          if (b.content === newContent && JSON.stringify(b.columns) === JSON.stringify(newColumns)) return b;
          changed = true;
          return { ...b, content: newContent, columns: newColumns };
        });

        if (changed) {
          this.blocks.set(updated);
          for (const block of updated) {
            if (block._id) {
              this.blocksSvc.update(block._id, {
                content: block.content,
                columns: block.columns,
              }).subscribe();
            }
          }
        }
      },
    });
  }

  // ── Block creation (palette + drop) ───────────────────────────────
  onAddBlock(payload: AddBlockPayload): void {
    this.insertBlock(payload, this.blocks().length);
  }

  onDropAdd(event: { payload: AddBlockPayload; insertIndex: number }): void {
    const idx = Math.max(0, Math.min(event.insertIndex, this.blocks().length));
    this.insertBlock(event.payload, idx);
  }

  onAddTextBlock(t: {
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

  onAddTableTemplate(t: {
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

  onAddSpacer(): void {
    this.onAddBlock({ source: 'block-type', type: 'spacer' });
  }

  onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
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
      settings: { imageUrl: localUrl, overlay: true },
    };
    this.insertNewBlock(block, file);
    input.value = '';
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
          content: payload.textBlock.content ?? '',
          columns: payload.textBlock.columns?.map((c) => ({
            id: c.id,
            content: c.content ?? '',
            width: c.width ?? 1,
          })),
          dataBinding: {
            source: 'static' as DataBindingSource,
            value: payload.textBlock._id ?? '',
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

  /** Insert a block at the given index. Optimistic update + server add. */
  insertBlock(payload: AddBlockPayload, insertIndex: number): void {
    const tid = this.templateId();
    if (!tid) {
      this.toast.error('Сначала выберите шаблон');
      return;
    }
    const order = insertIndex;
    const newBlock = this.buildBlockFromPayload(tid, payload, order);
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
          this.blocks.update((arr) =>
            arr.map((b) => (b.tempId === newBlock.tempId ? res.data : b)),
          );
          this.selectedId.set(res.data._id ?? null);
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

  /** Insert a pre-built block (used by photo upload). */
  insertNewBlock(newBlock: TemplateBlock, file?: File): void {
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

          if (file && res.data._id) {
            this.blocksSvc.uploadImage(res.data._id, file).subscribe({
              next: (uploadRes) => {
                if (uploadRes.ok) {
                  this.blocks.update((arr) =>
                    arr.map((b) =>
                      b._id === res.data._id
                        ? { ...b, settings: { ...(b.settings ?? {}), imageUrl: uploadRes.data.url } }
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

  // ── Delete + reorder ──────────────────────────────────────────────
  onDeleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.size === 0) return;

    const previous = this.blocks();
    const toDelete = previous.filter((b) => ids.has(blockKey(b)));
    const remaining = previous.filter((b) => !ids.has(blockKey(b)));

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

  onReorder(next: TemplateBlock[]): void {
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
          this.blocks.set(previous);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractErrorMessage(err));
        this.blocks.set(previous);
      },
    });
  }

  // ── Save pipeline result handler ──────────────────────────────────
  handleSaveResult(res: SilentResult<TemplateBlock>): void {
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
    const myTick = ++this.savedTick;
    timer(2000).subscribe(() => {
      if (myTick === this.savedTick) this.saveStatus.set('idle');
    });
  }

  // ── Public reload entry point ─────────────────────────────────────
  onReload(): void {
    const tid = this.templateId();
    if (tid) this.loadBlocks(tid);
  }

  // ── Template picker navigation ────────────────────────────────────
  onTemplatePick(value: string | null): void {
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
}
