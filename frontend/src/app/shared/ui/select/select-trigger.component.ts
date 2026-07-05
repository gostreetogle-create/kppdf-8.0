import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SelectSize } from './select.component';

/**
 * SelectTrigger — Paper & Ink select button face.
 * Pure visual; reads selection through `<ng-content selected-label>` projection
 * from parent Select. Pressing the trigger is handled by SelectComponent's
 * native `listbox` div.
 */
@Component({
  selector: 'app-pi-select-trigger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [class]="computedClass()" aria-haspopup="listbox">
      <span class="truncate flex-1 text-left text-ink">
        <ng-content />
      </span>
      <span aria-hidden="true" class="ml-2 text-muted mono text-[10px]">▾</span>
    </button>
  `,
})
export class SelectTriggerComponent {
  readonly size = input<SelectSize>('md');

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
