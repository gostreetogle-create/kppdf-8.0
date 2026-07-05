import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Paper & Ink Drawer — bottom sheet for mobile/quick actions.
 * Sits at viewport bottom with drag-handle pill on top. max-height=85vh.
 */
@Component({
  selector: 'app-pi-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="dialog"
      [attr.aria-label]="title()"
      [attr.aria-modal]="true"
      class="bg-paper border-t hairline border-rule rounded-t-sm w-full flex flex-col"
      [style.maxHeight]="maxHeight()"
    >
      @if (showHandle()) {
        <div class="flex justify-center pt-2 pb-1" aria-hidden="true">
          <span class="block w-10 h-[3px] rounded-full"
            style="background: oklch(from var(--color-rule) l c h / 0.80)"></span>
        </div>
      }
      @if (title()) {
        <header class="px-5 py-3 border-b hairline border-rule flex items-center justify-between">
          <h2 class="font-display text-lg tracking-tight text-ink">{{ title() }}</h2>
          <button
            type="button"
            class="inline-flex items-center justify-center w-7 h-7 rounded-sm hairline border border-rule bg-paper hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            (click)="close.emit()"
            aria-label="Закрыть"
          >
            <span aria-hidden="true" class="text-base leading-none">×</span>
          </button>
        </header>
      }
      <div class="overflow-auto px-5 py-4 text-sm">
        <ng-content />
      </div>
    </div>
  `,
})
export class DrawerComponent {
  readonly title = input<string>('');
  readonly showHandle = input<boolean>(true);
  readonly maxHeight = input<string>('85vh');
  readonly close = output<void>();
}
