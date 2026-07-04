import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';

/**
 * OtpInput (TZ-37) — 6-digit OTP input. Auto-advance, paste, backspace.
 * Usage:
 *   <hlm-otp-input [length]="6" (valueChange)="code.set($event)" />
 */
@Component({
  selector: 'hlm-otp-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2" role="group" aria-label="One-time password">
      @for (i of indices(); track i; let last = $last) {
        <input
          #cell
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          [attr.aria-label]="'Digit ' + (i + 1)"
          [attr.maxlength]="1"
          [class]="cellClass()"
          [value]="digits()[i] ?? ''"
          (input)="onInput(i, $event)"
          (paste)="onPaste($event)"
          (keydown)="onKey($event, i)"
          (focus)="onFocus($event)"
        />
        @if (i < length() - 1 && separator()) {
          <span class="text-xl text-muted-foreground">-</span>
        }
      }
    </div>
  `,
})
export class OtpInputComponent {
  readonly length = input<number>(6);
  readonly type = input<'numeric' | 'alphanumeric'>('numeric');
  readonly separator = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly value = input<string>('');
  readonly valueChange = output<string>();
  readonly completed = output<string>();

  protected readonly digits = signal<string[]>(this.parse(this.value()));
  protected readonly indices = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  protected readonly cells = viewChildren<ElementRef<HTMLInputElement>>('cell');

  constructor() {
    effect(() => {
      // Sync external value
      this.digits.set(this.parse(this.value()));
    });
  }

  private parse(v: string): string[] {
    const arr = v.split('').slice(0, this.length());
    while (arr.length < this.length()) arr.push('');
    return arr;
  }

  protected cellClass(): string {
    return [
      'flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-md border border-input bg-background',
      'text-center text-xl font-mono tabular-nums',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' ');
  }

  protected onInput(i: number, e: Event): void {
    const el = e.target as HTMLInputElement;
    let v = el.value;
    if (this.type() === 'numeric') v = v.replace(/\D/g, '');
    v = v.slice(-1);
    const next = [...this.digits()];
    next[i] = v;
    this.digits.set(next);
    this.emit();
    if (v && i < this.length() - 1) {
      this.cells()[i + 1]?.nativeElement.focus();
      this.cells()[i + 1]?.nativeElement.select();
    }
  }

  protected onKey(e: KeyboardEvent, i: number): void {
    if (e.key === 'Backspace' && !this.digits()[i] && i > 0) {
      e.preventDefault();
      this.cells()[i - 1]?.nativeElement.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      this.cells()[i - 1]?.nativeElement.focus();
    } else if (e.key === 'ArrowRight' && i < this.length() - 1) {
      e.preventDefault();
      this.cells()[i + 1]?.nativeElement.focus();
    }
  }

  protected onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const data = e.clipboardData?.getData('text') ?? '';
    const cleaned = this.type() === 'numeric' ? data.replace(/\D/g, '') : data;
    const next = this.parse(cleaned);
    this.digits.set(next);
    this.emit();
    const last = Math.min(cleaned.length, this.length() - 1);
    this.cells()[last]?.nativeElement.focus();
  }

  protected onFocus(e: FocusEvent): void {
    (e.target as HTMLInputElement).select();
  }

  private emit(): void {
    const joined = this.digits().join('');
    this.valueChange.emit(joined);
    if (joined.length === this.length()) this.completed.emit(joined);
  }
}
