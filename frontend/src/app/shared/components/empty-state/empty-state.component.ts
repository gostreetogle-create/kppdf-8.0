import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-muted/30">
      <div class="text-5xl mb-4">{{ icon() }}</div>
      <h3 class="text-lg font-semibold mb-1">{{ title() }}</h3>
      <p class="text-sm text-muted-foreground max-w-sm">{{ description() }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<string>('📭');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
