import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ChevronDown,
  Download,
  Ellipsis,
  FileText,
  List,
  LucideAngularModule,
  Package,
  Printer,
  ScrollText,
  Settings,
  User,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../../../shared/chrome/pi-chrome-tools.types';
import type { GroupChip } from '../../../../shared/page/pi-group-workspace.component';
import { PiGroupWorkspaceComponent } from '../../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../../deals-group-chips';
import {
  ProposalWorkspaceShellComponent,
  type WsOrientation,
  type WsRailItem,
} from '../workspace/proposal-workspace-shell.component';

type WorkspaceSection = 'catalog' | 'template' | 'composition' | 'params' | 'client' | 'terms';

const CHROME_OWNER = 'proposal-workspace-demo';

const DEMO_SECTION_CHIPS: readonly GroupChip[] = [
  ...KP_SECTION_CHIPS,
  {
    id: 'demo',
    label: 'Demo workspace',
    route: '/proposals/demo-workspace',
    pageKey: 'proposals',
  },
];

const SECTION_TITLES: Record<WorkspaceSection, string> = {
  catalog: 'Каталог',
  template: 'Шаблон',
  composition: 'Состав',
  params: 'Параметры',
  client: 'Клиент',
  terms: 'Условия',
};

/**
 * TZ-KP-WS-401 — demo page is now a thin wrapper over
 * `ProposalWorkspaceShellComponent`: layout frame (ribbon / panel / viewport /
 * status) lives in the shell; here only dummy content + chrome-rail
 * registration (geometry law #5) remain. Visually identical to pre-401.
 */
@Component({
  selector: 'app-proposal-workspace-demo-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, LucideAngularModule, ProposalWorkspaceShellComponent],
  templateUrl: './proposal-workspace-demo.page.html',
  styleUrl: './proposal-workspace-demo.page.css',
})
export class ProposalWorkspaceDemoPage {
  private readonly chromeTools = inject(PiChromeToolsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly sectionChips = DEMO_SECTION_CHIPS;

  protected readonly packageIcon = Package;
  protected readonly fileTextIcon = FileText;
  protected readonly listIcon = List;
  protected readonly settingsIcon = Settings;
  protected readonly userIcon = User;
  protected readonly scrollTextIcon = ScrollText;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly printerIcon = Printer;
  protected readonly downloadIcon = Download;
  protected readonly ellipsisIcon = Ellipsis;

  protected readonly railItems: readonly WsRailItem[] = [
    { id: 'catalog', title: 'Каталог', short: 'Кат', icon: this.packageIcon },
    { id: 'template', title: 'Шаблон', short: 'Шаб', icon: this.fileTextIcon },
    { id: 'composition', title: 'Состав', short: 'Сост', icon: this.listIcon },
    { id: 'params', title: 'Параметры', short: 'Пар', icon: this.settingsIcon },
    { id: 'client', title: 'Клиент', short: 'Кл', icon: this.userIcon },
    { id: 'terms', title: 'Условия', short: 'Усл', icon: this.scrollTextIcon },
  ];

  protected readonly orientation = signal<WsOrientation>('portrait');
  protected readonly activeSection = signal<WorkspaceSection>('catalog');
  protected readonly panelCollapsed = signal(false);
  protected readonly panelTitle = computed(() => SECTION_TITLES[this.activeSection()]);
  protected readonly debugMetrics = signal('—');

  private readonly shellRef = viewChild(ProposalWorkspaceShellComponent, { read: ElementRef });

  constructor() {
    effect(() => {
      void this.orientation();
      void this.activeSection();
      void this.panelCollapsed();
      untracked(() => this.syncChromeTools());
    });

    this.destroyRef.onDestroy(() => this.chromeTools.clear(CHROME_OWNER));

    afterNextRender(() => {
      const update = (): void => this.refreshMetrics();
      update();
      const ro = new ResizeObserver(() => update());
      const root = this.shellRef()?.nativeElement as HTMLElement | undefined;
      if (root) ro.observe(root);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  protected setOrientation(next: WsOrientation): void {
    if (this.orientation() === next) return;
    this.orientation.set(next);
    this.refreshMetrics();
  }

  protected onSectionChange(id: string): void {
    this.activeSection.set(id as WorkspaceSection);
    this.panelCollapsed.set(false);
    this.refreshMetrics();
  }

  protected onPanelToggle(): void {
    this.panelCollapsed.set(true);
    this.refreshMetrics();
  }

  protected onSheetClick(): void {
    this.panelCollapsed.set(true);
    this.refreshMetrics();
  }

  /** Same toggle used by chrome-rail tools (demo keeps rail registration here). */
  private onRailClick(id: WorkspaceSection): void {
    if (this.activeSection() === id && !this.panelCollapsed()) {
      this.onPanelToggle();
    } else {
      this.onSectionChange(id);
    }
  }

  private syncChromeTools(): void {
    const section = this.activeSection();
    const collapsed = this.panelCollapsed();
    const items: PiChromeToolItem[] = this.railItems.map((item, index) => ({
      id: item.id,
      side: 'left' as const,
      ariaLabel: item.title,
      title: item.title,
      icon: item.icon,
      active: !collapsed && section === item.id,
      order: index + 1,
      onClick: () => this.onRailClick(item.id as WorkspaceSection),
    }));

    this.chromeTools.setTools(CHROME_OWNER, items);
  }

  private refreshMetrics(): void {
    requestAnimationFrame(() => {
      const root = this.shellRef()?.nativeElement as HTMLElement | undefined;
      if (!root) return;
      const sheet = root.querySelector('[data-test="kp-a4-sheet"]');
      const stage = root.querySelector('.kp-ws-viewport__stage');
      if (!sheet || !stage) return;
      const rect = sheet.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const fillPct = Math.round((rect.height / stageRect.height) * 100);
      const mode = this.panelCollapsed() ? 'collapsed' : 'open';
      this.debugMetrics.set(
        `${this.orientation()} · ${mode} · A4 ${Math.round(rect.width)}×${Math.round(rect.height)}px · fill ${fillPct}%`,
      );
    });
  }
}
