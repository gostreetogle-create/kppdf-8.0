import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Paper & Ink Tab — single tab inside <app-pi-tabs>.
 * Active styling: border-ink underline + text-ink.
 * Manages roving tabindex (selected = 0, others = -1).
 */
@Component({
  selector: 'app-pi-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="tab"
      [id]="tabId()"
      [attr.aria-selected]="isActive()"
      [attr.aria-controls]="panelId()"
      [attr.tabindex]="isActive() ? 0 : -1"
      [disabled]="disabled()"
      [class]="computedClass()"
      (click)="onSelect()"
    >
      {{ label() }}
    </button>
  `,
})
export class TabComponent implements AfterViewInit {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly isActive = input<boolean>(false);

  readonly selected = output<string>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly tabId = computed(() => `pi-tab-${this.value()}`);
  readonly panelId = computed(() => `pi-tabpanel-${this.value()}`);

  readonly computedClass = computed(() => {
    const active = this.isActive();
    const disabled = this.disabled();
    return [
      'px-4',
      'py-2',
      'text-sm',
      'font-body',
      'border-b',
      'hairline',
      'transition-colors',
      active ? 'border-ink text-ink' : 'border-transparent text-muted',
      'hover:text-ink',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
    ].join(' ');
  });

  onSelect(): void {
    if (this.disabled()) return;
    this.selected.emit(this.value());
  }

  ngAfterViewInit(): void {
    // Roving tabindex management (initial focus).
    queueMicrotask(() => {
      const native = this.hostEl.nativeElement.querySelector('button[role="tab"]') as HTMLButtonElement | null;
      if (native && this.isActive()) native.tabIndex = 0;
    });
  }
}
