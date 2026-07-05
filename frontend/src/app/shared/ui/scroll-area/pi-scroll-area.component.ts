import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PiScrollOrientation = 'vertical' | 'horizontal' | 'both';

const ORIENTATION_CLASS: Record<PiScrollOrientation, string> = {
  vertical: 'overflow-x-hidden overflow-y-auto',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
};

/**
 * Paper & Ink editorial ScrollArea.
 *
 * Themed scrollbar — `scrollbar-width: thin` + `scrollbar-color: var(--color-rule) transparent`
 * for Firefox, ::-webkit-scrollbar rules for Webkit/Blink (Chromium, Safari).
 * Hairline 4px thumb, transparent track, NO rounded overlay scrollbar (Paper & Ink anti-bling).
 *
 * A11y: `role="region"` + `tabindex="0"` so keyboard users can Tab into the
 * scrollable region and use arrow-keys (default browser behavior, no JS needed).
 * `aria-label` defaults to "Прокручиваемая область".
 *
 * Standalone + OnPush + signal-based. No `any`, no OnInit/OnDestroy.
 */
@Component({
  selector: 'app-pi-scroll-area',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="region"
      tabindex="0"
      [attr.aria-label]="ariaLabel()"
      [class]="computedClass()"
      [style.max-height]="maxHeight()"
    >
      <ng-content />
    </div>
  `,
})
export class PiScrollAreaComponent {
  readonly maxHeight = input<string>('320px');
  readonly orientation = input<PiScrollOrientation>('vertical');
  readonly ariaLabel = input<string>('Прокручиваемая область');

  readonly orientationClass = computed(
    () => `${ORIENTATION_CLASS[this.orientation()]} pi-scroll-area--${this.orientation()}`,
  );

  /** Combined class string: base `pi-scroll-area` (for themed scrollbar rules in styles.css) + orientation class. */
  readonly computedClass = computed(
    () => `pi-scroll-area ${this.orientationClass()}`,
  );
}
