import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';

/**
 * TZ-NAV-301 — stub: очередь доукомплектования (проектирование).
 */
@Component({
  selector: 'app-design-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs" />
    <div
      class="max-w-lg mx-auto mt-8 p-8 pi-dashed-panel flex flex-col items-center gap-2 text-center"
      data-test="design-stub"
      role="status"
    >
      <span class="eyebrow text-sunrise-warm">скоро</span>
      <p class="text-sm text-muted-foreground m-0 leading-relaxed">
        Очередь доукомплектования — изделия и модули, которые ещё не готовы к работе. Полный поток
        появится в следующих волнах.
      </p>
    </div>
  `,
})
export class DesignPage {
  protected readonly crumbs: PageCrumb[] = [{ label: 'Проектирование' }, { label: 'Очередь' }];
}
