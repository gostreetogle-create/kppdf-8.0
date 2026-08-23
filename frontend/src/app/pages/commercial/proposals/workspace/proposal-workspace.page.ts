import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
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
import { PiDialogService } from '../../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../../shared/ui/toast';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { onDialogCloseOnce } from '../../../../shared/util/on-dialog-close-once';
import type { TextBlock } from '../../../../shared/services/pi-text-blocks.service';
import { PiGroupWorkspaceComponent } from '../../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../../deals-group-chips';
import { ProposalCreateInspectorComponent } from '../proposal-create-inspector.component';
import { ProposalCreateRecipientComponent } from '../proposal-create-recipient.component';
import { ProposalCreateTableEditorComponent } from '../proposal-create-table-editor.component';
import { ProposalCreateTemplateCenterComponent } from '../proposal-create-template-center.component';
import { ProposalCreateTemplatePickerComponent } from '../proposal-create-template-picker.component';
import { ProposalCreateTermsComponent } from '../proposal-create-terms.component';
import { ProposalProductRailComponent } from '../proposal-product-rail.component';
import { ProposalWorkspaceTemplateActionsComponent } from './proposal-workspace-template-actions.component';
import { ProposalWorkspaceTextBlockDialogComponent } from './proposal-workspace-text-block-dialog.component';
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
 * TZ-KP-WS-404 — /proposals/workspace with all seven tools mounted in the
 * shell panel (left: catalog/template/recipient, right: params/table/terms/
 * output). Table exit runs the catalog-review guard; modal owns a CDK focus
 * trap (KP-CATALOG-REVIEW-NO-ESC — Esc stays blocked). A4 never reflows.
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
    ProposalCreateInspectorComponent,
    ProposalCreateTableEditorComponent,
    ProposalCreateTermsComponent,
    ProposalWorkspaceTemplateActionsComponent,
    ProposalWorkspaceTextBlockDialogComponent,
    ButtonComponent,
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

      .kp-ws-terms-head {
        display: flex;
        justify-content: flex-end;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--color-rule);
      }

      .kp-catalog-review {
        position: fixed;
        inset: 0;
        z-index: var(--z-dialog);
        display: grid;
        place-items: center;
        padding: 1rem;
        background: oklch(0.12 0.02 260 / 0.42);
      }

      .kp-catalog-review__card {
        width: min(48rem, 100%);
        max-height: min(90vh, 42rem);
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--color-rule);
        background: var(--color-paper, #fff);
        color: var(--color-ink);
        box-shadow: var(--shadow-raised, 0 12px 36px oklch(0.2 0.02 260 / 0.18));
      }

      .kp-catalog-review__header,
      .kp-catalog-review__row,
      .kp-catalog-review__footer {
        display: flex;
        gap: 0.75rem;
      }

      .kp-catalog-review__header {
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-rule);
        padding-bottom: 0.65rem;
      }

      .kp-catalog-review__header h2 {
        margin: 0.15rem 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: 1.25rem;
      }

      .kp-catalog-review__header p:last-child,
      .kp-catalog-review__row-copy span,
      .kp-catalog-review__row-copy small {
        display: block;
        margin: 0;
        color: var(--color-muted);
        font-size: 0.75rem;
      }

      .kp-catalog-review__close {
        border: 0;
        background: transparent;
        color: var(--color-muted);
        font-size: 1.25rem;
        cursor: pointer;
      }

      .kp-catalog-review__rows {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        padding: 0.75rem 0;
      }

      .kp-catalog-review__row {
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem;
        border: 1px solid var(--color-rule);
      }

      .kp-catalog-review__row-copy {
        min-width: 0;
      }

      .kp-catalog-review__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .kp-catalog-review__actions button,
      .kp-catalog-review__cancel {
        padding: 0.35rem 0.5rem;
        border: 1px solid var(--color-rule);
        background: var(--color-paper, #fff);
        color: var(--color-ink);
        font-size: 0.72rem;
        cursor: pointer;
      }

      .kp-catalog-review__actions button:hover,
      .kp-catalog-review__cancel:hover {
        background: color-mix(in oklch, var(--color-gold) 14%, transparent);
      }

      .kp-catalog-review__error {
        margin: 0 0 0.5rem;
        color: var(--color-danger, #9f1239);
        font-size: 0.78rem;
      }

      .kp-catalog-review__footer {
        justify-content: flex-end;
        border-top: 1px solid var(--color-rule);
        padding-top: 0.65rem;
      }

      .kp-ws-org-hint {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.45rem 0.75rem;
        background: color-mix(in oklch, var(--color-gold) 12%, transparent);
        border-bottom: 1px solid var(--color-rule);
        font-size: 0.72rem;
        color: var(--color-ink);
      }

      .kp-ws-org-hint__dismiss {
        border: 0;
        background: transparent;
        font-size: 1rem;
        color: var(--color-muted);
        cursor: pointer;
        padding: 0 0.2rem;
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
        [panelWide]="store.activeSection() === 'catalog' || store.activeSection() === 'table'"
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
              <app-workspace-template-actions
                [template]="draft.selectedTemplate()"
                [readOnly]="draft.isReadOnly()"
              />
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
            @case ('params') {
              <app-proposal-create-inspector
                [draftLines]="draft.draftLines()"
                [tableLayout]="draft.kpTableLayout()"
                [tableTemplateId]="draft.tableTemplateId()"
                [tableTargets]="draft.tableTargets()"
                [selectedTableTargetId]="draft.selectedTableTargetId()"
                [selectedCounterpartyId]="draft.counterpartyId()"
                [initialNumber]="draft.proposalNumber()"
                [initialTitle]="draft.proposalTitle()"
                [initialDate]="draft.proposalDate()"
                [initialValidUntil]="draft.proposalValidUntil()"
                [initialDiscountType]="draft.discountType()"
                [initialDiscountPercent]="draft.discountPercent()"
                [initialDiscountAmount]="draft.discountAmount()"
                [initialPrepaymentPercent]="draft.prepaymentPercent()"
                [initialProductionDays]="draft.productionDays()"
                [initialDeliveryDays]="draft.deliveryDays()"
                [initialOrganizationId]="draft.organizationId()"
                [initialOrgMarkupPercent]="draft.orgMarkupPercent()"
                [initialDealVatPercent]="draft.dealVatPercent()"
                [initialSheetLayout]="draft.sheetLayout()"
                [readOnly]="draft.isReadOnly()"
                [status]="draft.proposalStatus()"
                (stateChange)="draft.onInspectorState($event)"
                (recipientEditRequest)="store.openSection('recipient')"
                (tableLayoutChange)="draft.onTableLayoutChange($event)"
                (commercialColumnsRequest)="draft.addCommercialColumns()"
                (tableTargetChange)="draft.onTableTargetChange($event)"
                (statusRequest)="draft.onStatusRequest($event)"
              />
            }
            @case ('table') {
              <app-proposal-create-table-editor
                [lines]="draft.draftLines()"
                [total]="draft.compositionTotal()"
                [readOnly]="draft.isReadOnly()"
                [tableLayout]="draft.kpTableLayout()"
                [tableTemplateId]="draft.tableTemplateId()"
                [tableTargets]="draft.tableTargets()"
                [selectedTableTargetId]="draft.selectedTableTargetId()"
                [chrome]="draft.kpTableChrome()"
                [tableFontSize]="draft.sheetLayout().tableFontSize"
                [tableHeaderFontSize]="draft.sheetLayout().tableHeaderFontSize"
                (lineChange)="draft.onCompositionLineChange($event)"
                (addCustom)="draft.addCustomLine()"
                (openProducts)="store.openSection('catalog')"
                (remove)="draft.removeCompositionLine($event)"
                (move)="draft.moveCompositionLine($event)"
                (editLine)="draft.editCompositionLine($event)"
                (rowAction)="draft.onRowAction($event)"
                (tableLayoutChange)="draft.onTableLayoutChange($event)"
                (commercialColumnsRequest)="draft.addCommercialColumns()"
                (openTableTemplate)="draft.openTableTemplatePreset()"
                (tableTargetChange)="draft.onTableTargetChange($event)"
                (chromeChange)="draft.onTableChromeChange($event)"
                (tableFontSizeChange)="draft.onTableFontSizeChange($event)"
                (tableHeaderFontSizeChange)="draft.onTableHeaderFontSizeChange($event)"
              />
            }
            @case ('terms') {
              <div class="kp-ws-terms-head">
                <app-pi-button
                  variant="outline"
                  size="sm"
                  [disabled]="draft.isReadOnly()"
                  (click)="openTextBlockEditor()"
                  data-test="kp-ws-text-block-create"
                >
                  Создать текстовый блок
                </app-pi-button>
              </div>
              <app-proposal-create-terms
                [terms]="draft.terms()"
                [readOnly]="draft.isReadOnly()"
                [libraryRefresh]="textBlocksVersion()"
                (termsChange)="draft.onTermsChange($event)"
              />
            }
            @case ('output') {
              <div class="kp-create-output" data-test="kp-create-output">
                <p class="kp-create-output__title">Вывод</p>
                <button
                  type="button"
                  class="kp-create-output__btn pi-focus-ring"
                  data-test="kp-output-print"
                  (click)="draft.requestOutput('print')"
                >
                  Печать
                </button>
                <button
                  type="button"
                  class="kp-create-output__btn pi-focus-ring"
                  data-test="kp-output-pdf"
                  (click)="draft.requestOutput('pdf')"
                >
                  PDF
                </button>
                <button
                  type="button"
                  class="kp-create-output__btn pi-focus-ring"
                  data-test="kp-output-archive"
                  (click)="draft.requestOutput('archive')"
                >
                  Сохранить в архив документов
                </button>
              </div>
            }
            @default {
              <div class="kp-ws-note">Выберите инструмент слева или справа.</div>
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

    @if (draft.catalogReviewOpen()) {
      <div
        #catalogReview
        class="kp-catalog-review"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kp-catalog-review-title"
      >
        <div class="kp-catalog-review__card">
          <div class="kp-catalog-review__header">
            <div>
              <p class="eyebrow m-0">Каталог</p>
              <h2 id="kp-catalog-review-title">Изменения в строках КП</h2>
              <p>Изменения уже сохранены в этом КП. Что сделать с карточками изделий?</p>
            </div>
            <button
              type="button"
              class="kp-catalog-review__close"
              (click)="draft.dismissCatalogReview()"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
          <div class="kp-catalog-review__rows">
            @for (entry of draft.catalogReviewRows(); track entry.index) {
              <article
                class="kp-catalog-review__row"
                [attr.data-test]="'kp-catalog-review-row-' + entry.index"
              >
                <div class="kp-catalog-review__row-copy">
                  <strong>{{ entry.line.productName || 'Без названия' }}</strong>
                  <span>{{ entry.line.catalogDirtyFields?.join(', ') }}</span>
                  <small>{{ draft.catalogDiffText(entry) }}</small>
                </div>
                <div class="kp-catalog-review__actions">
                  <button
                    type="button"
                    [attr.data-test]="'kp-catalog-review-kp-only-' + entry.index"
                    (click)="draft.resolveCatalogRow(entry.index, 'kp-only')"
                  >
                    Только в КП
                  </button>
                  <button
                    type="button"
                    [attr.data-test]="'kp-catalog-review-update-' + entry.index"
                    (click)="draft.resolveCatalogRow(entry.index, 'update')"
                  >
                    Обновить изделие
                  </button>
                  <button
                    type="button"
                    [attr.data-test]="'kp-catalog-review-copy-' + entry.index"
                    (click)="draft.resolveCatalogRow(entry.index, 'copy')"
                  >
                    Создать копию
                  </button>
                </div>
              </article>
            }
          </div>
          @if (draft.catalogReviewError()) {
            <p class="kp-catalog-review__error" role="alert">{{ draft.catalogReviewError() }}</p>
          }
          <div class="kp-catalog-review__footer">
            <button
              type="button"
              class="kp-catalog-review__cancel"
              (click)="draft.cancelCatalogReview()"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    }
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
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly injector = inject(Injector);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  protected readonly textBlocksVersion = signal(0);
  private activeCatalogReviewTrap: ConfigurableFocusTrap | null = null;
  private catalogReviewPreviousFocus: HTMLElement | null = null;
  private readonly catalogReviewRef = viewChild<ElementRef<HTMLElement>>('catalogReview');
  private readonly templateCenter = viewChild(ProposalCreateTemplateCenterComponent);

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

    // TZ-UI-WR-510: focus trap + return-focus for the catalog review modal.
    effect(() => {
      if (this.draft.catalogReviewOpen()) {
        afterNextRender(
          () => {
            const el = this.catalogReviewRef()?.nativeElement;
            if (el && !this.activeCatalogReviewTrap) {
              this.activeCatalogReviewTrap = this.focusTrapFactory.create(el);
              this.activeCatalogReviewTrap.focusInitialElementWhenReady().catch(() => {});
            }
          },
          { injector: this.injector },
        );
      } else {
        this.activeCatalogReviewTrap?.destroy();
        this.activeCatalogReviewTrap = null;
        const prev = this.catalogReviewPreviousFocus;
        this.catalogReviewPreviousFocus = null;
        if (prev && prev.isConnected) prev.focus({ preventScroll: true });
      }
    });

    this.destroyRef.onDestroy(() => this.chromeTools.clear(CHROME_OWNER));
  }

  protected onSectionChange(id: string): void {
    this.switchSection(id as WsSection);
  }

  /** Exit guard: leaving the table with pending catalog rows opens the review first. */
  protected switchSection(id: WsSection): void {
    const leavingTable =
      this.store.activeSection() === 'table' && id !== 'table' && this.store.panelOpen();
    const apply = (): void => this.store.toggleSection(id);
    if (leavingTable) this.draft.requestTableExit(apply);
    else apply();
  }

  /** TZ-KP-WS-405 — inline text-block create/edit in a PiDialog (no route change). */
  protected openTextBlockEditor(): void {
    if (this.draft.isReadOnly()) return;
    const ref = this.dialog.open<TextBlock | null>(ProposalWorkspaceTextBlockDialogComponent, {
      data: { block: null },
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.textBlocksVersion.update((version) => version + 1);
      this.toast.success('Текстовый блок создан');
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    // Formal exception KP-CATALOG-REVIEW-NO-ESC (TZ-UI-WR-510).
    if (this.draft.catalogReviewOpen()) return;
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
      onClick: () => this.switchSection(def.id),
    }));
    this.chromeTools.setTools(CHROME_OWNER, items);
  }
}
