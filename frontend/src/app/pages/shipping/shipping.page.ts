import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiGroupWorkspaceComponent, type GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * TZ-NAV-301 — stub: частичные отгрузки.
 */
@Component({
  selector: 'app-shipping-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace pathLabel="Снабжение" [chips]="chips" activeId="shipping">
      <div tools class="flex items-center gap-form-field flex-wrap">
        <span class="text-sm text-muted-foreground">Логистика</span>
      </div>
    <div
      class="max-w-lg mx-auto mt-8 p-8 pi-dashed-panel flex flex-col items-center gap-2 text-center"
      data-test="shipping-stub"
      role="status"
    >
      <span class="eyebrow text-sunrise-warm">скоро</span>
      <p class="text-sm text-muted-foreground m-0 leading-relaxed">
        Частичные отгрузки с привязкой к заказу. Полный SHIPPING — отдельная TZ; страница нужна,
        чтобы поток L→R в меню был цельным.
      </p>
    </div>
    </app-pi-group-workspace>
  `,
})
export class ShippingPage {
  protected readonly chips: readonly GroupChip[] = [
    { id: 'supply', label: 'Закупки', route: '/supply' },
    { id: 'shipping', label: 'Отгрузка', route: '/shipping' },
  ];
}
