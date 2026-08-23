import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Dummy KP workspace shell — visual layout only (phase 0).
 * No services, no store. Wire into proposal-create.page after PO PASS.
 */
@Component({
  selector: 'app-proposal-workspace-shell-dummy',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kp-workspace-shell.html',
  styleUrl: './kp-workspace-shell.css',
  host: {
    class: 'kp-ws-host',
    'data-test': 'kp-workspace-shell-host',
  },
})
export class ProposalWorkspaceShellDummyComponent {}
