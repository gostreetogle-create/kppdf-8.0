import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Switch / Toggle component.
 * Usage: <hlm-switch [checked]="value()" (change)="value.set($event)" [disabled]="..." />
 */
@Component({
  selector: 'hlm-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [disabled]="disabled()"
      [class]="rootClass()"
      (click)="onClick($event)"
    >
      <span [class]="thumbClass()" aria-hidden="true"></span>
    </button>
  `,
})
export class SwitchComponent {
  readonly checked = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly color = input<'primary' | 'secondary' | 'success' | 'destructive'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly ariaLabel = input<string>('');

  readonly checkedChange = output<boolean>();

  private readonly _internal = signal<boolean>(false);
  private readonly effective = computed(() => this.checked() || this._internal());

  protected onClick(event: Event): void {
    event.preventDefault();
    if (this.disabled()) return;
    const next = !this.effective();
    this._internal.set(next);
    this.checkedChange.emit(next);
  }

  protected readonly rootClass = computed(() => {
    const sizeCls =
      this.size() === 'sm'
        ? 'h-5 w-9'
        : this.size() === 'lg'
          ? 'h-7 w-12'
          : 'h-6 w-11';
    const colorCls = this.effective()
      ? this.color() === 'secondary'
        ? 'bg-secondary'
        : this.color() === 'success'
          ? 'bg-success'
          : this.color() === 'destructive'
            ? 'bg-destructive'
            : 'bg-primary'
      : 'bg-input';
    return [
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full',
      'border-2 border-transparent transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      sizeCls,
      colorCls,
    ].join(' ');
  });

  protected readonly thumbClass = computed(() => {
    const sizeCls =
      this.size() === 'sm'
        ? 'h-4 w-4 data-[state=checked]:translate-x-4'
        : this.size() === 'lg'
          ? 'h-6 w-6 data-[state=checked]:translate-x-5'
          : 'h-5 w-5 data-[state=checked]:translate-x-5';
    const translate = this.effective()
      ? this.size() === 'sm'
        ? 'translate-x-4'
        : this.size() === 'lg'
          ? 'translate-x-5'
          : 'translate-x-5'
      : 'translate-x-0';
    return [
      'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
      sizeCls.split(' ').find((c) => c.startsWith('h-')) ?? 'h-5 w-5',
      translate,
    ].join(' ');
  });
}
