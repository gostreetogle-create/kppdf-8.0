import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'hlm-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'rounded-md border border-border bg-card ' + class_()">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
      >
        <span class="flex items-center gap-2">
          @if (icon()) {
            <span class="lucide-{{ icon() }} h-4 w-4 text-muted-foreground" aria-hidden="true"></span>
          }
          <ng-content select="[trigger]"></ng-content>
        </span>
        <span
          class="lucide-chevron-down h-4 w-4 text-muted-foreground transition-transform"
          [class.rotate-180]="open()"
          aria-hidden="true"
        ></span>
      </button>
      <div
        class="grid transition-all duration-200 ease-in-out"
        [class.grid-rows-[1fr]]="open()"
        [class.grid-rows-[0fr]]="!open()"
      >
        <div class="overflow-hidden">
          <div class="border-t border-border px-4 py-3 text-sm">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CollapsibleComponent {
  readonly open = input<boolean>(false);
  readonly openChange = output<boolean>();
  readonly icon = input<string>('');
  readonly class_ = input<string>('');

  protected toggle(): void {
    this.openChange.emit(!this.open());
  }
}
