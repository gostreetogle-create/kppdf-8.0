import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type LabelVariant = 'default' | 'eyebrow' | 'mono';

/**
 * Label — editorial typography primitive for Paper & Ink.
 * Renders a `<label>` element with variant-aware typography and
 * optional destructive-ink asterisk for required fields.
 *
 * TZ-94 BREAKING: `required` decoupled from `variant`. Use
 * `variant="eyebrow" [required]="true"` for required eyebrow labels.
 * Pre-TZ-94 `variant="required"` removed; no external callers
 * (verified 2026-07-12 at TZ-94 archival).
 *
 * Standalone, OnPush, signal-based. No Material, no shadows.
 */
@Component({
  selector: 'app-pi-label',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      [attr.for]="htmlFor()"
      [class]="computedClass()"
    >
      <ng-content />
      @if (required()) {
        <span aria-hidden="true" class="text-destructive ml-0.5">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  readonly variant = input<LabelVariant>('default');
  readonly required = input<boolean>(false);
  readonly htmlFor = input<string | null>(null);

  readonly computedClass = computed(() => {
    const v = this.variant();
    switch (v) {
      case 'eyebrow':
        return 'eyebrow';
      case 'mono':
        return 'font-mono text-xs text-ink';
      case 'default':
      default:
        return 'text-sm font-medium text-ink';
    }
  });
}
