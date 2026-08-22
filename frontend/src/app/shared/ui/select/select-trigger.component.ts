import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SelectSize } from './select.types';

/**
 * SelectTrigger — Paper & Ink select button face.
 * Emits `toggle` on click so the parent SelectComponent can open/close the
 * listbox panel. ARIA: aria-haspopup="listbox" + aria-expanded propagate the
 * popup pattern.
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
      [attr.aria-expanded]="open()"
      [attr.aria-label]="ariaLabel()"
      (click)="toggle.emit()"
    >
      <span class="truncate flex-1 text-left text-ink">
        <ng-content />
      </span>
      <span aria-hidden="true" class="ml-2 text-muted-foreground mono text-[10px]">▾</span>
    </button>
  `,
})
export class SelectTriggerComponent {
  readonly size = input<SelectSize>('md');
  /** Whether the parent listbox panel is open (used for aria-expanded). */
  readonly open = input<boolean>(false);
  /** Accessible name for the trigger button (axe button-name). Falls through
   *  from parent <app-pi-select ariaLabel="...">. */
  readonly ariaLabel = input<string | null>(null);

  /** Parent listens to close the open/close loop. */
  readonly toggle = output<void>();

  readonly computedClass = computed(() => {
    const isMd = this.size() === 'md';
    const sizeCls = isMd ? 'h-10 px-control-x text-sm' : 'h-8 px-3 text-xs';
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
