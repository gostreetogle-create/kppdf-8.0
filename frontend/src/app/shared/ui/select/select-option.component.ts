import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';
import { SelectComponent } from './select.component';

/**
 * SelectOption — single selectable option for Paper & Ink `<app-pi-select>`.
 * Renders as native <button role="option"> with focus() method driven by
 * SelectComponent's keydown handler. ARIA: aria-selected toggled.
 */
@Component({
  selector: 'app-pi-select-option',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="option"
      [attr.aria-selected]="isSelected()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      [class]="computedClass()"
      (click)="onSelect()"
    >
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: block; }
    button {
      display: block;
      width: 100%;
      text-align: left;
      background: transparent;
      border: 0;
      margin: 0;
      font: inherit;
      cursor: pointer;
    }
    button[aria-selected='true'] {
      background: var(--color-sunrise-warm);
      color: var(--color-paper);
    }
  `],
})
export class SelectOptionComponent {
  readonly value = input.required<string>();
  readonly disabled = input<boolean>(false);

  private readonly select = inject(SelectComponent, { optional: true });
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly isSelected = computed(() => this.select?.value() === this.value());

  readonly computedClass = computed(() => {
    const isOn = this.isSelected();
    const disabled = this.disabled();
    return [
      'flex',
      'items-center',
      'px-3',
      'py-2',
      'text-sm',
      isOn ? 'bg-sunrise-warm text-paper' : 'bg-paper text-ink hover:bg-paper-2',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ink',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-paper',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ');
  });

  focus(): void {
    const root = this.hostEl.nativeElement as HTMLElement;
    const btn = root.querySelector('button[role="option"]');
    if (btn) (btn as HTMLButtonElement).focus();
  }

  onSelect(): void {
    if (this.disabled()) return;
    this.select?.selectOption(this.value());
  }
}
