import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PiGroupWorkspaceComponent } from '../../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../../deals-group-chips';
import { ProposalWorkspaceShellComponent } from './proposal-workspace-shell.component';

/**
 * TZ-KP-WS-401 — production workspace route `/proposals/workspace`.
 *
 * Layout shell only for now: real left/right tools arrive in TZ-402 (store +
 * chrome rails) → 403/404 (panels). The panel shows a «подключение позже»
 * placeholder; `/proposals/create` stays untouched until cutover TZ-408.
 * Query params (`id`, `new=1`, `source=order`) are consumed from TZ-402 store.
 */
@Component({
  selector: 'app-proposal-workspace-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, ProposalWorkspaceShellComponent, RouterLink],
  styles: [
    `
      .kp-ws-note {
        padding: var(--space-2, 8px);
        border: 1px solid var(--color-rule);
        border-radius: var(--radius-sm, 2px);
        font-size: 11px;
        color: var(--color-muted-foreground);
        background: var(--color-paper);
      }
    `,
  ],
  template: `
    <app-pi-group-workspace
      [toc]="dealsToc"
      tocActiveId="proposals"
      [chips]="sectionChips"
      activeId="create"
      [flushBody]="true"
    >
      <app-proposal-workspace-shell
        panelTitle="Рабочее место КП"
        badgeText="Черновик"
        statusText="Workspace · панели подключаются в TZ-402+"
      >
        <div kpWsPanel>
          <div class="kp-ws-note">
            Панели инструментов подключаются в следующих волнах (TZ-402…404). Пока доступна полная
            студия на
            <a class="pi-focus-ring" routerLink="/proposals/create">/proposals/create</a>.
          </div>
        </div>
      </app-proposal-workspace-shell>
    </app-pi-group-workspace>
  `,
})
export class ProposalWorkspacePage {
  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly sectionChips = KP_SECTION_CHIPS;
}
