import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'hlm-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="
        orientation() === 'vertical'
          ? 'flex flex-col gap-2'
          : 'flex items-start gap-2 overflow-x-auto'
      "
      role="tablist"
    >
      @for (s of steps(); track s.id; let i = $index) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="i === activeIndex()"
          [disabled]="s.disabled"
          [class]="stepClass(i)"
          (click)="goTo(i)"
        >
          <span [class]="circleClass(i)" aria-hidden="true">
            @if (i < activeIndex()) {
              <span class="lucide-check h-4 w-4"></span>
            } @else if (s.icon) {
              <span class="lucide-{{ s.icon }} h-4 w-4"></span>
            } @else {
              <span class="text-xs font-medium">{{ i + 1 }}</span>
            }
          </span>
          <span class="flex flex-col text-left">
            <span class="text-sm font-medium leading-none">{{ s.label }}</span>
            @if (s.description) {
              <span class="text-xs text-muted-foreground leading-tight mt-0.5">{{ s.description }}</span>
            }
          </span>
        </button>
        @if (i < steps().length - 1 && orientation() === 'horizontal') {
          <div
            [class]="'h-px flex-1 min-w-8 transition-colors ' + (i < activeIndex() ? 'bg-primary' : 'bg-border')"
            aria-hidden="true"
          ></div>
        }
      }
    </div>
  `,
})
export class StepperComponent {
  readonly steps = input.required<StepperStep[]>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly value = input<number>(0);
  readonly valueChange = output<number>();
  readonly linear = input<boolean>(true);

  protected readonly activeIndex = computed(() => this.value());

  goTo(i: number): void {
    const s = this.steps()[i];
    if (!s || s.disabled) return;
    if (this.linear() && i > this.value() + 1) return; // skip-allowed rule
    this.valueChange.emit(i);
  }

  next(): void {
    this.valueChange.emit(Math.min(this.value() + 1, this.steps().length - 1));
  }

  prev(): void {
    this.valueChange.emit(Math.max(0, this.value() - 1));
  }

  protected stepClass(i: number): string {
    const active = i === this.activeIndex();
    const completed = i < this.activeIndex();
    return [
      'inline-flex items-center gap-3 rounded-md px-2 py-1 transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active ? 'text-foreground' : 'text-muted-foreground',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');
  }

  protected circleClass(i: number): string {
    const active = i === this.activeIndex();
    const completed = i < this.activeIndex();
    return [
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors',
      active ? 'border-primary bg-primary text-primary-foreground' : '',
      completed ? 'border-primary bg-primary/20 text-primary' : '',
      !active && !completed ? 'border-border bg-background text-muted-foreground' : '',
    ].join(' ');
  }
}
