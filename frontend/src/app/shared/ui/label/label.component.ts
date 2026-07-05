import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type LabelVariant = 'default' | 'eyebrow' | 'mono' | 'required';

/**
 * Label — editorial typography primitive for Paper & Ink.
 * Renders a `<label>` element with variant-aware typography and
 * optional destructive-ink asterisk for required fields.
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
      @if (variant() === 'required') {
        <span aria-hidden="true" class="text-destructive ml-0.5">*</span>
      }
    </label>
  `,
})
export class LabelComponent {
  readonly variant = input<LabelVariant>('default');
  readonly htmlFor = input<string | null>(null);

  readonly computedClass = computed(() => {
    const v = this.variant();
    switch (v) {
      case 'eyebrow':
        return 'eyebrow';
      case 'mono':
        return 'font-mono text-xs text-ink';
      case 'required':
        return 'text-sm font-medium text-ink';
      case 'default':
      default:
        return 'text-sm font-medium text-ink';
    }
  });
}
