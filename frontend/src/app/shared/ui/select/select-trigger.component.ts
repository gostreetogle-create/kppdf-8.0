import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SelectSize } from './select.component';

/**
 * SelectTrigger — Paper & Ink select button face.
 * Pure visual; reads selection through `<ng-content selected-label>` projection
 * from parent Select. Pressing the trigger is handled by SelectComponent's
 * native `listbox` div.
 *
 * A11y: `aria-haspopup="listbox"` declares the popup pattern. `aria-label`
 * is propagated from the parent SelectComponent so the trigger has an
 * accessible name when no visible text is rendered yet (no option selected).
 */
@Component({
  selector: 'app-pi-select-trigger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class]="computedClass()"
      aria-haspopup="listbox"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="truncate flex-1 text-left text-ink">
        <ng-content />
      </span>
      <span aria-hidden="true" class="ml-2 text-muted mono text-[10px]">▾</span>
    </button>
  `,
})
export class SelectTriggerComponent {
  readonly size = input<SelectSize>('md');
  /** Accessible name for the trigger button (axe button-name). Falls through
   *  from parent <app-pi-select ariaLabel="...">. */
  readonly ariaLabel = input<string | null>(null);

  readonly computedClass = computed(() => {
    const isMd = this.size() === 'md';
    const sizeCls = isMd ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs';
    return [
      'inline-flex',
      'items-center',
      'w-full',
      'bg-paper',
      'border',
      'hairline',
      'border-rule',
      'rounded-sm',
      sizeCls,
      'hover:bg-paper-2',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ink',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-paper',
    ].join(' ');
  });
}
