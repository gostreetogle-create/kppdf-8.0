/**
 * BuilderStateService — extracted state & data orchestration for the Конструктор
 * (Template Builder). Source-of-truth for all reactive state inside
 * `frontend/src/app/pages/doc-constructor/builder/`.
 *
 * TZ-235.A (Wave 1, Round 1). Migrated from `builder.page.ts` god-component
 * (1790 lines) to:
 *   - Make SAFE addition of snap guides (TZ-235.B), group drag (TZ-235.D),
 *     undo/redo (TZ-235.C), placeholders (TZ-235.E).
 *   - Reduce coupling between BuilderPage's Template (HTML/CSS) and its
 *     imperative action handlers.
 *
 * Scope (this batch — TZ-235.A round 1):
 *   - 14 signals (templateId / template / blocks / selectedId(s) / loading /
 *     creating / saveStatus / templateSelected / viewMode / snapEnabled /
 *     gridSize / boundaryPadding / openDropdown / sourceContext)
 *   - 5 computed (selectedBlock / selectedBlocks / headerSubtitle /
 *     backgroundImages / orientation)
 *   - 2 httpResource (toolbar dropdowns: textsRes / tablesRes)
 *   - private save$ Subject + savedTick counter (save pipeline plumbing)
 *   - localStorage persistence for snap settings
 *
 * Out of scope (next rounds):
 *   - 47 handler methods (onSelect / onMultiSelect / onInspectorUpdate / ...)
 *   - Constructor route watchers + save$ subscribe
 *   - Inventory loadBlocks / syncTextBlockSources orchestration
 *
 * Lifetime: COMPONENT-SCOPED. Registered via `providers: [BuilderStateService]`
 * on `BuilderPage`'s `@Component` decorator. Rationale (thinker verdict, 2026-07-30):
 *   - `providedIn: 'root'` pollutes state across SPA navigations
 *     (open Template A → back → open Template B → still has Template A's
 *     selection, blocks, etc.)
 *   - Component-scoped guarantees state dies when BuilderPage navigates away.
 *   - Two browser tabs have separate JS contexts anyway, no cross-tab bleed.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  blockKey,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

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
    // TZ-235.A Round 3 reviewer-fix 2026-07-30:
    // On 2026-07-26 we renamed `pi-builder-snap-settings` -> `kppdf.builder.snapSettings`.
    // End-users who had snap-settings saved before this rename would silently
    // lose their settings on next reload. One-shot migration: if the OLD key
    // is present, VALIDATE its JSON shape before copying to the NEW key then
    // remove the OLD key. (Without validation, malformed legacy JSON would
    // be copied verbatim and re-throw on every subsequent load — user stuck
    // silently on DEFAULT_SNAP forever.)
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
          // VALID legacy settings → COPY to new key then drop old. (Reviewer 2026-07-30:
          // earlier version only removed the legacy key without copying, silently
          // destroying user data on first reload.)
          localStorage.setItem(SNAP_SETTINGS_KEY, legacyRaw);
          localStorage.removeItem(LEGACY_SNAP_KEY);
        } else {
          // Legacy JSON parsed but doesn't match our shape — drop to avoid
          // re-evaluating same garbage forever on every reload.
          localStorage.removeItem(LEGACY_SNAP_KEY);
        }
      } catch {
        // Legacy value is not valid JSON — drop it to avoid silent failure.
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

// Russian plural-form for "блок" (moved from builder.page.ts).
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
  // ── Core state signals ────────────────────────────────────────────
  /** Active template id from route :id. null when in template-picker mode. */
  readonly templateId = signal<string | null>(null);
  /** Active DocumentTemplate (response of GET /document-templates/:id). */
  readonly template = signal<DocumentTemplate | null>(null);
  /** All TemplateBlock rows for the active template. */
  readonly blocks = signal<TemplateBlock[]>([]);
  /** Single-selected block id (string-id). null when nothing selected. */
  readonly selectedId = signal<string | null>(null);
  /** Multi-selected block id-set (≥1 ids). */
  readonly selectedIds = signal<Set<string>>(new Set());
  /** True during initial GET / template-blocks?templateId=… */
  readonly isLoading = signal<boolean>(false);
  /** True during POST /document-templates (create flow). */
  readonly isCreating = signal<boolean>(false);
  /** Auto-save pipeline status (idle / saving / saved / error). */
  readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  /** When true, inspector shows TEMPLATE properties instead of BLOCK properties. */
  readonly templateSelected = signal<boolean>(false);
  /** TZ-211: View mode toggle — editor (manipulate) | preview (rendered only). */
  readonly viewMode = signal<'editor' | 'preview'>('editor');

  // ── Snap settings (persisted to localStorage) ──────────────────────
  /** Snap-to-grid enabled for overlay blocks (persisted). */
  readonly snapEnabled = signal<boolean>(loadSnapSettings().snapEnabled);
  /** Grid size for snapping (px) (persisted). Default 20. */
  readonly gridSize = signal<number>(loadSnapSettings().gridSize);
  /** Padding from paper edges (px) (persisted). Default 0. */
  readonly boundaryPadding = signal<number>(loadSnapSettings().boundaryPadding);

  // ── UI ephemeral state ────────────────────────────────────────────
  /** Which toolbar dropdown is open (texts | tables | null). */
  readonly openDropdown = signal<string | null>(null);
  /** Phase E.3: source context for pre-binding (order/contract id). */
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
  /**
   * Auto-save Subject — private to the service. Handlers push via
   * `saveBlock(_id, patch)`. Page-level pipeline (groupBy / debounceTime /
   * switchMap / takeUntilDestroyed) subscribes via the public `saveEvents$`
   * observable. Round 4 will move the pipeline itself into the service.
   */
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();

  /** Read-only Observable view of the save sink. Page.ts subscribes here. */
  readonly saveEvents$: Observable<{ _id: string; patch: Partial<TemplateBlock> }> =
    this.save$.asObservable();

  /** Public API for handlers: enqueue a save operation. */
  saveBlock(_id: string, patch: Partial<TemplateBlock>): void {
    this.save$.next({ _id, patch });
  }

  // ── Computed signals ───────────────────────────────────────────────

  /**
   * Single "currently selected" block for the inspector.
   * - Single-click selection: read from `selectedId`.
   * - Multi-select with exactly 1 item: treat as single for the inspector.
   * - Multi-select with ≥2: returns null (use `selectedBlocks` instead).
   */
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

  /** All multi-selected blocks (used for group margin controls etc). */
  readonly selectedBlocks = computed<TemplateBlock[]>(() => {
    const ids = this.selectedIds();
    if (ids.size === 0) return [];
    return this.blocks().filter((b) => ids.has(blockKey(b)));
  });

  /** Header subtitle — shows last-6 of templateId + block count + plural. */
  readonly headerSubtitle = computed<string>(() => {
    const id = this.templateId();
    if (!id) return 'Выберите шаблон для редактирования';
    const count = this.blocks().length;
    return `Шаблон ${id.slice(-6)} · ${count} ${pluralBlocks(count)}`;
  });

  /** D.2.1: derived background images (respects defaultBackgroundIndex). */
  readonly backgroundImages = computed<string[]>(() => {
    const t = this.template();
    if (!t) return [];
    const all = t.backgroundImage ?? [];
    const idx = t.defaultBackgroundIndex ?? -1;
    if (idx >= 0 && idx < all.length) return [all[idx]];
    return all;
  });

  /** Page orientation for canvas sizing. */
  readonly orientation = computed<'portrait' | 'landscape'>(() => {
    return this.template()?.orientation ?? 'portrait';
  });

  // ── public helpers ─────────────────────────────────────────────────

  /** Persist current snap settings to localStorage. Called by handler. */
  persistSnapSettings(): void {
    saveSnapSettings({
      snapEnabled: this.snapEnabled(),
      gridSize: this.gridSize(),
      boundaryPadding: this.boundaryPadding(),
    });
  }

  // NOTE (TZ-235.A Round 3 reviewer): `savedTick` / `beginSavedTick()` /
  // `currentSavedTick` getter were removed. BuilderPage handlers hold their
  // own page-level tick counter for the 2s 'saved'->'idle' revert. Round 4
  // will move the save pipeline INTO this service (constructor + takeUntilDestroyed),
  // and a fresh monotonic counter will be re-introduced then if needed.

}
