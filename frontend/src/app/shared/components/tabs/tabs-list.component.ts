import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hlm-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tablist"
      [class]="
        scrollable()
          ? 'flex overflow-x-auto border-b border-border'
          : 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground'
      "
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class TabsListComponent {
  readonly scrollable = input<boolean>(false);
}
