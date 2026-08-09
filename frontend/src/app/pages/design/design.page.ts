import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { DESIGN_SECTION_CHIPS } from './design-group-chips';

/**
 * TZ-NAV-301 — stub: очередь доукомплектования (проектирование).
 * TZ-UX-309 — PiGroupWorkspace chrome.
 */
@Component({
  selector: 'app-design-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="design">
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <span class="text-xs text-muted-foreground">Очередь доукомплектования</span>
      </div>
      <div
        class="max-w-lg mx-auto mt-4 p-8 pi-dashed-panel flex flex-col items-center gap-2 text-center"
        data-test="design-stub"
        role="status"
      >
        <span class="eyebrow text-sunrise-warm">скоро</span>
        <p class="text-sm text-muted-foreground m-0 leading-relaxed">
          Очередь доукомплектования — изделия и модули, которые ещё не готовы к работе. Полный поток
          появится в следующих волнах.
        </p>
      </div>
    </app-pi-group-workspace>
  `,
})
export class DesignPage {
  protected readonly chips = DESIGN_SECTION_CHIPS;
}
