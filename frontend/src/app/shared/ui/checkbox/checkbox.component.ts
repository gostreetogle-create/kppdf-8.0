import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type CheckboxSize = 'sm' | 'md';

/**
 * Checkbox — tri-state Paper & Ink toggle primitive.
 *
 * Click semantics:
 * - unchecked → checked
 * - checked → unchecked
 * - indeterminate → unchecked  (W3C ARIA APG standard)
 *
 * Uses global `<i-lucide>` web-component selector for `check` / `minus`
 * icons. The selector resolves once LucideAngularModule is included in
 * any component's imports (we import it project-wide in KitLayout for
 * this reason — single load registers `<i-lucide>` globally).
 */
@Component({
  selector: 'app-pi-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      role="checkbox"
      [attr.aria-checked]="ariaCheckedValue()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      [class]="computedClass()"
      (click)="onToggle()"
    >
      @if (indeterminate()) {
        <i-lucide name="minus" [size]="iconSize()"></i-lucide>
      } @else if (checked()) {
        <i-lucide name="check" [size]="iconSize()"></i-lucide>
      }
    </button>
  `,
})
export class CheckboxComponent {
  readonly checked = model<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly size = input<CheckboxSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly checkedChange = output<boolean>();

  readonly iconSize = computed(() => (this.size() === 'md' ? 14 : 12));

  readonly ariaCheckedValue = computed<string>(() =>
    this.indeterminate() ? 'mixed' : this.checked() ? 'true' : 'false',
  );

  readonly computedClass = computed(() => {
    const isMd = this.size() === 'md';
    const dim = isMd ? 'w-5 h-5' : 'w-4 h-4';
    const isOn = this.checked() || this.indeterminate();
    return [
      'inline-flex',
      'items-center',
      'justify-center',
      dim,
      'border',
      'hairline',
      'rounded-sm',
      isOn ? 'bg-ink text-paper border-ink' : 'bg-paper border-rule text-ink',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
      this.disabled() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ');
  });

  onToggle(): void {
    if (this.disabled()) return;
    const next = this.indeterminate() ? false : !this.checked();
    this.checked.set(next);
    this.checkedChange.emit(next);
  }
}
