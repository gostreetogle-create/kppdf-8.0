import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

/**
 * Shared catalog filter panel — backdrop overlay with role="region", Esc close,
 * and z=var(--z-dropdown).
 *
 * Usage:
 *   <app-pi-filter-panel [open]="filtersOpen()" (openChange)="closeFilters()" [ariaLabel]="'Фильтры каталога'">
 *     <!-- page-local filter controls go here -->
 *   </app-pi-filter-panel>
 *
 * The component owns:
 *  - Backdrop overlay (click/keyboard closes)
 *  - Esc key handler
 *  - role="region" + aria-label on the panel
 *
 * Page-local select/input/button controls are projected via <ng-content>.
 */
@Component({
  selector: 'app-pi-filter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="absolute left-0 top-0 z-[var(--z-dropdown)] w-64 min-h-[22rem] max-h-[min(36rem,80vh)] overflow-y-auto rounded-sm bg-paper-raised p-4 hairline-b"
        role="region"
        [attr.aria-label]="ariaLabel()"
        data-test="filters-rail-panel"
        (pointerdown)="$event.stopPropagation()"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between gap-2 mb-3 pb-3 hairline-b">
          <div class="pi-label text-muted-foreground m-0">Фильтры</div>
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-ink pi-focus-ring rounded-sm px-1 min-h-touch"
            (click)="onClose()"
            aria-label="Закрыть"
            data-test="filters-panel-close"
          >
            Закрыть
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <ng-content />
        </div>
      </div>
      <button
        type="button"
        class="absolute inset-0 z-[calc(var(--z-dropdown)-1)] border-0 cursor-default bg-ink/20 dark:bg-ink/40"
        aria-label="Закрыть фильтры"
        data-test="filters-backdrop"
        (click)="onClose()"
      ></button>
    }
  `,
})
export class PiFilterPanelComponent {
  readonly open = input.required<boolean>();
  readonly ariaLabel = input<string>('Фильтры каталога');
  readonly openChange = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.onClose();
  }

  protected onClose(): void {
    this.openChange.emit();
  }
}
