/**
 * BuilderInspectorStateService — extracted state, computations, hydration
 * effects, and all form-mutating handlers for `BuilderInspectorComponent` and
 * its 3 mode-specific sub-components.
 *
 * TZ-235.C. Migrated from `builder-inspector.component.ts` (1856 lines →
 * decomposed into 5 focused files). Goal: SAFE addition of:
 *   - Undo/redo (TZ-235.E) — history stack lives here
 *   - Magnetic grid guides (snapping visualization) — extends snap settings
 *   - Group drag margin updates (TZ-235.D) — multi-select extension
 *   - Color picker for template — new signal + handler
 *   - Per-block inspector sub-form (e.g. cell-column-format dropdown)
 *
 * All logic preserves the original behavior verbatim. The only changes:
 *   - Inputs are mirrored via private writable signals (parent switcher
 *     forwards via effect())
 *   - Outputs use private Subject<> channels (parent switcher subscribes
 *     with takeUntilDestroyed() and re-emits as Angular output())
 *   - All private vs public method visibility preserved
 *
 * Scope (this batch — TZ-235.C):
 *   - 9 mirrored input signals (block / selectedCount / selectedBlocks /
 *     paperWidth / templateSelected / template / allBlocks / snapEnabled /
 *     gridSize / boundaryPadding)
 *   - 17 form-state signals (title / content / height / isActive / showLine /
 *     bindingValue / blockWidth / blockMarginLeft + 7 image signals +
 *     3 snap local signals)
 *   - 12 output Subjects + 1 debounced Subject (textInput$)
 *   - 11 computed (opacityPercent / blockCount / activeBlockCount /
 *     blockTypeSummary / marginLeftPx / marginRightPx / maxMarginLeftPx /
 *     maxMarginRightPx / multiMarginLeftPx / multiMarginRightPx /
 *     settingsTableId)
 *   - 2 effects in constructor (hydrate form-state when block changes;
 *     hydrate snap-local when snap inputs change)
 *   - ~30 handlers (single + multi + template + image + snap,
 *     character-identical to original)
 *   - 1 debounced subscription in constructor (textInput$ →
 *     templateUpdate emit with 300ms debounce)
 *
 * Lifetime: COMPONENT-SCOPED via `providers: [BuilderInspectorStateService]`
 * on the `BuilderInspectorComponent` switcher's `@Component` decorator.
 * Same rationale as TZ-235.A R3 / TZ-235.B:
 *   - `providedIn: 'root'` would share form-state across any second
 *     inspector instance (not desired — independent edit context)
 *   - Per-instance guarantees state dies with the switcher.
 */
import {
  Injectable,
  computed,
  effect,
  signal,
} from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { BLOCK_TYPE_LABELS } from '../../../shared/template-block/template-block.types';
import type {
  BlockType,
  DataBinding,
  TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

@Injectable()
export class BuilderInspectorStateService {
  // ─────────────────────────────────────────────────────────────────
  // MIRRORED INPUT SIGNALS — parent switcher forwards writer-side
  // ─────────────────────────────────────────────────────────────────
  readonly block = signal<TemplateBlock | null>(null);
  readonly selectedCount = signal<number>(0);
  readonly selectedBlocks = signal<TemplateBlock[]>([]);
  readonly paperWidth = signal<number>(720);
  readonly templateSelected = signal<boolean>(false);
  readonly template = signal<DocumentTemplate | null>(null);
  readonly allBlocks = signal<TemplateBlock[]>([]);
  readonly snapEnabled = signal<boolean>(true);
  readonly gridSize = signal<number>(20);
  readonly boundaryPadding = signal<number>(8);

  // ─────────────────────────────────────────────────────────────────
  // FORM-STATE SIGNALS — mirrored snapshots of selected block for fast edits
  // ─────────────────────────────────────────────────────────────────
  readonly title = signal<string>('');
  readonly content = signal<string>('');
  readonly height = signal<number>(100);
  readonly isActive = signal<boolean>(true);
  readonly showLine = signal<boolean>(false);
  readonly bindingValue = signal<string>('');
  readonly blockWidth = signal<number>(100);
  readonly blockMarginLeft = signal<number>(0);

  // Image block signals
  readonly imageUrl = signal<string>('');
  readonly imageWidth = signal<number | null>(null);
  readonly imageHeight = signal<number | null>(null);
  readonly imageOverlay = signal<boolean>(false);
  readonly overlayLeft = signal<number>(0);
  readonly overlayTop = signal<number>(0);

  // ─────────────────────────────────────────────────────────────────
  // SNAP SETTINGS LOCAL STATE — user-editable copy
  // ─────────────────────────────────────────────────────────────────
  readonly localSnapEnabled = signal<boolean>(true);
  readonly localGridSize = signal<number>(20);
  readonly localBoundaryPadding = signal<number>(8);

  // ─────────────────────────────────────────────────────────────────
  // DEBOUNCED TEXT INPUT — for template header/footer to prevent jumping
  // ─────────────────────────────────────────────────────────────────
  private readonly textInput$ = new Subject<{ key: string; value: string }>();

  // ─────────────────────────────────────────────────────────────────
  // 12 OUTPUT SUBJECTS — boundary channels. Parent switcher
  // subscribes & re-emits as Angular output().
  // ─────────────────────────────────────────────────────────────────
  private readonly updateSub = new Subject<Partial<TemplateBlock> & { _id: string }>();
  readonly update$ = this.updateSub.asObservable();

  private readonly deleteSub = new Subject<string>();
  readonly delete$ = this.deleteSub.asObservable();

  private readonly deleteSelectedSub = new Subject<void>();
  readonly deleteSelected$ = this.deleteSelectedSub.asObservable();

  private readonly editSelectedSub = new Subject<void>();
  readonly editSelected$ = this.editSelectedSub.asObservable();

  private readonly marginResetSub = new Subject<string>();
  readonly marginReset$ = this.marginResetSub.asObservable();

  private readonly multiMarginUpdateSub = new Subject<Array<{ _id: string; settings: Record<string, unknown> }>>();
  readonly multiMarginUpdate$ = this.multiMarginUpdateSub.asObservable();

  private readonly templateUpdateSub = new Subject<Partial<DocumentTemplate>>();
  readonly templateUpdate$ = this.templateUpdateSub.asObservable();

  private readonly uploadBackgroundSub = new Subject<File>();
  readonly uploadBackground$ = this.uploadBackgroundSub.asObservable();

  private readonly removeBackgroundSub = new Subject<number>();
  readonly removeBackground$ = this.removeBackgroundSub.asObservable();

  private readonly setDefaultBackgroundSub = new Subject<number>();
  readonly setDefaultBackground$ = this.setDefaultBackgroundSub.asObservable();

  private readonly snapSettingsChangeSub = new Subject<{ snapEnabled: boolean; gridSize: number; boundaryPadding?: number }>();
  readonly snapSettingsChange$ = this.snapSettingsChangeSub.asObservable();

  private readonly closePanelSub = new Subject<void>();
  readonly closePanel$ = this.closePanelSub.asObservable();

  // ─────────────────────────────────────────────────────────────────
  // 11 COMPUTED SIGNALS
  // ─────────────────────────────────────────────────────────────────

  readonly opacityPercent = computed<number>(() => {
    const t = this.template();
    return Math.round((t?.backgroundOpacity ?? 0.3) * 100);
  });

  // TZ-211: Document summary computed values
  readonly blockCount = computed<number>(() => this.allBlocks().length);
  readonly activeBlockCount = computed<number>(() =>
    this.allBlocks().filter((b) => b.isActive).length,
  );
  readonly blockTypeSummary = computed<string>(() => {
    const blocks = this.allBlocks();
    if (blocks.length === 0) return 'Нет блоков';
    const types = new Map<string, number>();
    for (const b of blocks) {
      types.set(b.type, (types.get(b.type) ?? 0) + 1);
    }
    return Array.from(types.entries())
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
  });

  // Derived — pixel values for single block
  readonly marginLeftPx = computed<number>(() => {
    return Math.round((this.blockMarginLeft() / 100) * this.paperWidth());
  });
  readonly marginRightPx = computed<number>(() => {
    const rightPercent = 100 - this.blockWidth() - this.blockMarginLeft();
    return Math.round((rightPercent / 100) * this.paperWidth());
  });
  readonly maxMarginLeftPx = computed<number>(() => {
    return Math.round((80 / 100) * this.paperWidth());
  });
  readonly maxMarginRightPx = computed<number>(() => {
    return Math.round(((100 - this.blockMarginLeft() - 20) / 100) * this.paperWidth());
  });

  // Derived — pixel values for multi-select (common values or null)
  readonly multiMarginLeftPx = computed<number | null>(() => {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return null;
    const values = blocks.map((b) => {
      const s = b.settings as Record<string, unknown> | undefined;
      return typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
    });
    const first = values[0];
    return values.every((v) => v === first) ? Math.round((first / 100) * this.paperWidth()) : null;
  });
  readonly multiMarginRightPx = computed<number | null>(() => {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return null;
    const values = blocks.map((b) => {
      const s = b.settings as Record<string, unknown> | undefined;
      const w = typeof s?.['width'] === 'number' ? s['width'] : 100;
      const ml = typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
      return 100 - w - ml;
    });
    const first = values[0];
    return values.every((v) => v === first) ? Math.round((first / 100) * this.paperWidth()) : null;
  });

  readonly settingsTableId = computed<string | null>(() => {
    const b = this.block();
    if (!b || b.type !== 'table') return null;
    const settings = b.settings as { tableTemplateId?: string } | undefined;
    return settings?.tableTemplateId ?? null;
  });

  // ─────────────────────────────────────────────────────────────────
  // CONSTRUCTOR — 2 hydration effects + 1 debounced subscription
  // ─────────────────────────────────────────────────────────────────

  constructor() {
    // 1. Whenever the selected block changes, hydrate the form signals.
    effect(() => {
      const b = this.block();
      this.title.set(b?.title ?? '');
      this.content.set(b?.content ?? '');
      this.height.set(b?.height ?? 100);
      this.isActive.set(b?.isActive ?? true);
      this.showLine.set(b?.showLine ?? false);
      this.bindingValue.set(b?.dataBinding?.value ?? '');
      // Hydrate margin signals from settings
      const settings = b?.settings as Record<string, unknown> | undefined;
      const w = typeof settings?.['width'] === 'number' ? settings['width'] : 100;
      const ml = typeof settings?.['marginLeft'] === 'number' ? settings['marginLeft'] : 0;
      this.blockWidth.set(Math.max(20, Math.min(100, w)));
      this.blockMarginLeft.set(Math.max(0, Math.min(80, ml)));
      // Hydrate image signals
      this.imageUrl.set((settings?.['imageUrl'] as string) ?? '');
      this.imageWidth.set((settings?.['imageWidth'] as number) ?? null);
      this.imageHeight.set((settings?.['imageHeight'] as number) ?? null);
      this.imageOverlay.set((settings?.['overlay'] as boolean) ?? false);
      this.overlayLeft.set((settings?.['overlayLeft'] as number) ?? 0);
      this.overlayTop.set((settings?.['overlayTop'] as number) ?? 0);
    });

    // 2. Hydrate snap settings from inputs when they change.
    effect(() => {
      this.localSnapEnabled.set(this.snapEnabled());
      this.localGridSize.set(this.gridSize());
      this.localBoundaryPadding.set(this.boundaryPadding());
    });

    // 3. Debounced text input for template properties
    this.textInput$.pipe(debounceTime(300)).subscribe(({ key, value }) => {
      this.templateUpdateSub.next({ [key]: value } as Partial<DocumentTemplate>);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PURE HELPERS
  // ─────────────────────────────────────────────────────────────────

  typeLabel(b: TemplateBlock): string {
    return BLOCK_TYPE_LABELS[b.type as BlockType] ?? b.type;
  }

  /** Helper to patch the currently-selected block with a partial. */
  private patch(partial: Partial<TemplateBlock>): void {
    const b = this.block();
    if (!b?._id) return;
    this.updateSub.next({ _id: b._id, ...partial });
  }

  /** Helper to patch block.settings with partial updates. */
  private patchSettings(partial: Record<string, unknown>): void {
    const b = this.block();
    if (!b?._id) return;
    const current = (b.settings ?? {}) as Record<string, unknown>;
    this.updateSub.next({ _id: b._id, settings: { ...current, ...partial } });
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Block form (text/content/height/isActive/showLine/del)
  // ─────────────────────────────────────────────────────────────────

  onTitleInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.title.set(v);
    this.patch({ title: v });
  }

  onContentInput(event: Event): void {
    const v = (event.target as HTMLTextAreaElement).value;
    this.content.set(v);
    this.patch({ content: v });
  }

  onHeightInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 100;
    this.height.set(v);
    this.patch({ height: v });
  }

  onIsActiveChange(checked: boolean): void {
    this.isActive.set(checked);
    this.patch({ isActive: checked });
  }

  onShowLineChange(checked: boolean): void {
    this.showLine.set(checked);
    this.patch({ showLine: checked });
  }

  onBindingValueInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.bindingValue.set(v);
    const b = this.block();
    if (!b?._id || !b.dataBinding) return;
    const next: DataBinding = { ...b.dataBinding, value: v };
    this.updateSub.next({ _id: b._id, dataBinding: next });
  }

  onDelete(): void {
    const b = this.block();
    if (!b?._id) return;
    this.deleteSub.next(b._id);
  }

  // ── Trigger methods (fire-and-forget outputs for sub-component bridges) ──
  // These let sub-component templates call e.g. `state.triggerDeleteSelected()`
  // to request an emitted event WITHOUT doing any service-side state mutation.
  // The switcher subscribes to the underlying Subject and re-emits as Angular output.

  /** Trigger: request deletion of all currently-selected block(s). */
  triggerDeleteSelected(): void {
    this.deleteSelectedSub.next();
  }

  /** Trigger: request edit of the currently-selected single block. */
  triggerEditSelected(): void {
    this.editSelectedSub.next();
  }

  /** Trigger: request closing the template properties panel. */
  triggerClosePanel(): void {
    this.closePanelSub.next();
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Snap settings
  // ─────────────────────────────────────────────────────────────────

  onSnapEnabledChange(enabled: boolean): void {
    this.localSnapEnabled.set(enabled);
    this.emitSnapSettings();
  }

  onGridSizeInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 20;
    const clamped = Math.max(5, Math.min(50, v));
    this.localGridSize.set(clamped);
    this.emitSnapSettings();
  }

  onBoundaryPaddingInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 8;
    const clamped = Math.max(0, Math.min(100, v));
    this.localBoundaryPadding.set(clamped);
    this.emitSnapSettings();
  }

  private emitSnapSettings(): void {
    this.snapSettingsChangeSub.next({
      snapEnabled: this.localSnapEnabled(),
      gridSize: this.localGridSize(),
      boundaryPadding: this.localBoundaryPadding(),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Template properties form (close/orient/size/settings/text/opacity/file)
  // ─────────────────────────────────────────────────────────────────

  onClosePanel(): void {
    this.closePanelSub.next();
  }

  onOrientationChange(orientation: 'portrait' | 'landscape'): void {
    this.templateUpdateSub.next({ orientation });
  }

  onPageSizeChange(pageSize: 'A3' | 'A4' | 'A5'): void {
    this.templateUpdateSub.next({ pageSize });
  }

  onTemplateSettingChange(key: string, value: boolean): void {
    this.templateUpdateSub.next({ [key]: value } as Partial<DocumentTemplate>);
  }

  onTemplateTextInput(key: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.textInput$.next({ key, value });
  }

  onOpacityInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.templateUpdateSub.next({ backgroundOpacity: value } as Partial<DocumentTemplate>);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadBackgroundSub.next(file);
    input.value = '';
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Image block (upload/remove/dimensions/overlay)
  // ─────────────────────────────────────────────────────────────────

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Create a local object URL for immediate display
    const url = URL.createObjectURL(file);
    this.imageUrl.set(url);
    this.patchSettings({ imageUrl: url });
    input.value = '';
  }

  onRemoveImage(): void {
    this.imageUrl.set('');
    this.imageWidth.set(null);
    this.imageHeight.set(null);
    this.patchSettings({ imageUrl: '', imageWidth: null, imageHeight: null });
  }

  onImageWidthInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageWidth.set(num);
    this.patchSettings({ imageWidth: num });
  }

  onImageHeightInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    const num = v ? Number(v) : null;
    this.imageHeight.set(num);
    this.patchSettings({ imageHeight: null });
  }

  onImageOverlayToggle(checked: boolean): void {
    this.imageOverlay.set(checked);
    this.patchSettings({ overlay: checked });
  }

  onOverlayLeftInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 0;
    this.overlayLeft.set(v);
    this.patchSettings({ overlayLeft: v });
  }

  onOverlayTopInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value) || 0;
    this.overlayTop.set(v);
    this.patchSettings({ overlayTop: v });
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Background layers
  // ─────────────────────────────────────────────────────────────────

  onRemoveBackground(index: number): void {
    this.removeBackgroundSub.next(index);
  }

  onSetDefaultBackground(index: number): void {
    this.setDefaultBackgroundSub.next(index);
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Margin (single block)
  // ─────────────────────────────────────────────────────────────────

  onMarginLeftInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const rightPercent = 100 - this.blockWidth() - this.blockMarginLeft();
    const newWidth = Math.max(20, 100 - percent - rightPercent);
    this.blockMarginLeft.set(Math.round(percent));
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  onMarginRightInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    const newWidth = Math.max(20, 100 - this.blockMarginLeft() - rightPercent);
    this.blockWidth.set(Math.round(newWidth));
    this.emitMarginSettings();
  }

  onResetMargins(): void {
    this.blockWidth.set(100);
    this.blockMarginLeft.set(0);
    this.emitMarginSettings();
  }

  private emitMarginSettings(): void {
    const b = this.block();
    if (!b?._id) return;
    const settings = {
      ...(b.settings as Record<string, unknown> | undefined),
      width: this.blockWidth(),
      marginLeft: this.blockMarginLeft(),
    };
    this.updateSub.next({ _id: b._id, settings });
  }

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS — Margin (multi-select)
  // ─────────────────────────────────────────────────────────────────

  onMultiMarginLeftInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const percent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ marginLeft: Math.round(percent) });
  }

  onMultiMarginRightInput(event: Event): void {
    const px = Number((event.target as HTMLInputElement).value) || 0;
    const rightPercent = Math.max(0, Math.min(80, (px / this.paperWidth()) * 100));
    this.emitMultiMarginPatch({ rightMarginPercent: Math.round(rightPercent) });
  }

  onMultiResetMargins(): void {
    this.emitMultiMarginPatch({ marginLeft: 0, rightMarginPercent: 0 });
  }

  private emitMultiMarginPatch(patch: { marginLeft?: number; rightMarginPercent?: number }): void {
    const blocks = this.selectedBlocks();
    const updates = blocks
      .filter((b) => b._id)
      .map((b) => {
        const s = b.settings as Record<string, unknown> | undefined;
        const w = typeof s?.['width'] === 'number' ? s['width'] : 100;
        const ml = typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
        const rightPercent = 100 - w - ml;

        let newMl = ml;
        let newWidth = w;

        if (patch.marginLeft !== undefined) {
          newMl = patch.marginLeft;
          newWidth = Math.max(20, 100 - newMl - rightPercent);
        }
        if (patch.rightMarginPercent !== undefined) {
          newWidth = Math.max(20, 100 - newMl - patch.rightMarginPercent);
        }

        // Clamp values
        newMl = Math.max(0, Math.min(80, newMl));
        newWidth = Math.max(20, Math.min(100, newWidth));

        return {
          _id: b._id!,
          settings: { ...(s ?? {}), width: Math.round(newWidth), marginLeft: Math.round(newMl) },
        };
      });
    if (updates.length > 0) {
      this.multiMarginUpdateSub.next(updates);
    }
  }
}
