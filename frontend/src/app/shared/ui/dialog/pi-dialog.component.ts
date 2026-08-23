import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { PI_DIALOG_REF } from './dialog.tokens';
import type { DialogRef } from './pi-dialog.service';

/**
 * Paper & Ink Dialog component — polymorphic shell with 4 templates:
 *   - alert (T1): sm, compact padding, single-button confirm flow
 *   - form (T2): md/lg/xl, spacious padding, label + input form
 *   - content (T3): xl, spacious + sticky footer, long scrollable body
 *   - destructive (T4): md/lg, spacious + ⚠ icon, confirm-or-cancel
 *
 * Per TZ-90 spec §B.1, panelClass() follows the canonical 4×4 table.
 * Unsupported combinations fall back to the closest supported equivalent
 * (e.g. alert × md → alert × sm).
 *
 * Always opened via PiDialogService.open() which provides PI_DIALOG_REF.
 * No standalone fallback: this component requires the dialog lifecycle.
 */
@Component({
  selector: 'app-pi-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [attr.role]="variant() === 'alert' ? 'alertdialog' : 'dialog'"
      [attr.aria-label]="effectiveLabel()"
      [attr.aria-modal]="true"
      [class]="panelClass()"
      [style.max-width]="maxWidth()"
      [class.pi-dialog-host-open]="animate()"
    >
      @if (title() || showClose()) {
        <header [class]="headerClass()">
          @if (variant() === 'destructive') {
            <span
              class="text-destructive mr-2 inline-flex items-center"
              aria-hidden="true"
              data-test="dialog-destructive-icon"
              >⚠</span
            >
          }
          <h2 class="font-display text-lg tracking-tight text-ink flex-1 min-w-0 truncate">
            {{ title() }}
          </h2>
          @if (showClose()) {
            <button
              type="button"
              class="inline-flex items-center justify-center w-8 h-8 rounded-sm hairline bg-paper hover:bg-paper-2 pi-focus-ring shrink-0 ml-2"
              (click)="onUserClose()"
              aria-label="Закрыть"
            >
              <span aria-hidden="true" class="text-base leading-none">×</span>
            </button>
          }
        </header>
      }
      <div [class]="bodyClass()">
        <ng-content select="[body]" />
      </div>
      <footer [class]="footerClass()">
        <ng-content select="[footer]" />
      </footer>
    </div>
  `,
  host: {
    class: 'block',
  },
})
export class PiDialogComponent {
  /** Provided by PiDialogService.open() via child DI injector. */
  readonly ref = inject<DialogRef<unknown>>(PI_DIALOG_REF);

  /** Dialog template (per TZ-90 §B.1 canonical 4×4 table). */
  readonly variant = input<'alert' | 'form' | 'content' | 'destructive'>('form');

  /** Dialog width tier. Default = md. xl = 800px is supported for form/content. */
  readonly width = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  readonly title = input<string>('');
  readonly showClose = input<boolean>(true);
  readonly ariaLabel = input<string | null>(null);

  /**
   * Optional max-width override. When set, replaces the standard width
   * for the dialog (e.g. '1000px' to make the text-block editor wider).
   * Only applies to the form variant (T2).
   */
  readonly maxWidth = input<string | null>(null);

  /**
   * Animation opt-in (TZ-90 §A.5). PiDialogService.open() can override this
   * to false per-dialog (e.g. for first-render dialogs that should appear
   * instantly). Default true — fade-in + scale 0.96→1.0 over 180ms.
   * Respects @media (prefers-reduced-motion: reduce) globally.
   */
  readonly animate = input<boolean>(true);

  /**
   * Emitted ONLY when the user explicitly closes via the X button.
   * Programmatic closes (ESC, backdrop, ref.close(v)) are observable via
   * `ref.closed` (a signal) — not this output.
   */
  readonly userClose = output<void>();

  /**
   * Canonical panelClass per TZ-90 §B.1 (4×4 variant×width table).
   * Unsupported combos (e.g. alert × xl) fall back to the closest supported
   * equivalent so callers don't have to memorize the table.
   */
  readonly panelClass = computed<string>(() => {
    // The shell owns the viewport boundary. Header/footer are non-shrinking;
    // the body receives the remaining height and becomes the only scroll region.
    const base = 'bg-paper hairline rounded-sm overflow-hidden flex flex-col max-h-[90vh] min-h-0';
    return `${base} ${this.dimensionClass()}`;
  });

  /**
   * Header padding per variant (TZ-90 §B.1 canonical mapping):
   *   - alert:  компактнее (px-4 py-3)
   *   - form:    px-6 py-4
   *   - content: px-6 py-4 + bg-paper (prevents body bleed-through when scrolled)
   *   - destructive: px-6 py-4 + ⚠ icon prefix (rendered in template)
   */
  readonly headerClass = computed<string>(() => {
    const v = this.variant();
    const hairlineB = 'hairline-b';
    const base = `flex items-center justify-between ${hairlineB} shrink-0`;
    if (v === 'alert') return `${base} px-4 py-3`;
    if (v === 'content') return `${base} px-6 py-4 bg-paper`;
    return `${base} px-6 py-4`;
  });

  /**
   * Body padding per variant. Form/content/destructive bodies share the
   * canonical scroll contract: flex: 1, min-height: 0 and overflow-y:auto.
   * This keeps long forms usable without moving action buttons off-screen.
   */
  readonly bodyClass = computed<string>(() => {
    const v = this.variant();
    if (v === 'alert') return 'px-4 py-3 text-sm text-ink flex-1 min-h-0 overflow-y-auto';
    if (v === 'content') return 'px-6 py-6 text-sm text-ink flex-1 min-h-0 overflow-y-auto';
    return 'px-6 py-6 text-sm text-ink flex-1 min-h-0 overflow-y-auto';
  });

  /**
   * Footer padding per variant. TL;DR: the footer is ALWAYS a non-shrinking
   * sibling of the body, anchored to the bottom of the panel via the
   * flex column, AND additionally `sticky bottom-0 bg-paper` so that any
   * inner-form content (PiRows inside PiDialogs that grow on add) cannot
   * visually push «Сохранить/Отмена» off-screen.
   *
   * The flex-column + min-h-0 contract in bodyClass guarantees the scroll
   * region is the body, not the panel — combined with `sticky bottom-0`
   * the actions are visually pinned even on very long forms.
   */
  readonly footerClass = computed<string>(() => {
    const v = this.variant();
    const base =
      'hairline-t px-6 py-4 flex justify-end gap-3 items-center shrink-0 sticky bottom-0 bg-paper';
    if (v === 'alert') {
      return 'hairline-t px-4 py-3 flex justify-end gap-3 items-center shrink-0 sticky bottom-0 bg-paper';
    }
    return base;
  });

  /**
   * Aria label chain: visual title → accessibility-only label → screen-reader fallback.
   * Computed for consistency with panelClass/headerClass/bodyClass/footerClass.
   */
  readonly effectiveLabel = computed<string>(() => {
    return this.title() || this.ariaLabel() || 'Диалог';
  });

  onUserClose(): void {
    this.userClose.emit();
    this.ref.close();
  }

  /**
   * Internal: maps (variant, width) → CSS dimension class per the
   * canonical 4×4 table. Unsupported combos (e.g. alert × xl) fall back
   * to the closest supported equivalent.
   *
   * NOTE: spec lists certain combos as "NOT SUPPORTED" but the practical
   * implementation needs sensible fallbacks so the component never renders
   * a dialog with the wrong width. The fallback table below mirrors the
   * spec but routes every combo to a valid (variant, width) cell.
   */
  private dimensionClass(): string {
    const v = this.variant();
    const w = this.width();
    const mw = this.maxWidth();

    // maxWidth is handled by [style.max-width] binding in template (Tailwind JIT-safe)
    // If maxWidth is set, use w-full so the dialog fills the overlay pane; otherwise
    // use the standard width from the variant/width table.
    if (mw) {
      return 'w-full'; // width controlled by [style.max-width]
    }

    // TZ-DOC-340 — clamp every tier to viewport (mobile 375px).
    // === FORM (T2) — all 4 widths supported ===
    if (v === 'form') {
      return {
        sm: 'w-[min(360px,calc(100vw-2rem))]',
        md: 'w-[min(480px,calc(100vw-2rem))]',
        lg: 'w-[min(640px,calc(100vw-2rem))]',
        // TZ-UX-DIALOG-302 — form xl bump for balanced QuickCreate L (2-col).
        xl: 'w-[min(920px,calc(100vw-2rem))]',
      }[w];
    }

    // === ALERT (T1) — sm only, fallback to sm ===
    if (v === 'alert') {
      return 'w-[min(360px,calc(100vw-2rem))]';
    }

    // === CONTENT (T3) — xl only, fallback to max-w 800 ===
    if (v === 'content') {
      return 'w-full max-w-[min(800px,calc(100vw-2rem))]';
    }

    // === DESTRUCTIVE (T4) — md default, lg supported; sm/xl → md fallback ===
    if (v === 'destructive') {
      return {
        sm: 'w-[min(480px,calc(100vw-2rem))]',
        md: 'w-[min(480px,calc(100vw-2rem))]',
        lg: 'w-[min(640px,calc(100vw-2rem))]',
        xl: 'w-[min(480px,calc(100vw-2rem))]',
      }[w];
    }

    return 'w-[min(480px,calc(100vw-2rem))]';
  }
}
