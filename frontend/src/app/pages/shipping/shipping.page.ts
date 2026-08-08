import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';

/**
 * TZ-NAV-301 — stub: частичные отгрузки.
 */
@Component({
  selector: 'app-shipping-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" />
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
  `,
})
export class ShippingPage {
  protected readonly crumbs: PageCrumb[] = [{ label: 'Склад' }, { label: 'Отгрузка' }];
}
