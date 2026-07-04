import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hlm-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'relative overflow-y-auto overflow-x-hidden scrollbar-thin ' + class_()"
      [style.maxHeight]="maxHeight() || null"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--muted-foreground) / 0.4) transparent;
      }
      :host ::ng-deep .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      :host ::ng-deep .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      :host ::ng-deep .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: hsl(var(--muted-foreground) / 0.4);
        border-radius: 4px;
      }
      :host ::ng-deep .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: hsl(var(--muted-foreground) / 0.7);
      }
    `,
  ],
})
export class ScrollAreaComponent {
  readonly maxHeight = input<string>('');
  readonly class_ = input<string>('');
}
