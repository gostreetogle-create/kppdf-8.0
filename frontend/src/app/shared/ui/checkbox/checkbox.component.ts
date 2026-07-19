import { ChangeDetectionStrategy, Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CheckboxComponent),
    },
  ],
  template: `
    <button
      type="button"
      role="checkbox"
      [attr.id]="id() ?? null"
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
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly size = input<CheckboxSize>('md');
  readonly id = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);

  readonly checkedChange = output<boolean>();

  readonly iconSize = computed(() => (this.size() === 'md' ? 14 : 12));

  readonly ariaCheckedValue = computed<string>(() =>
    this.indeterminate() ? 'mixed' : this.checked() ? 'true' : 'false',
  );

  // ─── ControlValueAccessor ───
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabledFromForm = signal<boolean>(false);

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabledFromForm.set(isDisabled);
  }

  readonly computedClass = computed(() => {
    const isMd = this.size() === 'md';
    const dim = isMd ? 'w-5 h-5' : 'w-4 h-4';
    const isOn = this.checked() || this.indeterminate();
    return [
      'inline-flex',
      'items-center',
      'justify-center',
      'shrink-0',
      dim,
      'hairline',
      'rounded-sm',
      isOn ? 'bg-sunrise-warm text-paper border-sunrise-warm' : 'bg-paper border-rule text-ink',
      'pi-focus-ring',
      this.disabled() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ');
  });

  onToggle(): void {
    if (this.disabled() || this.isDisabledFromForm()) return;
    const next = this.indeterminate() ? false : !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
    this.checkedChange.emit(next);
  }
}
