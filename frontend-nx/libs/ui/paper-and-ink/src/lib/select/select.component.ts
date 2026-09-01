import {
  AfterViewInit,
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
  contentChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectOptionComponent } from './select-option.component';
import { SelectTriggerComponent } from './select-trigger.component';
import { SelectSize } from './select.types';
import { SELECT_PARENT, SelectParent } from './select-parent.interface';

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
    {
      provide: SELECT_PARENT,
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
      <app-pi-select-trigger
        #trigger
        [size]="size()"
        [ariaLabel]="ariaLabel()"
        [open]="open()"
        (toggle)="toggleOpen()"
      >
        <ng-content select="[selected-label]" />
        @if (selectedLabel(); as label) {
          {{ label }}
        }
      </app-pi-select-trigger>
      <div
        class="bg-paper hairline rounded-sm overflow-hidden max-h-60 overflow-y-auto p-1"
        role="listbox"
        [attr.aria-label]="ariaLabel()"
        [hidden]="!open()"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class SelectComponent implements AfterViewInit, AfterContentInit, ControlValueAccessor, SelectParent {
  readonly value = model<string | null>(null);
  readonly placeholder = input<string>('Выберите значение');
  readonly disabled = input<boolean>(false);
  readonly size = input<SelectSize>('md');
  readonly ariaLabel = input<string | null>(null);

  readonly selectedLabel = computed(() => {
    const selected = this.options().find((option) => option.value() === this.value());
    if (!selected) return this.placeholder();
    return this.optionLabels.get(selected.value()) ?? selected.hostText();
  });
  readonly hasSelectedLabelSlot = signal(false);

  private readonly optionLabels = new Map<string, string>();

  readonly valueChange = output<string | null>();

  protected readonly open = signal(false);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly options = contentChildren(SelectOptionComponent, { descendants: true });
  private readonly focusedIndex = signal<number>(-1);

  // ─── ControlValueAccessor ───
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabledFromForm = signal<boolean>(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.open.set(false));
  }

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

  ngAfterContentInit(): void {
    queueMicrotask(() => {
      this.refreshOptionLabels();
      this.focusInitial();
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.hasSelectedLabelSlot.set(
        !!this.hostEl.nativeElement.querySelector('[selected-label]'),
      );
      this.refreshOptionLabels();
      this.focusInitial();
    });
  }

  private refreshOptionLabels(): void {
    for (const option of this.options()) {
      this.optionLabels.set(option.value(), option.hostText());
    }
  }

  protected toggleOpen(): void {
    this.refreshOptionLabels();
    this.open.update((v) => !v);
    if (this.open()) {
      this.focusInitial();
    }
  }

  selectOption(value: string): void {
    if (this.disabled() || this.isDisabledFromForm()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
    this.open.set(false);
  }

  private focusInitial(): void {
    const opts = this.options();
    if (opts.length === 0) return;
    const valueIdx = opts.findIndex((o) => !o.disabled() && o.value() === this.value());
    const idx = valueIdx >= 0 ? valueIdx : opts.findIndex((o) => !o.disabled());
    if (idx >= 0) this.focusedIndex.set(idx);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (!this.hostEl.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Escape') {
      this.open.set(false);
      event.preventDefault();
      return;
    }
    const opts = this.options().filter((o) => !o.disabled());
    if (opts.length === 0) return;
    const currentIdx = this.focusedIndex() >= 0 ? this.focusedIndex() : 0;
    let nextIdx: number;
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
      default:
        return;
    }
    event.preventDefault();
    this.focusedIndex.set(nextIdx);
    opts[nextIdx]?.focus();
  }
}
