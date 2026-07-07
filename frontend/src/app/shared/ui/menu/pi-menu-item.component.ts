import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type MenuItemType = 'default' | 'destructive' | 'separator';

/**
 * Paper & Ink MenuItem — single item inside <app-pi-dropdown-menu> (TZ-55).
 * Variants: default / destructive / separator.
 */
@Component({
  selector: 'app-pi-menu-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (type() === 'separator') {
      <div role="separator" class="hairline-t my-1"></div>
    } @else {
      <button
        type="button"
        role="menuitem"
        [attr.aria-checked]="ariaCheckedAttr()"
        [attr.aria-label]="ariaLabel()"
        [disabled]="disabled()"
        (click)="onActivate($event)"
        [class]="computedClass()"
      >
        <ng-content />
      </button>
    }
  `,
})
export class MenuItemComponent {
  readonly type = input<MenuItemType>('default');
  readonly selected = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  readonly selectedChange = output<boolean>();
  readonly activate = output<void>();

  readonly ariaCheckedAttr = computed(() => {
    if (this.type() === 'separator') return null;
    return this.selected() ? 'true' : null;
  });

  readonly computedClass = computed(() => {
    if (this.type() === 'separator') return '';
    const variant =
      this.type() === 'destructive' ? 'text-destructive' : 'text-ink';
    return [
      'w-full',
      'text-left',
      'px-3',
      'py-1.5',
      'text-sm',
      variant,
      'hover:bg-paper-2',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:bg-paper-2',
      this.disabled() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ');
  });

  onActivate(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) return;
    if (this.selected()) {
      this.selectedChange.emit(!this.selected());
    } else {
      this.activate.emit();
    }
  }
}
