import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Tabs root — manages active tab.
 * Usage:
 *   <hlm-tabs [(value)]="activeTab" (valueChange)="...">
 *     <hlm-tabs-list>
 *       <hlm-tabs-trigger value="overview">Overview</hlm-tabs-trigger>
 *       <hlm-tabs-trigger value="analytics">Analytics</hlm-tabs-trigger>
 *     </hlm-tabs-list>
 *     <hlm-tabs-content value="overview">...</hlm-tabs-content>
 *   </hlm-tabs>
 */
@Component({
  selector: 'hlm-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
})
export class TabsComponent {
  readonly value = input<string>('');
  readonly valueChange = output<string>();

  // Internal mutable state if not bound externally
  private readonly _internal = signal<string>('');
  protected readonly effectiveValue = signal<string>('');

  ngOnInit(): void {
    if (!this.value()) {
      // Find first hlm-tabs-trigger and use it
      const first = document.querySelector('hlm-tabs-trigger') as HTMLElement | null;
      const v = first?.getAttribute('value') ?? '';
      this.effectiveValue.set(v);
    } else {
      this.effectiveValue.set(this.value());
    }
  }

  setValue(v: string): void {
    this.effectiveValue.set(v);
    this._internal.set(v);
    this.valueChange.emit(v);
  }

  isActive(v: string): boolean {
    return this.effectiveValue() === v;
  }
}
