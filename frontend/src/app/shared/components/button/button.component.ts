import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { cn } from '../../../core/utils/cn';
import { buttonClasses, type ButtonVariants } from '../../../core/utils/cva.example';

/**
 * Button component using CVA + cn() (TZ-40 Foundation).
 * Usage: <hlm-button variant="destructive" size="sm" [loading]="false" (click)="...">Save</hlm-button>
 */
@Component({
  selector: 'hlm-button, button[hlmButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="rootClass()"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariants['variant']>('default');
  readonly size = input<ButtonVariants['size']>('default');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly class = input<string>('');

  protected readonly rootClass = computed(() =>
    buttonClasses(this.variant(), this.size(), cn(this.class())),
  );
}
