import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TabsComponent } from './tabs.component';

@Component({
  selector: 'hlm-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        role="tabpanel"
        [id]="'panel-' + value()"
        [attr.aria-labelledby]="'trigger-' + value()"
        class="mt-3 focus-visible:outline-none"
        tabindex="0"
      >
        <ng-content></ng-content>
      </div>
    }
  `,
})
export class TabsContentComponent {
  readonly value = input.required<string>();

  private readonly tabs = inject(TabsComponent, { optional: true });

  protected readonly visible = computed(() => this.tabs?.isActive(this.value()) ?? false);
}
