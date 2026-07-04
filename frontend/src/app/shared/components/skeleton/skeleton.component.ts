import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="'animate-pulse rounded-md bg-muted ' + (className() || 'h-4 w-full')"></div>`,
})
export class SkeletonComponent {
  readonly className = input<string>('');
}
