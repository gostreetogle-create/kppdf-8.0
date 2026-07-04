import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  effect,
} from '@angular/core';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Combobox / Autocomplete (TZ-32) — searchable dropdown.
 * Usage:
 *   <hlm-combobox
 *     [options]="people"
 *     [value]="selected()"
 *     (valueChange)="selected.set($event)"
 *     placeholder="Select person..."
 *   />
 */
@Component({
  selector: 'hlm-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      <div class="relative">
        <span class="lucide-search pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"></span>
        <input
          #input
          type="text"
          role="combobox"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="'cb-list-' + uid"
          [attr.aria-activedescendant]="active() >= 0 ? 'cb-opt-' + uid + '-' + active() : null"
          autocomplete="off"
          [placeholder]="placeholder()"
          [value]="display()"
          (input)="onInput($event)"
          (focus)="openIfTyped()"
          (keydown)="onKey($event)"
          [class]="inputClass()"
        />
        <button
          type="button"
          class="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-accent"
          (click)="toggle()"
          tabindex="-1"
          aria-label="Toggle options"
        >
          <span class="lucide-chevrons-up-down h-4 w-4 opacity-50" aria-hidden="true"></span>
        </button>
      </div>

      @if (open()) {
        <ul
          [id]="'cb-list-' + uid"
          role="listbox"
          class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          @for (o of filtered(); track o.value; let i = $index) {
            <li
              [id]="'cb-opt-' + uid + '-' + i"
              role="option"
              [attr.aria-selected]="o.value === value()"
              [class]="optionClass(i, o)"
              (click)="select(o)"
            >
              <span class="lucide-check h-4 w-4" [class.opacity-0]="o.value !== value()" aria-hidden="true"></span>
              <span class="flex-1">
                <span class="block truncate">{{ o.label }}</span>
                @if (o.description) {
                  <span class="block text-xs text-muted-foreground">{{ o.description }}</span>
                }
              </span>
            </li>
          } @empty {
            <li class="px-2 py-3 text-center text-sm text-muted-foreground">No results</li>
          }
        </ul>
      }
    </div>
  `,
})
export class ComboboxComponent {
  readonly options = input.required<ComboboxOption[]>();
  readonly value = input<string>('');
  readonly valueChange = output<string>();
  readonly placeholder = input<string>('Select...');
  readonly disabled = input<boolean>(false);

  readonly uid = Math.random().toString(36).slice(2);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal<string>('');
  protected readonly open = signal<boolean>(false);
  protected readonly active = signal<number>(-1);

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    const opts = this.options();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  });

  protected readonly display = computed(() => {
    const v = this.value();
    if (v && !this.open()) {
      const found = this.options().find((o) => o.value === v);
      return found?.label ?? '';
    }
    return this.query();
  });

  constructor() {
    // Reset query when value changes externally
    effect(() => {
      const _v = this.value();
      if (!this.open()) this.query.set('');
    });
  }

  protected inputClass(): string {
    return [
      'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 py-2 text-sm',
      'ring-offset-background placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      this.disabled() ? 'cursor-not-allowed opacity-50' : '',
    ].join(' ');
  }

  protected optionClass(i: number, o: ComboboxOption): string {
    const isActive = i === this.active();
    const isSelected = o.value === this.value();
    return [
      'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      isActive ? 'bg-accent text-accent-foreground' : '',
      isSelected ? 'font-medium' : 'font-normal',
      o.disabled ? 'pointer-events-none opacity-50' : '',
    ].join(' ');
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.open.set(true);
    this.active.set(this.filtered().length > 0 ? 0 : -1);
  }

  protected openIfTyped(): void {
    if (this.query()) this.open.set(true);
  }

  protected toggle(): void {
    if (this.open()) {
      this.open.set(false);
    } else {
      this.open.set(true);
      this.input()?.nativeElement.focus();
    }
  }

  protected select(o: ComboboxOption): void {
    if (o.disabled) return;
    this.query.set('');
    this.open.set(false);
    this.valueChange.emit(o.value);
  }

  protected onKey(e: KeyboardEvent): void {
    const items = this.filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.open.set(true);
      this.active.update((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.active.update((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = this.active() >= 0 ? this.active() : 0;
      const opt = items[idx];
      if (opt) this.select(opt);
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
    }
  }
}
