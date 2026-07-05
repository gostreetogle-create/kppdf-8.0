import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { RadioGroupComponent } from './radio-group.component';

/**
 * RadioItem — single radio option for Paper & Ink `<app-pi-radio-group>`.
 *
 * Renders a native `<input type="radio">` (invisible, focusable) with a
 * styled visual span overlay. The native radio handles a11y/checked state;
 * RadioGroup manages roving tabindex and arrow-key navigation.
 */
@Component({
  selector: 'app-pi-radio-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: inline-flex; align-items: center; position: relative; }
    input.radio-native {
      position: absolute;
      opacity: 0;
      width: 20px;
      height: 20px;
      margin: 0;
      cursor: pointer;
      z-index: 1;
    }
    input.radio-native:disabled { cursor: not-allowed; }
    input.radio-native:focus-visible + .radio-circle {
      box-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-ink);
    }
    .radio-circle {
      flex: none;
      width: 20px;
      height: 20px;
      border-radius: 9999px;
      background: var(--color-paper);
      border: 1px solid var(--color-rule);
      transition: border-color 120ms ease;
      position: relative;
      display: inline-block;
    }
    input.radio-native:checked + .radio-circle { border-color: var(--color-ink); }
    input.radio-native:checked + .radio-circle::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: var(--color-ink);
    }
    input.radio-native:disabled + .radio-circle { opacity: 0.5; }
    input.radio-native:not(:disabled):hover + .radio-circle { border-color: var(--color-ink); }
  `],
  template: `
    <input
      #nativeRadio
      type="radio"
      class="radio-native"
      [attr.name]="groupName()"
      [attr.value]="value()"
      [checked]="isChecked()"
      [disabled]="disabled()"
      [attr.aria-label]="effectiveLabel()"
      (change)="onNativeChange()"
    />
    <span class="radio-circle" aria-hidden="true"></span>
    @if (label()) {
      <span class="ml-2 text-sm text-ink">{{ label() }}</span>
    } @else {
      <ng-content />
    }
  `,
})
export class RadioItemComponent {
  readonly value = input.required<string>();
  readonly label = input<string | null>(null);
  readonly disabled = input<boolean>(false);

  private readonly group = inject(RadioGroupComponent, { optional: true });
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly groupName = computed(() => this.group?.name() ?? this.fallbackName());
  readonly isChecked = computed(() => this.group?.value() === this.value());
  readonly effectiveLabel = computed(() => this.label() ?? this.value());

  onNativeChange(): void {
    if (this.disabled()) return;
    this.group?.selectValue(this.value());
  }

  focus(): void {
    const root = this.hostEl.nativeElement as HTMLElement;
    const native = root.querySelector('input.radio-native');
    if (native) (native as HTMLInputElement).focus();
  }

  setTabindex(value: 0 | -1): void {
    const root = this.hostEl.nativeElement as HTMLElement;
    const native = root.querySelector('input.radio-native');
    if (native) (native as HTMLInputElement).tabIndex = value;
  }

  /**
   * Fallback name so a RadioItem used outside any RadioGroup still
   * renders as a single native input (otherwise name="" gives a global group).
   */
  private fallbackName(): string {
    return 'pi-radio-standalone';
  }
}
