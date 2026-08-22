import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type PiOverflowSelectItem = {
  id: string;
  label: string;
  meta?: string;
};

/** When to show in-panel typeahead. Default off — plain overflow-select unchanged. */
export type PiOverflowSelectSearchable = boolean | 'auto';

/** Canon: show search at ≥10 options (industry 10–15; see ui-overflow-select.md). */
export const PI_OVERFLOW_SELECT_SEARCH_THRESHOLD = 10;

/**
 * Overflow select — canon catalog dropdown (docs/pages/ui-overflow-select.md).
 *
 * - Closed: single control, label wraps/clamps inside trigger width.
 * - Open: CDK overlay ABOVE dialog/sheet (not clipped); tall panel; wrap labels.
 * - Optional search (`searchable` / `auto` ≥10): filter by letters/digits; clears on close.
 * - Do NOT use native `<select>` for long catalog names.
 */
@Component({
  selector: 'app-pi-overflow-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-w-0 w-full" [attr.data-test]="dataTest()">
      <button
        #trigger
        type="button"
        class="pi-input w-full flex items-center gap-2 text-left font-normal"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="ariaLabel()"
        aria-haspopup="listbox"
        [disabled]="disabled()"
        (click)="toggle()"
        data-test="pi-overflow-select-trigger"
      >
        <span
          class="min-w-0 flex-1 text-sm leading-snug"
          [class.text-muted-foreground]="!value()"
          [class.line-clamp-2]="!!value()"
          [class.truncate]="!value()"
          >{{ selectedLabel() }}</span
        >
        <span class="shrink-0 text-muted-foreground text-xs" aria-hidden="true">▾</span>
      </button>
    </div>

    <ng-template #panel>
      <div
        class="hairline rounded-sm bg-paper-raised shadow-lg flex flex-col max-h-[min(70vh,28rem)] overflow-hidden"
        data-test="pi-overflow-select-panel"
      >
        @if (showSearch()) {
          <div class="shrink-0 p-1.5 hairline-b bg-paper-raised">
            <input
              #searchInput
              type="search"
              class="pi-input w-full text-sm"
              [placeholder]="searchPlaceholder()"
              [value]="query()"
              (input)="onQueryInput($event)"
              (keydown)="onSearchKeydown($event)"
              [attr.aria-label]="searchPlaceholder()"
              autocomplete="off"
              data-test="pi-overflow-select-search"
            />
          </div>
        }
        <ul
          role="listbox"
          [attr.aria-multiselectable]="multiple() ? 'true' : null"
          class="p-1 space-y-0.5 overflow-y-auto min-h-0 flex-1 m-0 list-none"
          data-test="pi-overflow-select-list"
        >
          @if (filteredItems().length === 0) {
            <li class="px-2 py-2 text-xs text-muted-foreground">{{ emptyLabel() }}</li>
          }
          @for (item of filteredItems(); track item.id) {
            <li
              role="option"
              [attr.aria-selected]="
                multiple() ? selectedValues().includes(item.id) : value() === item.id
              "
            >
              <button
                type="button"
                class="w-full text-left px-2.5 py-2 text-sm rounded-sm hover:bg-paper-2 whitespace-normal break-words leading-snug"
                [class.bg-paper-2]="
                  multiple() ? selectedValues().includes(item.id) : value() === item.id
                "
                [class.font-medium]="
                  multiple() ? selectedValues().includes(item.id) : value() === item.id
                "
                (click)="pick(item.id)"
              >
                <span class="flex items-center gap-2">
                  @if (multiple()) {
                    <span
                      class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-rule text-[11px] leading-none"
                      [class.bg-ink]="selectedValues().includes(item.id)"
                      [class.text-paper]="selectedValues().includes(item.id)"
                      aria-hidden="true"
                    >
                      @if (selectedValues().includes(item.id)) {
                        ✓
                      }
                    </span>
                  }
                  <span class="min-w-0 flex-1">{{ item.label }}</span>
                  @if (item.meta) {
                    <span class="shrink-0 text-xs text-muted-foreground">{{ item.meta }}</span>
                  }
                </span>
              </button>
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
})
export class PiOverflowSelectComponent {
  readonly items = input.required<PiOverflowSelectItem[]>();
  readonly value = model<string>('');
  readonly multiple = input(false);
  readonly selectedValues = model<string[]>([]);
  readonly placeholder = input('— выбрать —');
  readonly emptyLabel = input('Ничего не найдено');
  readonly ariaLabel = input('Выбор из списка');
  readonly disabled = input(false);
  readonly dataTest = input('pi-overflow-select');
  /**
   * `false` — plain list (default, existing callers unchanged).
   * `true` — always show search field in panel.
   * `'auto'` — search when `items.length >= searchThreshold` (default 10).
   */
  readonly searchable = input<PiOverflowSelectSearchable>(false);
  readonly searchThreshold = input(PI_OVERFLOW_SELECT_SEARCH_THRESHOLD);
  readonly searchPlaceholder = input('Поиск…');
  readonly valueChange = output<string>();

  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly triggerEl = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTpl = viewChild<TemplateRef<unknown>>('panel');
  private readonly searchInputEl = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private overlayRef: OverlayRef | null = null;

  protected readonly open = signal(false);
  protected readonly query = signal('');

  protected readonly showSearch = computed(() => {
    const mode = this.searchable();
    if (mode === true) return true;
    if (mode === false) return false;
    return this.items().length >= this.searchThreshold();
  });

  protected readonly filteredItems = computed(() => {
    const list = this.items();
    const q = this.query().trim().toLowerCase();
    if (!q || !this.showSearch()) return list;
    return list.filter((item) => `${item.label} ${item.meta ?? ''}`.toLowerCase().includes(q));
  });

  protected readonly selectedLabel = computed(() => {
    if (this.multiple()) {
      const selected = this.selectedValues();
      if (selected.length === 0) return this.placeholder();
      const labels = this.items()
        .filter((item) => selected.includes(item.id))
        .map((item) => item.label);
      return labels.length <= 2 ? labels.join(', ') : `${selected.length} выбрано`;
    }
    const id = this.value();
    if (!id) return this.placeholder();
    return this.items().find((item) => item.id === id)?.label ?? this.placeholder();
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.close());
  }

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) this.close();
    else this.openPanel();
  }

  /** Keep panel open while filtering (e.g. parent search input). */
  openPanel(): void {
    if (this.disabled()) return;
    if (this.overlayRef) {
      this.open.set(true);
      this.focusSearchSoon();
      return;
    }
    const origin = this.triggerEl()?.nativeElement;
    const tpl = this.panelTpl();
    if (!origin || !tpl) return;

    const width = Math.max(origin.getBoundingClientRect().width, 280);
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width,
      maxHeight: 'min(70vh, 28rem)',
      panelClass: 'pi-overflow-select-panel',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(true)
        .withPush(true)
        .withGrowAfterOpen(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 4,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -4,
          },
        ]),
    });

    this.overlayRef.attach(new TemplatePortal(tpl, this.viewContainer));
    this.open.set(true);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') this.close();
    });
    this.focusSearchSoon();
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.open.set(false);
    this.query.set('');
  }

  protected pick(id: string): void {
    if (this.multiple()) {
      const selected = new Set(this.selectedValues());
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      this.selectedValues.set([...selected]);
      return;
    }
    this.value.set(id);
    this.valueChange.emit(id);
    this.close();
  }

  protected onQueryInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.query.set(el.value);
  }

  /** Esc in search closes panel; stop bubble so dialog doesn't steal it oddly. */
  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }

  private focusSearchSoon(): void {
    if (!this.showSearch()) return;
    queueMicrotask(() => {
      this.searchInputEl()?.nativeElement?.focus();
    });
  }
}
