import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ContactRound,
  FileText,
  Package,
  Printer,
  ScrollText,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-angular';

import { PiChromeToolsService } from '../../../../shared/chrome/pi-chrome-tools.service';
import type {
  PiChromeLucideIcon,
  PiChromeToolItem,
} from '../../../../shared/chrome/pi-chrome-tools.types';
import { PiGroupWorkspaceComponent } from '../../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../../deals-group-chips';
import { ProposalCreateRecipientComponent } from '../proposal-create-recipient.component';
import { ProposalCreateTemplateCenterComponent } from '../proposal-create-template-center.component';
import { ProposalCreateTemplatePickerComponent } from '../proposal-create-template-picker.component';
import { ProposalProductRailComponent } from '../proposal-product-rail.component';
import {
  ProposalWorkspaceShellComponent,
  type WsRailItem,
} from './proposal-workspace-shell.component';
import { ProposalWorkspaceDraftService } from './proposal-workspace-draft.service';
import { ProposalWorkspaceStore, type WsSection } from './proposal-workspace.store';

const CHROME_OWNER = 'proposal-workspace';

interface SectionDef {
  id: WsSection;
  title: string;
  icon: PiChromeLucideIcon;
  side: 'left' | 'right';
  order: number;
}

/**
 * IA (docs/pages/kp-workspace-rail-ia.md §1): left = Каталог · Шаблон · Клиент,
 * right = Параметры · Редактор таблицы · Условия · Вывод. Unique Lucide icons.
 */
const SECTION_DEFS: readonly SectionDef[] = [
  { id: 'catalog', title: 'Каталог', icon: Package, side: 'left', order: 1 },
  { id: 'template', title: 'Шаблон', icon: FileText, side: 'left', order: 2 },
  { id: 'recipient', title: 'Клиент', icon: ContactRound, side: 'left', order: 3 },
  { id: 'params', title: 'Параметры', icon: SlidersHorizontal, side: 'right', order: 1 },
  { id: 'table', title: 'Редактор таблицы', icon: TableProperties, side: 'right', order: 2 },
  { id: 'terms', title: 'Условия', icon: ScrollText, side: 'right', order: 3 },
  { id: 'output', title: 'Вывод', icon: Printer, side: 'right', order: 4 },
];

/**
 * TZ-KP-WS-403 — /proposals/workspace: left panels (catalog / template /
 * recipient) + A4 preview center, driven by the draft service (hydration +
 * autosave + build — one write-path mirroring create). Right panels arrive in
 * TZ-404; `/proposals/create` untouched.
 */
@Component({
  selector: 'app-proposal-workspace-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    ProposalWorkspaceShellComponent,
    ProposalProductRailComponent,
    ProposalCreateTemplatePickerComponent,
    ProposalCreateRecipientComponent,
    ProposalCreateTemplateCenterComponent,
    RouterLink,
  ],
  providers: [ProposalWorkspaceStore, ProposalWorkspaceDraftService],
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
        [orientation]="store.orientation()"
        [panelCollapsed]="!store.panelOpen()"
        [activeSection]="store.activeSection()"
        [panelTitle]="store.panelTitle()"
        [railItems]="railItems"
        [panelWide]="store.activeSection() === 'catalog'"
        [sheetHost]="!!draft.selectedTemplate()"
        badgeText="Черновик"
        [statusText]="draft.autosaveLabel() || 'Workspace · черновик'"
        (orientationChange)="store.setOrientation($event)"
        (sectionChange)="onSectionChange($event)"
        (panelToggle)="store.closePanel()"
        (sheetClick)="store.closePanel()"
      >
        <div kpWsPanel>
          @switch (store.activeSection()) {
            @case ('catalog') {
              <app-proposal-product-rail
                [draftLines]="draft.draftLines()"
                [readOnly]="draft.isReadOnly()"
                (productAdd)="draft.onProductAdd($event)"
              />
            }
            @case ('template') {
              <app-proposal-create-template-picker
                [initialId]="draft.selectedTemplate()?._id ?? ''"
                (templateChange)="draft.onTemplateChange($event)"
              />
            }
            @case ('recipient') {
              <app-proposal-create-recipient
                [selectedCounterpartyId]="draft.counterpartyId()"
                [selectedContactPersonId]="draft.contactPersonId()"
                [selectedSiteId]="draft.siteId()"
                [readOnly]="draft.isReadOnly()"
                (stateChange)="draft.onRecipientState($event)"
              />
            }
            @default {
              <div class="kp-ws-note">
                Выберите инструмент: слева — каталог, шаблон, клиент; справа — параметры, таблица,
                условия, вывод (TZ-404).
              </div>
            }
          }
        </div>

        @if (draft.selectedTemplate()) {
          <app-proposal-create-template-center
            kpWsSheet
            [selected]="draft.selectedTemplate()"
            [previewHtml]="draft.previewHtml()"
            [previewPages]="draft.previewPages()"
            [previewStatus]="draft.previewStatus()"
            (requestPick)="store.openSection('template')"
          />
        }
      </app-proposal-workspace-shell>
    </app-pi-group-workspace>
  `,
})
export class ProposalWorkspacePage {
  protected readonly store = inject(ProposalWorkspaceStore);
  protected readonly draft = inject(ProposalWorkspaceDraftService);
  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly sectionChips = KP_SECTION_CHIPS;
  protected readonly railItems: readonly WsRailItem[] = SECTION_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    icon: def.icon,
  }));

  private readonly chromeTools = inject(PiChromeToolsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const query = this.route.snapshot.queryParamMap;
    const id = query.get('id')?.trim() || null;
    const source = query.get('source')?.trim() || null;
    const sourceId = query.get('sourceId')?.trim() || null;
    if (id) this.store.quotationId.set(id);
    this.draft.init({ id, new: query.get('new') === '1', source, sourceId });

    effect(() => {
      void this.store.activeLeft();
      void this.store.activeRight();
      void this.store.panelOpen();
      untracked(() => this.syncChromeTools());
    });

    this.destroyRef.onDestroy(() => this.chromeTools.clear(CHROME_OWNER));
  }

  protected onSectionChange(id: string): void {
    this.store.toggleSection(id as WsSection);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.store.closePanel();
  }

  private syncChromeTools(): void {
    const open = this.store.panelOpen();
    const active = this.store.activeSection();
    const items: PiChromeToolItem[] = SECTION_DEFS.map((def) => ({
      id: def.id,
      side: def.side,
      ariaLabel: def.title,
      title: def.title,
      icon: def.icon,
      active: open && active === def.id,
      ariaExpanded: open && active === def.id,
      ariaControls: 'kp-ws-tools-panel',
      order: def.order,
      onClick: () => this.store.toggleSection(def.id),
    }));
    this.chromeTools.setTools(CHROME_OWNER, items);
  }
}
