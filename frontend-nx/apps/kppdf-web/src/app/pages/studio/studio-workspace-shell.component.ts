import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FileText, LucideAngularModule, Maximize2 } from 'lucide-angular';

export type StudioWsOrientation = 'portrait' | 'landscape';
export type StudioWsLucideIcon = typeof FileText;

export interface StudioWsRailItem {
  id: string;
  title: string;
  short?: string;
  icon: StudioWsLucideIcon;
}

const RIGHT_PANEL_SECTIONS = new Set(['properties', 'table']);

@Component({
  selector: 'pi-studio-workspace-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  templateUrl: './studio-workspace-shell.component.html',
  styleUrls: ['./studio-workspace-shell.component.css', './studio-panel-overlays.css'],
})
export class StudioWorkspaceShellComponent {
  readonly orientation = input<StudioWsOrientation>('portrait');
  readonly panelCollapsed = input(false);
  readonly panelSide = input<'left' | 'right' | null>(null);
  readonly activeSection = input<string | null>(null);
  readonly panelTitle = input('');
  readonly railItems = input<readonly StudioWsRailItem[]>([]);
  readonly badgeText = input('');
  readonly totalText = input('');
  readonly statusText = input('');
  readonly debugText = input('');
  readonly panelWide = input(false);
  readonly sheetHost = input(false);
  readonly showDesktopRail = input(true);
  readonly pageLabel = input('1 / 1');
  readonly zoomMode = input<'fit' | '100'>('fit');

  readonly fitZoom = output<void>();
  readonly actualZoom = output<void>();

  readonly sectionChange = output<string>();
  readonly panelToggle = output<void>();
  readonly sheetClick = output<void>();

  protected readonly resolvedPanelSide = computed<'left' | 'right'>(() => {
    const explicit = this.panelSide();
    if (explicit === 'left' || explicit === 'right') return explicit;
    const section = this.activeSection();
    return section && RIGHT_PANEL_SECTIONS.has(section) ? 'right' : 'left';
  });

  protected readonly maximizeIcon = Maximize2;

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
