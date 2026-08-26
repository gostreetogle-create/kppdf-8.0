import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Maximize2 } from 'lucide-angular';

import type { PiChromeLucideIcon } from '../../../../shared/chrome/pi-chrome-tools.types';

/** Sheet orientation — geometry law (see docs/pages/kp-workspace-geometry.md). */
export type WsOrientation = 'portrait' | 'landscape';

/** One section entry for the horizontal (mobile) rail strip. */
export interface WsRailItem {
  id: string;
  title: string;
  short?: string;
  icon: PiChromeLucideIcon;
}

/** Right chrome-rail sections — panel anchors to the matching edge. */
const RIGHT_PANEL_SECTIONS = new Set(['params', 'money', 'deadlines', 'table', 'terms']);

/**
 * TZ-KP-WS-401 — Proposal workspace layout shell (extracted from demo page).
 *
 * Owns ONLY the geometry frame: ribbon (status/total — orientation is
 * mirrored read-only from the template, TZ-KP-443), horizontal mobile rail
 * strip (from `railItems`), absolute tools panel
 * (`[kpWsPanel]` content), A4 viewport stage with sheet slot (`[kpWsSheet]`),
 * viewport toolbar and status bar. Controlled component: state comes in via
 * inputs, user intent leaves via outputs — consumers (demo / workspace page /
 * store in TZ-402) own signals and chrome-rail registration.
 *
 * Geometry laws (immutable):
 *  - panel = absolute overlay, open/close never reflows or shrinks the A4 sheet;
 *  - panel width 480px (--kp-panel-w), content max-width 272px;
 *  - A4 right-aligned ~8px from stage edge in both orientations.
 */
@Component({
  selector: 'app-proposal-workspace-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './proposal-workspace-shell.component.html',
  styleUrl: './proposal-workspace-shell.component.css',
})
export class ProposalWorkspaceShellComponent {
  readonly orientation = input<WsOrientation>('portrait');
  readonly panelCollapsed = input(false);
  /** Optional override; when omitted, derived from `activeSection` (right rail ids). */
  readonly panelSide = input<'left' | 'right' | null>(null);
  readonly activeSection = input<string | null>(null);
  readonly panelTitle = input('');
  readonly railItems = input<readonly WsRailItem[]>([]);
  readonly badgeText = input('');
  readonly totalText = input('');
  readonly statusText = input('');
  readonly debugText = input('');
  /** Tier-L panel (e.g. catalog vitrine): wider overlay, A4 still not reflowed. */
  readonly panelWide = input(false);
  /** Sheet slot acts as a transparent host (consumer renders its own A4 pages). */
  readonly sheetHost = input(false);

  protected readonly resolvedPanelSide = computed<'left' | 'right'>(() => {
    const explicit = this.panelSide();
    if (explicit === 'left' || explicit === 'right') return explicit;
    const section = this.activeSection();
    return section && RIGHT_PANEL_SECTIONS.has(section) ? 'right' : 'left';
  });

  readonly sectionChange = output<string>();
  readonly panelToggle = output<void>();
  readonly sheetClick = output<void>();

  protected readonly maximizeIcon = Maximize2;

  /** Mirror of demo toggle: same section while open collapses the panel. */
  protected onSectionClick(id: string): void {
    if (this.activeSection() === id && !this.panelCollapsed()) {
      this.panelToggle.emit();
    } else {
      this.sectionChange.emit(id);
    }
  }

  protected onSheetClick(): void {
    this.sheetClick.emit();
  }
}
