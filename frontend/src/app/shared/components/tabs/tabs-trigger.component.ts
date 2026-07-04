import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TabsComponent } from './tabs.component';

@Component({
  selector: 'hlm-tabs-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="tab"
      [attr.aria-selected]="isActive()"
      [attr.aria-controls]="'panel-' + value()"
      [attr.data-state]="isActive() ? 'active' : 'inactive'"
      [class]="triggerClass()"
      (click)="activate()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class TabsTriggerComponent {
  readonly value = input.required<string>();
  readonly variant = input<'pill' | 'underline'>('pill');

  private readonly tabs = inject(TabsComponent, { optional: true });

  protected isActive(): boolean {
    return this.tabs?.isActive(this.value()) ?? false;
  }

  protected activate(): void {
    this.tabs?.setValue(this.value());
  }

  protected triggerClass(): string {
    if (this.variant() === 'underline') {
      return [
        'inline-flex items-center justify-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        this.isActive()
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      ].join(' ');
    }
    return [
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
      this.isActive()
        ? 'bg-background text-foreground shadow-sm'
        : 'hover:bg-background/50',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
    ].join(' ');
  }
}
