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
  Maximize2,
  Package,
  Printer,
  RectangleHorizontal,
  RectangleVertical,
  ScrollText,
  Settings,
  User,
} from 'lucide-angular';
import { PiChromeToolsService } from '../../../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../../../shared/chrome/pi-chrome-tools.types';
import type { GroupChip } from '../../../../shared/page/pi-group-workspace.component';
import { PiGroupWorkspaceComponent } from '../../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../../deals-group-chips';

type WorkspaceSection = 'catalog' | 'template' | 'composition' | 'params' | 'client' | 'terms';
type SheetOrientation = 'portrait' | 'landscape';

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

@Component({
  selector: 'app-proposal-workspace-demo-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, LucideAngularModule],
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
  protected readonly rectVerticalIcon = RectangleVertical;
  protected readonly rectHorizontalIcon = RectangleHorizontal;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly printerIcon = Printer;
  protected readonly downloadIcon = Download;
  protected readonly ellipsisIcon = Ellipsis;
  protected readonly maximizeIcon = Maximize2;

  protected readonly railItems = [
    { id: 'catalog' as const, title: 'Каталог', short: 'Кат', icon: this.packageIcon },
    { id: 'template' as const, title: 'Шаблон', short: 'Шаб', icon: this.fileTextIcon },
    { id: 'composition' as const, title: 'Состав', short: 'Сост', icon: this.listIcon },
    { id: 'params' as const, title: 'Параметры', short: 'Пар', icon: this.settingsIcon },
    { id: 'client' as const, title: 'Клиент', short: 'Кл', icon: this.userIcon },
    { id: 'terms' as const, title: 'Условия', short: 'Усл', icon: this.scrollTextIcon },
  ];

  protected readonly orientation = signal<SheetOrientation>('portrait');
  protected readonly activeSection = signal<WorkspaceSection>('catalog');
  protected readonly panelCollapsed = signal(false);
  protected readonly panelTitle = computed(() => SECTION_TITLES[this.activeSection()]);
  protected readonly debugMetrics = signal('—');

  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('viewportStage');
  private readonly sheetRef = viewChild<ElementRef<HTMLElement>>('a4Sheet');
  private readonly shellRef = viewChild<ElementRef<HTMLElement>>('workspaceShell');
  private readonly bodyRef = viewChild<ElementRef<HTMLElement>>('workspaceBody');

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
      const stage = this.stageRef()?.nativeElement;
      const shell = this.shellRef()?.nativeElement;
      const sheet = this.sheetRef()?.nativeElement;
      const body = this.bodyRef()?.nativeElement;
      if (stage) ro.observe(stage);
      if (shell) ro.observe(shell);
      if (sheet) ro.observe(sheet);
      if (body) ro.observe(body);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  protected setOrientation(next: SheetOrientation): void {
    if (this.orientation() === next) return;
    this.orientation.set(next);
    this.refreshMetrics();
  }

  protected onRailClick(id: WorkspaceSection): void {
    if (this.activeSection() === id && !this.panelCollapsed()) {
      this.panelCollapsed.set(true);
    } else {
      this.activeSection.set(id);
      this.panelCollapsed.set(false);
    }
    this.refreshMetrics();
  }

  protected onSheetClick(): void {
    this.panelCollapsed.set(true);
    this.refreshMetrics();
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
      onClick: () => this.onRailClick(item.id),
    }));

    this.chromeTools.setTools(CHROME_OWNER, items);
  }

  private refreshMetrics(): void {
    requestAnimationFrame(() => {
      const stage = this.stageRef()?.nativeElement;
      const sheet = this.sheetRef()?.nativeElement;
      if (!stage || !sheet) return;
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
