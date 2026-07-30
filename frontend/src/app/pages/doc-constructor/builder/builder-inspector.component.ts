/**
 * TZ-235.C — BuilderInspectorComponent (THIN SWITCHER).
 *
 * This component used to be a 1856-line god-component. It now has only one
 * job: dispatch to a mode-specific sub-component based on input signals.
 *
 * Modes dispatched (mutually exclusive):
 *   • Empty (no selection)         → inline empty + doc summary + snap settings
 *   • Template properties          → <app-template-properties-form>
 *   • Multi-select (2+ blocks)     → <app-multi-select-inspector>
 *   • Per-block inspector          → <app-block-inspector>
 *
 * All form-state, computeds, and handlers live in `BuilderInspectorStateService`
 * (per-instance via `providers: [BuilderInspectorStateService]`). Sub-components
 * inject the same service via Angular hierarchical DI and call its handlers
 * directly — no inputs/outputs needed on the sub-components.
 *
 * The switcher preserves the EXACT same 9 inputs + 12 outputs as the original
 * monolithic component, so `builder.page.ts` requires ZERO changes.
 *
 * Wiring flow:
 *   DOWN: page.ts → switcher.input() → effect() → service.signal
 *   UP:   service.Subject → switcher constructor subscription → switcher.output() → page.ts
 */
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, X } from 'lucide-angular';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { BuilderInspectorStateService } from './builder-inspector-state.service';
import { TemplatePropertiesFormComponent } from './template-properties-form.component';
import { BlockInspectorComponent } from './block-inspector.component';
import { MultiSelectInspectorComponent } from './multi-select-inspector.component';

@Component({
  selector: 'app-builder-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    TemplatePropertiesFormComponent,
    BlockInspectorComponent,
    MultiSelectInspectorComponent,
  ],
  // TZ-235.C: per-instance state service for ALL 4 child components to share.
  // Same rationale as TZ-235.A R3 / TZ-235.B — independent edit context per
  // inspector slot, no cross-instance leakage.
  providers: [BuilderInspectorStateService],
  template: `
    <aside class="inspector" aria-label="Свойства блока">
      <header class="inspector__header">
        <h2 class="inspector__title">Свойства</h2>
        @if (state.block(); as b) {
          <span class="inspector__type-pill">{{ state.typeLabel(b) }}</span>
        }
        @if (templateSelected()) {
          <button type="button" class="inspector__close" (click)="state.triggerClosePanel()" aria-label="Закрыть панель свойств">
            <lucide-icon [img]="CloseIcon" [size]="18"></lucide-icon>
          </button>
        }
      </header>

      @if (!block() && selectedCount() === 0 && !templateSelected()) {
        <!-- EMPTY / SUMMARY MODE — inline in switcher (small + cross-cutting) -->
        <div class="inspector__empty">
          <p class="inspector__empty-title">Ничего не выбрано</p>
          <p class="inspector__empty-hint">
            Кликните по блоку или на пустое место холста
          </p>
        </div>

        <!-- TZ-211: Document Summary -->
        @if (state.allBlocks().length > 0) {
          <div class="summary-section">
            <div class="props-section__header">
              <span class="props-section__number">00</span>
              <h3 class="props-section__title">Сводка документа</h3>
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-item__label">Всего блоков</span>
                <span class="summary-item__value">{{ state.blockCount() }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-item__label">Активных</span>
                <span class="summary-item__value">{{ state.activeBlockCount() }}</span>
              </div>
              <div class="summary-item summary-item--full">
                <span class="summary-item__label">Типы</span>
                <span class="summary-item__value summary-item__value--small">{{ state.blockTypeSummary() }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Snap settings -->
        <div class="props-section" style="margin-top: 16px; padding: 12px;">
          <div class="props-section__header">
            <span class="props-section__number">SNAP</span>
            <h3 class="props-section__title">Привязка к сетке</h3>
          </div>
          <div class="snap-controls">
            <label class="toggle-row">
              <div class="toggle-row__left">
                <span class="toggle-row__label">Привязка</span>
              </div>
              <input
                type="checkbox"
                class="toggle-checkbox"
                [checked]="state.localSnapEnabled()"
                (change)="state.onSnapEnabledChange($any($event.target).checked)"
              />
            </label>
            <div class="field">
              <span class="field__label">Шаг сетки (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="5"
                max="50"
                step="5"
                [value]="state.localGridSize()"
                (input)="state.onGridSizeInput($event)"
              />
            </div>
            <div class="field">
              <span class="field__label">Отступ от краёв (px)</span>
              <input
                class="field__input pi-focus-ring"
                type="number"
                min="0"
                max="100"
                [value]="state.localBoundaryPadding()"
                (input)="state.onBoundaryPaddingInput($event)"
              />
            </div>
          </div>
        </div>
      } @else if (templateSelected() && state.template(); as t) {
        <!-- TEMPLATE PROPERTIES MODE — delegated to sub-component -->
        <app-template-properties-form />
      } @else if (!block() && selectedCount() > 0) {
        <!-- MULTI-SELECT MODE — delegated to sub-component -->
        <app-multi-select-inspector />
      } @else {
        <!-- PER-BLOCK INSPECTOR MODE — delegated to sub-component -->
        <app-block-inspector />
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 320px;
        flex-shrink: 0;
        height: 100%;
        overflow-y: auto;
        background: var(--color-paper, #f8f9fa);
        border-left: 1px solid var(--color-rule, #d0c5af);
      }

      /* ── Header ── */
      .inspector__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;
        border-bottom: 1px solid var(--color-rule, #d0c5af);
        position: sticky;
        top: 0;
        background: var(--color-paper, #f8f9fa);
        z-index: 10;
      }

      .inspector__title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: var(--color-ink, #191c1d);
        margin: 0;
      }

      .inspector__type-pill {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--color-paper-2, #e1e3e4);
        color: var(--color-ink, #191c1d);
        padding: 2px 8px;
        border-radius: 2px;
        font-weight: 600;
      }

      .inspector__close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted, #7f7663);
        transition: all 100ms ease;
      }

      .inspector__close:hover {
        background: var(--color-paper-2, #e1e3e4);
        color: var(--color-ink, #191c1d);
      }

      /* ── Empty state ── */
      .inspector__empty {
        padding: 48px 16px;
        text-align: center;
      }

      .inspector__empty-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-muted, #7f7663);
        margin: 0 0 4px;
      }

      .inspector__empty-hint {
        font-size: 12px;
        color: var(--color-muted, #7f7663);
        margin: 0;
      }

      /* ═══ Document Summary — TZ-211 ═══ */
      .summary-section {
        margin-top: 16px;
        padding: 12px;
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 8px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .summary-item--full {
        grid-column: 1 / -1;
      }

      .summary-item__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-muted);
      }

      .summary-item__value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-ink);
      }

      .summary-item__value--small {
        font-size: 11px;
        font-weight: 400;
        color: var(--color-muted-strong);
      }

      /* ── Properties sections header (used in snap-settings + summary) ── */
      .props-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .props-section__header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .props-section__number {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        line-height: 14px;
        letter-spacing: 0.05em;
        color: var(--color-sunrise-warm, #735c00);
      }

      .props-section__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink, #191c1d);
        margin: 0;
      }

      /* ── Field (shared with snap-settings) ── */
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__input {
        width: 100%;
        padding: 10px 12px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-ink, #191c1d);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        box-sizing: border-box;
        transition: border-color 120ms ease;
      }

      .field__input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm, #735c00);
      }

      /* ── Toggle row (snap enabled) ── */
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
      }

      .toggle-row__left {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--color-muted, #7f7663);
      }

      .toggle-row__label {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--color-ink, #191c1d);
      }

      .toggle-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--color-sunrise-warm, #735c00);
        cursor: pointer;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
      }

      .snap-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `,
  ],
})
export class BuilderInspectorComponent {
  /** The currently-selected block (null = nothing selected). */
  readonly block = input<TemplateBlock | null>(null);
  /** Number of blocks in multi-select mode. */
  readonly selectedCount = input<number>(0);
  /** Selected blocks for multi-select margin computation. */
  readonly selectedBlocks = input<TemplateBlock[]>([]);
  /** Paper width in px (720 for portrait, 900 for landscape). */
  readonly paperWidth = input<number>(720);
  /** When true, show template properties instead of block properties. */
  readonly templateSelected = input<boolean>(false);
  /** Current template (for template properties panel). */
  readonly template = input<DocumentTemplate | null>(null);
  /** TZ-211: All blocks for summary/totals computation. */
  readonly allBlocks = input<TemplateBlock[]>([]);
  /** Snap-to-grid enabled (input from parent). */
  readonly snapEnabled = input<boolean>(true);
  /** Grid size for snapping (px) (input from parent). */
  readonly gridSize = input<number>(20);
  /** Padding from paper edges (px) (input from parent). */
  readonly boundaryPadding = input<number>(8);

  // ─────────────────────────────────────────────────────────────────
  // Outputs — VERBATIM 12 from the original monolithic component
  // ─────────────────────────────────────────────────────────────────
  readonly update = output<Partial<TemplateBlock> & { _id: string }>();
  readonly delete = output<string>();
  readonly deleteSelected = output<void>();
  readonly editSelected = output<void>();
  readonly marginReset = output<string>();
  readonly multiMarginUpdate = output<Array<{ _id: string; settings: Record<string, unknown> }>>();
  readonly templateUpdate = output<Partial<DocumentTemplate>>();
  readonly uploadBackground = output<File>();
  readonly removeBackground = output<number>();
  readonly setDefaultBackground = output<number>();
  readonly snapSettingsChange = output<{ snapEnabled: boolean; gridSize: number; boundaryPadding?: number }>();
  readonly closePanel = output<void>();

  protected readonly state = inject(BuilderInspectorStateService);

  // Icons
  protected readonly CloseIcon = X;

  constructor() {
    // ── DOWN: mirror switcher inputs → service signals ──
    effect(() => this.state.block.set(this.block()));
    effect(() => this.state.selectedCount.set(this.selectedCount()));
    effect(() => this.state.selectedBlocks.set(this.selectedBlocks()));
    effect(() => this.state.paperWidth.set(this.paperWidth()));
    effect(() => this.state.templateSelected.set(this.templateSelected()));
    effect(() => this.state.template.set(this.template()));
    effect(() => this.state.allBlocks.set(this.allBlocks()));
    effect(() => this.state.snapEnabled.set(this.snapEnabled()));
    effect(() => this.state.gridSize.set(this.gridSize()));
    effect(() => this.state.boundaryPadding.set(this.boundaryPadding()));

    // ── UP: service Subject → Angular output (12 forwardings) ──
    this.state.update$.pipe(takeUntilDestroyed()).subscribe((e) => this.update.emit(e));
    this.state.delete$.pipe(takeUntilDestroyed()).subscribe((e) => this.delete.emit(e));
    this.state.deleteSelected$.pipe(takeUntilDestroyed()).subscribe(() => this.deleteSelected.emit());
    this.state.editSelected$.pipe(takeUntilDestroyed()).subscribe(() => this.editSelected.emit());
    this.state.marginReset$.pipe(takeUntilDestroyed()).subscribe((e) => this.marginReset.emit(e));
    this.state.multiMarginUpdate$.pipe(takeUntilDestroyed()).subscribe((e) => this.multiMarginUpdate.emit(e));
    this.state.templateUpdate$.pipe(takeUntilDestroyed()).subscribe((e) => this.templateUpdate.emit(e));
    this.state.uploadBackground$.pipe(takeUntilDestroyed()).subscribe((e) => this.uploadBackground.emit(e));
    this.state.removeBackground$.pipe(takeUntilDestroyed()).subscribe((e) => this.removeBackground.emit(e));
    this.state.setDefaultBackground$.pipe(takeUntilDestroyed()).subscribe((e) => this.setDefaultBackground.emit(e));
    this.state.snapSettingsChange$.pipe(takeUntilDestroyed()).subscribe((e) => this.snapSettingsChange.emit(e));
    this.state.closePanel$.pipe(takeUntilDestroyed()).subscribe(() => this.closePanel.emit());
  }
}
