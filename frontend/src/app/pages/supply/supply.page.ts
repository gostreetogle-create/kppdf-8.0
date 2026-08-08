import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';

/**
 * TZ-NAV-301 — stub: задачи закупки / снабжение.
 */
@Component({
  selector: 'app-supply-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" />
    <div
      class="max-w-lg mx-auto mt-8 p-8 pi-dashed-panel flex flex-col items-center gap-2 text-center"
      data-test="supply-stub"
      role="status"
    >
      <span class="eyebrow text-sunrise-warm">скоро</span>
      <p class="text-sm text-muted-foreground m-0 leading-relaxed">
        Задачи закупки и подтверждения «материал есть». Backend снабжения — отдельная волна
        (SUPPLY); здесь пока заглушка меню потока.
      </p>
    </div>
  `,
})
export class SupplyPage {
  protected readonly crumbs: PageCrumb[] = [{ label: 'Снабжение' }, { label: 'Закупки' }];
}
