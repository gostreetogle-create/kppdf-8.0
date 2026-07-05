import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { RadioItemComponent } from './radio-item.component';

/**
 * RadioGroup — Paper & Ink radiogroup primitive (no CDK radio dep).
 *
 * Uses native `<input type="radio">` rendered by child <app-pi-radio-item>s.
 * Implements W3C ARIA APG radio pattern: roving tabindex + ↑/↓/←/→ keystroke nav.
 *
 * Why no @angular/cdk/radio: CDP Angular CDK 20.x removed the radio subpath
 * (consolidated into @angular/cdk/listbox). We implement the pattern by hand.
 */
@Component({
  selector: 'app-pi-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="disabled()"
      class="flex flex-col gap-2"
      (keydown)="onKeydown($event)"
    >
      <ng-content />
    </div>
  `,
})
export class RadioGroupComponent implements AfterViewInit {
  readonly value = model<string | null>(null);
  readonly name = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  readonly valueChange = output<string | null>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  readonly items = viewChildren(RadioItemComponent);

  /** Tracks currently focused item index for roving tabindex. */
  private readonly focusedIndex = signal<number>(-1);

  readonly currentItems = computed(() => this.items());

  ngAfterViewInit(): void {
    this.updateRovingTabindex();
  }

  /** Called by individual RadioItem when its native radio gets selected. */
  selectValue(newValue: string): void {
    if (this.disabled()) return;
    this.value.set(newValue);
    this.valueChange.emit(newValue);
    // After selection, focus first selected item for arrow nav continuity.
    const idx = this.currentItems().findIndex((it) => it.value() === newValue);
    if (idx >= 0) this.focusedIndex.set(idx);
    this.updateRovingTabindex();
  }

  /**
   * Keydown handler — bound via template `(keydown)` only.
   * Arrow keys / Home / End navigate between items (W3C APG radiogroup pattern).
   */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const items = this.currentItems();
    if (items.length === 0) return;

    const currentIdx = this.resolveIndex(items);
    let nextIdx = currentIdx;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIdx = (currentIdx + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIdx = (currentIdx - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.focusedIndex.set(nextIdx);
    items[nextIdx].focus();
    const nextVal = items[nextIdx].value();
    if (nextVal && nextVal !== this.value()) this.selectValue(nextVal);
    this.updateRovingTabindex();
  }

  private resolveIndex(items: ReadonlyArray<RadioItemComponent>): number {
    const fi = this.focusedIndex();
    if (fi >= 0 && fi < items.length) {
      const focused = items[fi];
      if (!focused.disabled()) return fi;
    }
    const valueIdx = items.findIndex((it) => it.value() === this.value());
    if (valueIdx >= 0) return valueIdx;
    return items.findIndex((it) => !it.disabled());
  }

  private updateRovingTabindex(): void {
    const items = this.currentItems();
    const idx = this.resolveIndex(items);
    items.forEach((it, i) => it.setTabindex(i === idx ? 0 : -1));
  }
}
