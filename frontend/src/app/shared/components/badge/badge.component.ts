import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="'badge-' + variant()">{{ label() }}</span>`,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<BadgeVariant>('default');
}
