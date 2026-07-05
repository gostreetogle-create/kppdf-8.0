import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOptionComponent } from './select-option.component';
import { SelectTriggerComponent } from './select-trigger.component';

export type SelectSize = 'sm' | 'md';

/**
 * Select — Paper & Ink listbox-based select primitive.
 * Native HTML listbox pattern (no @angular/cdk/listbox — its CdkListbox
 * directive is not exported in @angular/cdk@20.2). ARIA-correct with
 * keyboard nav (↑ ↓ Home End Enter Esc) via host keydown handler.
 * Standalone, OnPush.
 */
@Component({
  selector: 'app-pi-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectTriggerComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectComponent),
    },
  ],
  template: `
    <div
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      role="presentation"
      class="flex flex-col gap-1 w-full"
      (keydown)="onKeydown($event)"
    >
      <app-pi-select-trigger [size]="size()">
        <ng-content select="[selected-label]" />
      </app-pi-select-trigger>
      <div
        class="bg-paper border hairline border-rule rounded-sm overflow-hidden max-h-60 overflow-y-auto"
        role="listbox"
        [attr.aria-label]="ariaLabel()"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class SelectComponent implements AfterViewInit, ControlValueAccessor {
  readonly value = model<string | null>(null);
  readonly placeholder = input<string>('Выберите значение');
  readonly disabled = input<boolean>(false);
  readonly size = input<SelectSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly valueChange = output<string | null>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  readonly options = viewChildren(SelectOptionComponent);
  private readonly focusedIndex = signal<number>(-1);

  // ─── ControlValueAccessor ───
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabledFromForm = signal<boolean>(false);

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabledFromForm.set(isDisabled);
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.focusInitial());
  }

  private focusInitial(): void {
    const opts = this.options();
    if (opts.length === 0) return;
    const valueIdx = opts.findIndex((o) => !o.disabled() && o.value() === this.value());
    const idx = valueIdx >= 0 ? valueIdx : opts.findIndex((o) => !o.disabled());
    if (idx >= 0) this.focusedIndex.set(idx);
  }

  selectOption(value: string): void {
    if (this.disabled() || this.isDisabledFromForm()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const opts = this.options().filter((o) => !o.disabled());
    if (opts.length === 0) return;
    const currentIdx = this.focusedIndex() >= 0 ? this.focusedIndex() : 0;
    let nextIdx = currentIdx;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIdx = (currentIdx + 1) % opts.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIdx = (currentIdx - 1 + opts.length) % opts.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = opts.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (this.focusedIndex() >= 0) {
          const focused = this.options()[this.focusedIndex()];
          if (focused) this.selectOption(focused.value());
          event.preventDefault();
        }
        return;
      case 'Escape':
        if (this.focusedIndex() >= 0) {
          this.focusedIndex.set(-1);
          event.preventDefault();
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    this.focusedIndex.set(nextIdx);
    opts[nextIdx]?.focus();
  }
}
