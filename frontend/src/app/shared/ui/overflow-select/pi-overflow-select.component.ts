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
};

/**
 * Overflow select — canon catalog dropdown (docs/pages/ui-overflow-select.md).
 *
 * - Closed: single control, label wraps/clamps inside trigger width.
 * - Open: CDK overlay ABOVE dialog/sheet (not clipped); tall panel; wrap labels.
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
      <ul
        role="listbox"
        class="hairline rounded-sm bg-paper shadow-lg p-1 space-y-0.5 max-h-[min(70vh,28rem)] overflow-y-auto"
        data-test="pi-overflow-select-list"
      >
        @if (items().length === 0) {
          <li class="px-2 py-2 text-xs text-muted-foreground">{{ emptyLabel() }}</li>
        }
        @for (item of items(); track item.id) {
          <li role="option" [attr.aria-selected]="value() === item.id">
            <button
              type="button"
              class="w-full text-left px-2.5 py-2 text-sm rounded-sm hover:bg-paper-2 whitespace-normal break-words leading-snug"
              [class.bg-paper-2]="value() === item.id"
              [class.font-medium]="value() === item.id"
              (click)="pick(item.id)"
            >
              {{ item.label }}
            </button>
          </li>
        }
      </ul>
    </ng-template>
  `,
})
export class PiOverflowSelectComponent {
  readonly items = input.required<PiOverflowSelectItem[]>();
  readonly value = model<string>('');
  readonly placeholder = input('— выбрать —');
  readonly emptyLabel = input('Ничего не найдено');
  readonly ariaLabel = input('Выбор из списка');
  readonly disabled = input(false);
  readonly dataTest = input('pi-overflow-select');
  readonly valueChange = output<string>();

  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly triggerEl = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTpl = viewChild<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly open = signal(false);

  protected readonly selectedLabel = computed(() => {
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
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.open.set(false);
  }

  protected pick(id: string): void {
    this.value.set(id);
    this.valueChange.emit(id);
    this.close();
  }
}
