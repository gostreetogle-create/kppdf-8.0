import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ContactRound,
  FileText,
  LucideAngularModule,
  Package,
  SlidersHorizontal,
  TableProperties,
  ListTree,
} from 'lucide-angular';
import { Subject, catchError, debounceTime, forkJoin, map, of, switchMap, tap } from 'rxjs';
import type { SilentResult } from '../../../core/silent-http';
import { extractErrorMessage } from '../../../core/silent-http';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { Product, ProductsService } from '../../../shared/services/products.service';
import {
  ProductModulesService,
  type ProductModule,
} from '../../../shared/services/pi-product-modules.service';
import { MaterialsService, type Material } from '../../../shared/services/materials.service';
import { ProductFormDialogComponent } from '../../products/product-form-dialog.component';
import { ModuleFormDialogComponent } from '../../modules/module-form-dialog.component';
import { MaterialFormDialogComponent } from '../../materials/material-form-dialog.component';
import { photoListUrl, type Photo } from '../../../shared/services/photos.service';
import {
  DocumentTemplatesService,
  type BuildPreviewLine,
  type BuildSheetLayout,
  type BuildTableLayoutColumn,
  type DocumentTemplate,
} from '../../../shared/services/pi-document-templates.service';
import {
  TableTemplatesService,
  type TableTemplate,
} from '../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { GeneratedDocumentsService } from '../../../shared/services/pi-generated-documents.service';
import {
  ProposalsService,
  type Proposal,
  type ProposalVersionSummary,
} from '../../../shared/services/pi-proposals.service';
import { PiToastService } from '../../../shared/ui/toast';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';
import { ProposalDraftLine, ProposalProductRailComponent } from './proposal-product-rail.component';
import {
  ProposalCreateCompositionComponent,
  type ProposalCompositionLineChange,
} from './proposal-create-composition.component';
import {
  ProposalCreateInspectorComponent,
  type ProposalCreateInspectorState,
  type ProposalCreateStatus,
  type ProposalSheetLayoutState,
  type ProposalTableLayoutColumn,
  type ProposalTableTarget,
} from './proposal-create-inspector.component';
import {
  ProposalCreateTemplateCenterComponent,
  type KpTemplatePreviewStatus,
} from './proposal-create-template-center.component';
import { ProposalCreateTemplatePickerComponent } from './proposal-create-template-picker.component';
import {
  ProposalCreateRecipientComponent,
  type ProposalRecipientState,
} from './proposal-create-recipient.component';
import { ProposalCreateTermsComponent, type ProposalTerm } from './proposal-create-terms.component';

/** Which left tool flyout is open (mutually exclusive). */
type LeftTool = 'template' | 'products' | 'recipient' | null;

type RightPane = 'params' | 'table' | 'composition' | 'terms';

const DEFAULT_KP_SHEET_LAYOUT: ProposalSheetLayoutState = {
  rowsFirstPage: 0,
  rowsNextPage: 0,
  photoScalePercent: 100,
  photoCropYPercent: 0,
  showPhotoColumn: true,
};

const DEFAULT_KP_TABLE_LAYOUT: ProposalTableLayoutColumn[] = [
  { key: 'index', label: '№', visible: true },
  { key: 'productName', label: 'Наименование', visible: true },
  { key: 'quantity', label: 'Кол-во', visible: true },
  { key: 'unit', label: 'Ед.', visible: true },
  { key: 'unitPrice', label: 'Цена', visible: true },
  { key: 'sum', label: 'Сумма', visible: true },
];

/**
 * Create-KP focus shell (TZ-SALES-317) + template build preview (TZ-SALES-319).
 *
 * Rails stay fixed; tool panels overlay the center and never resize the A4 sheet.
 * Center sheet shows sandboxed HTML from `DocumentTemplatesService.build`.
 */
@Component({
  selector: 'app-proposal-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    LucideAngularModule,
    ProposalProductRailComponent,
    ProposalCreateCompositionComponent,
    ProposalCreateInspectorComponent,
    ProposalCreateTemplateCenterComponent,
    ProposalCreateTemplatePickerComponent,
    ProposalCreateRecipientComponent,
    ProposalCreateTermsComponent,
  ],
  template: `
    <app-pi-group-workspace
      [toc]="dealsToc"
      tocActiveId="proposals"
      [chips]="kpSectionChips"
      activeId="create"
      [flushBody]="true"
    >
      <div class="kp-create-studio" data-test="kp-create-studio" #studioRoot>
        <div class="kp-create-studio__body" data-test="kp-create-body">
          <nav
            class="kp-create-studio__rail kp-create-studio__rail--left"
            data-test="kp-rail-left"
            aria-label="Инструменты КП"
            #leftRail
          >
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="leftTool() === 'template'"
              [attr.aria-expanded]="leftTool() === 'template'"
              aria-controls="kp-flyout-template"
              aria-label="Шаблон"
              title="Шаблон"
              data-test="kp-create-toggle-template"
              (click)="toggleLeftTool('template')"
            >
              <lucide-angular [img]="fileIcon" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="leftTool() === 'products'"
              [attr.aria-expanded]="leftTool() === 'products'"
              aria-controls="kp-flyout-products"
              aria-label="Товары"
              title="Товары"
              data-test="kp-create-toggle-left"
              (click)="toggleLeftTool('products')"
            >
              <lucide-angular [img]="packageIcon" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="leftTool() === 'recipient'"
              [attr.aria-expanded]="leftTool() === 'recipient'"
              aria-controls="kp-flyout-recipient"
              aria-label="Получатель"
              title="Получатель"
              data-test="kp-create-toggle-recipient"
              (click)="toggleLeftTool('recipient')"
            >
              <lucide-angular [img]="recipientIcon" [size]="18" aria-hidden="true" />
            </button>
          </nav>

          <section
            class="kp-create-studio__center"
            data-test="kp-create-center"
            aria-label="Превью КП"
          >
            @if (selectedTemplate()) {
              <div class="kp-create-studio__savebar" data-test="kp-save-bar">
                @if (autosaveLabel()) {
                  <span class="text-[11px] text-muted-foreground" data-test="kp-autosave-status">
                    {{ autosaveLabel() }}
                  </span>
                }
                @if (previewStatus() === 'ready') {
                  <span class="text-[11px] text-muted-foreground" data-test="kp-page-count">
                    Страница 1{{ previewPageCount() > 1 ? ' из ' + previewPageCount() : '' }}
                  </span>
                }
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]"
                  data-test="kp-studio-status"
                >
                  {{ statusLabel() }}
                </span>
                @if (!isVersionView() && !isReadOnly() && nextStatusOptions().length) {
                  <select
                    class="pi-input w-auto text-xs"
                    [value]="proposalStatus()"
                    data-test="kp-top-status-select"
                    (change)="onTopStatusChange($event)"
                  >
                    <option [value]="proposalStatus()">Изменить статус…</option>
                    @for (option of nextStatusOptions(); track option) {
                      <option [value]="option">{{ statusLabel(option) }}</option>
                    }
                  </select>
                }
                @if (isVersionView()) {
                  <button
                    type="button"
                    class="text-xs underline pi-focus-ring"
                    data-test="kp-version-return"
                    (click)="returnToCurrentVersion()"
                  >
                    Вернуться к текущему
                  </button>
                }
                @if (previewStatus() === 'ready' && !isVersionView()) {
                  @if (!hasDraftId()) {
                    <button
                      type="button"
                      class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                      data-test="kp-create-order"
                      disabled
                      aria-label="Создать заказ можно после сохранения и принятия КП"
                      title="Сначала сохраните КП, затем переведите его в статус «Принято»"
                    >
                      Создать заказ
                    </button>
                  }
                  @if (hasDraftId()) {
                    <button
                      type="button"
                      class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                      data-test="kp-save-version"
                      [disabled]="isReadOnly()"
                      (click)="saveVersion()"
                    >
                      Сохранить версию
                    </button>
                    <button
                      type="button"
                      class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                      data-test="kp-toggle-versions"
                      (click)="toggleVersionMenu()"
                    >
                      Версии ({{ versionSummaries().length }}) ▾
                    </button>
                    @if (versionMenuOpen()) {
                      <div
                        class="absolute right-0 top-full z-40 mt-1 min-w-[18rem] border hairline rounded-sm bg-paper p-2 shadow-lg"
                        data-test="kp-version-menu"
                      >
                        @for (version of versionSummaries(); track version.version) {
                          <button
                            type="button"
                            class="block w-full text-left px-2 py-1 text-xs hover:bg-paper-2"
                            (click)="openVersion(version.version)"
                          >
                            v{{ version.version }} · {{ formatVersionDate(version.frozenAt) }}
                          </button>
                        }
                        @if (!versionSummaries().length) {
                          <span class="block px-2 py-1 text-xs text-muted-foreground"
                            >Версий пока нет</span
                          >
                        }
                      </div>
                    }
                    @if (hasDraftId()) {
                      <button
                        type="button"
                        class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                        data-test="kp-create-order"
                        [disabled]="proposalStatus() !== 'accepted' || isVersionView()"
                        [attr.aria-label]="
                          proposalStatus() === 'accepted'
                            ? 'Создать заказ из принятого КП'
                            : 'Создать заказ можно после принятия КП'
                        "
                        [title]="
                          proposalStatus() === 'accepted'
                            ? 'Создать заказ из принятого КП'
                            : 'Сначала переведите КП в статус «Принято»'
                        "
                        (click)="createOrder()"
                      >
                        Создать заказ
                      </button>
                      <button
                        type="button"
                        class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                        data-test="kp-duplicate"
                        (click)="duplicateCurrent()"
                      >
                        Копировать КП
                      </button>
                    }
                  }
                  <div class="relative ml-auto">
                    <button
                      type="button"
                      class="pi-icon-btn gap-1 px-2 w-auto text-xs pi-focus-ring"
                      data-test="kp-download-menu"
                      aria-haspopup="menu"
                      [attr.aria-expanded]="downloadMenuOpen()"
                      (click)="toggleDownloadMenu()"
                    >
                      Скачать ▾
                    </button>
                    @if (downloadMenuOpen()) {
                      <div
                        class="absolute right-0 top-full z-40 mt-1 min-w-[14rem] border hairline rounded-sm bg-paper p-1 shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          class="block w-full text-left px-3 py-2 text-xs hover:bg-paper-2"
                          role="menuitem"
                          (click)="requestOutput('pdf')"
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          class="block w-full text-left px-3 py-2 text-xs hover:bg-paper-2"
                          role="menuitem"
                          (click)="requestOutput('print')"
                        >
                          Печать
                        </button>
                        <button
                          type="button"
                          class="block w-full text-left px-3 py-2 text-xs hover:bg-paper-2"
                          role="menuitem"
                          (click)="requestOutput('archive')"
                        >
                          Сохранить в архив документов
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
            <app-proposal-create-template-center
              #templateCenter
              [selected]="selectedTemplate()"
              [previewHtml]="previewHtml()"
              [previewPages]="previewPages()"
              [previewStatus]="previewStatus()"
              (requestPick)="openTemplateTool()"
            />
          </section>

          <nav
            class="kp-create-studio__rail kp-create-studio__rail--right"
            data-test="kp-rail-right"
            aria-label="Инструменты КП"
            #rightRail
          >
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="
                rightOpen() && rightPane() === 'composition'
              "
              [attr.aria-expanded]="rightOpen() && rightPane() === 'composition'"
              aria-controls="kp-flyout-composition"
              aria-label="Состав"
              title="Состав"
              data-test="kp-create-toggle-composition"
              (click)="toggleRightPane('composition')"
            >
              <lucide-angular [img]="compositionIcon" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="rightOpen() && rightPane() === 'params'"
              [attr.aria-expanded]="rightOpen() && rightPane() === 'params'"
              aria-controls="kp-flyout-params"
              aria-label="Параметры"
              title="Параметры"
              data-test="kp-create-toggle-right"
              (click)="toggleRightPane('params')"
            >
              <lucide-angular [img]="slidersIcon" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="rightOpen() && rightPane() === 'table'"
              [attr.aria-expanded]="rightOpen() && rightPane() === 'table'"
              aria-controls="kp-flyout-table"
              aria-label="Таблица"
              title="Таблица"
              data-test="kp-create-toggle-table"
              (click)="toggleRightPane('table')"
            >
              <lucide-angular [img]="tableIcon" [size]="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="rightOpen() && rightPane() === 'terms'"
              [attr.aria-expanded]="rightOpen() && rightPane() === 'terms'"
              aria-controls="kp-flyout-terms"
              aria-label="Условия"
              title="Условия"
              data-test="kp-create-toggle-terms"
              (click)="toggleRightPane('terms')"
            >
              <lucide-angular [img]="termsIcon" [size]="18" aria-hidden="true" />
            </button>
          </nav>

          @if (leftTool() === 'template') {
            <aside
              id="kp-flyout-template"
              class="kp-create-studio__flyout kp-create-studio__flyout--left"
              data-test="kp-create-left"
              data-flyout="template"
              aria-label="Шаблон КП"
              #leftFlyout
            >
              <app-proposal-create-template-picker
                [initialId]="selectedTemplate()?._id ?? ''"
                (templateChange)="onTemplateChange($event)"
              />
            </aside>
          }

          @if (leftTool() === 'products') {
            <aside
              id="kp-flyout-products"
              class="kp-create-studio__flyout kp-create-studio__flyout--left"
              data-test="kp-create-products"
              data-flyout="products"
              aria-label="Товары"
              #productsFlyout
            >
              <app-proposal-product-rail
                [draftLines]="draftLines()"
                [readOnly]="isReadOnly()"
                (productAdd)="onProductAdd($event)"
                (quantityChange)="onQuantityChange($event)"
              />
            </aside>
          }

          @if (leftTool() === 'recipient') {
            <aside
              id="kp-flyout-recipient"
              class="kp-create-studio__flyout kp-create-studio__flyout--left"
              data-test="kp-create-recipient"
              data-flyout="recipient"
              aria-label="Получатель"
              #recipientFlyout
            >
              <app-proposal-create-recipient
                [selectedCounterpartyId]="counterpartyId()"
                [selectedContactPersonId]="contactPersonId()"
                [selectedSiteId]="siteId()"
                [readOnly]="isReadOnly()"
                (stateChange)="onRecipientState($event)"
              />
            </aside>
          }

          @if (leftTool() || rightOpen()) {
            <button
              type="button"
              class="kp-create-studio__backdrop"
              aria-label="Закрыть панели"
              data-test="kp-create-backdrop"
              (click)="closeFlyouts()"
            ></button>
          }

          @if (rightOpen()) {
            <aside
              class="kp-create-studio__flyout kp-create-studio__flyout--right"
              [attr.data-flyout]="rightPane()"
              [attr.id]="
                rightPane() === 'composition'
                  ? 'kp-flyout-composition'
                  : rightPane() === 'table'
                    ? 'kp-flyout-table'
                    : rightPane() === 'terms'
                      ? 'kp-flyout-terms'
                      : 'kp-flyout-params'
              "
              data-test="kp-create-right"
              [attr.aria-label]="
                rightPane() === 'composition'
                  ? 'Состав КП'
                  : rightPane() === 'table'
                    ? 'Таблица'
                    : rightPane() === 'terms'
                      ? 'Условия'
                      : 'Параметры'
              "
              #rightFlyout
            >
              @if (rightPane() === 'composition') {
                <app-proposal-create-composition
                  [lines]="draftLines()"
                  [total]="compositionTotal()"
                  [readOnly]="isReadOnly()"
                  (lineChange)="onCompositionLineChange($event)"
                  (addCustom)="addCustomLine()"
                  (openProducts)="openProductsTool()"
                  (remove)="removeCompositionLine($event)"
                  (duplicate)="duplicateCompositionLine($event)"
                  (move)="moveCompositionLine($event)"
                  (editLine)="editCompositionLine($event)"
                />
              } @else if (rightPane() === 'terms') {
                <app-proposal-create-terms
                  [terms]="terms()"
                  [readOnly]="isReadOnly()"
                  (termsChange)="onTermsChange($event)"
                />
              } @else {
                <app-proposal-create-inspector
                  [draftLines]="draftLines()"
                  [tableLayout]="kpTableLayout()"
                  [tableOnly]="rightPane() === 'table'"
                  [tableTemplateId]="tableTemplateId()"
                  [tableTargets]="tableTargets()"
                  [selectedTableTargetId]="selectedTableTargetId()"
                  [selectedCounterpartyId]="counterpartyId()"
                  [initialNumber]="proposalNumber()"
                  [initialTitle]="proposalTitle()"
                  [initialDate]="proposalDate()"
                  [initialValidUntil]="proposalValidUntil()"
                  [initialDiscountType]="discountType()"
                  [initialDiscountPercent]="discountPercent()"
                  [initialDiscountAmount]="discountAmount()"
                  [initialPrepaymentPercent]="prepaymentPercent()"
                  [initialProductionDays]="productionDays()"
                  [initialDeliveryDays]="deliveryDays()"
                  [initialOrganizationId]="organizationId()"
                  [initialOrgMarkupPercent]="orgMarkupPercent()"
                  [initialDealVatPercent]="dealVatPercent()"
                  [initialSheetLayout]="sheetLayout()"
                  [readOnly]="isReadOnly()"
                  [status]="proposalStatus()"
                  (stateChange)="onInspectorState($event)"
                  (recipientEditRequest)="openRecipientTool()"
                  (tableLayoutChange)="onTableLayoutChange($event)"
                  (commercialColumnsRequest)="addCommercialColumns()"
                  (tableTargetChange)="onTableTargetChange($event)"
                  (statusRequest)="onStatusRequest($event)"
                />
              }
            </aside>
          }
        </div>
      </div>
    </app-pi-group-workspace>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    .kp-create-studio {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 7.25rem);
      max-height: calc(100vh - 7.25rem);
      min-height: 0;
      overflow: hidden;
    }

    /* Fixed chrome: rails never push the center. Flyouts are absolute overlays. */
    .kp-create-studio__body {
      position: relative;
      display: grid;
      grid-template-columns: var(--kp-rail) minmax(0, 1fr) var(--kp-rail);
      grid-template-areas: 'left-rail center right-rail';
      flex: 1;
      min-height: 0;
      overflow: hidden;
      --kp-rail: 3rem;
      --kp-flyout-w: min(20rem, calc(100% - (var(--kp-rail) * 2) - 1rem));
    }

    .kp-create-studio__backdrop {
      position: absolute;
      inset: 0;
      z-index: 10;
      border: 0;
      padding: 0;
      background: transparent;
      cursor: default;
    }

    .kp-create-studio__rail {
      position: relative;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0;
      border: 1px solid var(--color-rule);
      background: var(--color-paper-raised, var(--color-paper, transparent));
      min-height: 0;
    }

    .kp-create-studio__rail--left {
      grid-area: left-rail;
    }

    .kp-create-studio__rail--right {
      grid-area: right-rail;
    }

    .kp-create-studio__rail-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border: 1px solid transparent;
      border-radius: 2px;
      background: transparent;
      color: var(--color-muted);
      cursor: pointer;
    }

    .kp-create-studio__rail-btn:hover {
      color: var(--color-ink);
      border-color: var(--color-rule);
    }

    .kp-create-studio__rail-btn--active {
      color: var(--color-on-gold, var(--color-ink));
      background: var(--color-gold);
      border-color: var(--color-gold-deep);
    }

    .kp-create-studio__center {
      grid-area: center;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      padding: 0.5rem;
    }

    .kp-create-studio__savebar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex: 0 0 auto;
      min-height: 2.5rem;
      padding: 0 0.25rem 0.4rem;
    }

    .kp-create-studio__flyout {
      position: absolute;
      top: 0.5rem;
      bottom: auto;
      z-index: 20;
      width: var(--kp-flyout-w);
      max-width: calc(100% - (var(--kp-rail) * 2) - 1rem);
      max-height: calc(100% - 1rem);
      height: auto;
      padding: 0.75rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 94%, transparent);
      box-shadow: var(--shadow-raised, 0 8px 24px oklch(0.2 0.02 260 / 0.12));
      overflow: auto;
      min-height: 0;
    }

    .kp-create-studio__flyout[data-flyout='products'] {
      width: min(58rem, calc(100% - (var(--kp-rail) * 2) - 1rem));
    }

    /* TZ-SALES-355: Состав ≈ половина экрана, табличный стиль (не 20rem-куча карточек). */
    .kp-create-studio__flyout[data-flyout='composition'] {
      width: min(50vw, 52rem);
      max-width: calc(100% - (var(--kp-rail) * 2) - 1rem);
      padding: 0.55rem 0.65rem;
    }

    .kp-create-studio__flyout--left {
      left: var(--kp-rail);
    }

    .kp-create-studio__flyout--right {
      right: var(--kp-rail);
    }

    .kp-create-studio__flyout[data-flyout='products'] {
      padding: 0.5rem;
    }
  `,
})
export class ProposalCreatePage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly templatesSvc = inject(DocumentTemplatesService);
  private readonly router = inject(Router);
  private readonly proposalsSvc = inject(ProposalsService);
  private readonly generatedDocumentsSvc = inject(GeneratedDocumentsService);
  private readonly toast = inject(PiToastService);
  private readonly tableTemplatesSvc = inject(TableTemplatesService);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialog = inject(PiDialogService);
  private readonly productsSvc = inject(ProductsService);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly injector = inject(Injector);

  @ViewChild('leftRail') private leftRail?: ElementRef<HTMLElement>;
  @ViewChild('rightRail') private rightRail?: ElementRef<HTMLElement>;
  @ViewChild('leftFlyout') private leftFlyout?: ElementRef<HTMLElement>;
  @ViewChild('productsFlyout') private productsFlyout?: ElementRef<HTMLElement>;
  @ViewChild('recipientFlyout') private recipientFlyout?: ElementRef<HTMLElement>;
  @ViewChild('rightFlyout') private rightFlyout?: ElementRef<HTMLElement>;
  @ViewChild('templateCenter') private templateCenter?: ProposalCreateTemplateCenterComponent;

  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly kpSectionChips = KP_SECTION_CHIPS;
  protected readonly fileIcon = FileText;
  protected readonly packageIcon = Package;
  protected readonly recipientIcon = ContactRound;
  protected readonly slidersIcon = SlidersHorizontal;
  protected readonly tableIcon = TableProperties;
  protected readonly termsIcon = FileText;
  protected readonly compositionIcon = ListTree;

  protected readonly isWide = signal(true);
  protected readonly leftTool = signal<LeftTool>(null);
  protected readonly rightOpen = signal(false);
  protected readonly rightPane = signal<RightPane>('params');
  protected readonly selectedTemplate = signal<DocumentTemplate | null>(null);
  /** In-memory draft positions (SALES-314). Not persisted; not painted on the sheet (319). */
  protected readonly draftLines = signal<ProposalDraftLine[]>([]);
  protected readonly previewHtml = signal<SafeHtml | null>(null);
  protected readonly previewPages = signal<SafeHtml[]>([]);
  private readonly previewHtmlSource = signal<string | null>(null);
  protected readonly previewStatus = signal<KpTemplatePreviewStatus>('idle');
  protected readonly organizationId = signal('');
  protected readonly counterpartyId = signal('');
  protected readonly contactPersonId = signal('');
  protected readonly siteId = signal('');
  protected readonly terms = signal<ProposalTerm[]>([]);
  protected readonly orgMarkupPercent = signal(0);
  protected readonly dealVatPercent = signal(20);
  protected readonly proposalNumber = signal('');
  protected readonly proposalTitle = signal('');
  protected readonly proposalDate = signal('');
  protected readonly proposalValidUntil = signal('');
  protected readonly discountType = signal<'none' | 'percent' | 'amount'>('none');
  protected readonly discountPercent = signal(0);
  protected readonly discountAmount = signal(0);
  protected readonly prepaymentPercent = signal(0);
  protected readonly productionDays = signal(0);
  protected readonly deliveryDays = signal(0);
  protected readonly kpTableLayout = signal<ProposalTableLayoutColumn[]>(
    DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })),
  );
  protected readonly sheetLayout = signal<ProposalSheetLayoutState>({ ...DEFAULT_KP_SHEET_LAYOUT });
  protected readonly previewPageCount = computed(() => Math.max(1, this.previewPages().length));
  protected readonly compositionTotal = computed(() => this.calculateDealTotal());
  protected readonly tableTemplateId = signal<string | null>(null);
  protected readonly tableTargets = signal<ProposalTableTarget[]>([]);
  protected readonly selectedTableTargetId = signal<string | null>(null);
  private readonly tableTargetLayouts = signal<Record<string, ProposalTableLayoutColumn[]>>({});
  protected readonly autosaveLabel = signal('');
  protected readonly downloadMenuOpen = signal(false);
  protected readonly proposalStatus = signal<ProposalCreateStatus>('draft');
  protected readonly versionMenuOpen = signal(false);
  protected readonly versionSummaries = signal<ProposalVersionSummary[]>([]);
  protected readonly currentDraftId = signal<string | null>(null);
  protected readonly hasDraftId = computed(() => Boolean(this.currentDraftId()));
  protected readonly isVersionView = signal(false);
  protected readonly isReadOnly = computed(
    () =>
      this.isVersionView() ||
      this.proposalStatus() === 'accepted' ||
      this.proposalStatus() === 'converted' ||
      this.proposalStatus() === 'cancelled',
  );
  private currentPreviewBeforeVersion: string | null = null;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private autosaveToastShown = false;
  private pendingOutput: (() => void) | null = null;
  private pendingRoutePrint = false;

  private readonly rebuildPreview$ = new Subject<void>();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.rebuildPreview$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          const tpl = this.selectedTemplate();
          if (!tpl?._id) {
            this.setPreviewHtml(null);
            this.previewStatus.set('idle');
            return of(null);
          }
          // Keep previous A4 visible while rebuilding — avoids blink on qty/price edits.
          const keepShowing =
            this.previewStatus() === 'ready' && !!this.previewHtmlSource()?.trim();
          if (!keepShowing) {
            this.previewStatus.set('loading');
          }
          const org = this.organizationId().trim();
          const markup = this.clampMarkup(this.orgMarkupPercent());
          const previewLines: BuildPreviewLine[] = this.draftLines().map((line) => ({
            ...(line.lineKind && line.lineKind !== 'catalog' ? { lineKind: line.lineKind } : {}),
            productName: line.productName || 'Своя строка',
            ...(line.description ? { description: line.description } : {}),
            quantity: line.quantity,
            unitPrice: this.roundMoney(line.unitPrice * (1 + markup / 100)),
            ...(line.productSku ? { productSku: line.productSku } : {}),
            ...(line.photoUrl ? { photoUrl: line.photoUrl } : {}),
            ...(line.unit ? { unit: line.unit } : {}),
            ...(line.discountPercent
              ? { discountPercent: Math.min(100, Math.max(0, line.discountPercent)) }
              : {}),
            ...(line.isOptional ? { isOptional: true } : {}),
          }));
          const tableLayout: BuildTableLayoutColumn[] = this.kpTableLayout().map(
            ({ key, visible }) => ({ key, visible }),
          );
          const payload = {
            previewLines,
            tableLayout,
            sheetLayout: this.sheetLayout() as BuildSheetLayout,
            tableTargetId: this.tableTemplateId() ?? undefined,
            dealTotals: {
              vatPercent: this.clampVat(this.dealVatPercent()),
              discountType: this.discountType(),
              discountPercent: this.discountPercent(),
              discountAmount: this.discountAmount(),
              prepaymentPercent: this.prepaymentPercent(),
              productionDays: this.productionDays(),
              deliveryDays: this.deliveryDays(),
            },
            ...(org ? { organizationId: org } : {}),
            ...(this.counterpartyId().trim()
              ? { counterpartyId: this.counterpartyId().trim() }
              : {}),
            ...(this.contactPersonId().trim()
              ? { contactPersonId: this.contactPersonId().trim() }
              : {}),
            ...(this.siteId().trim() ? { siteId: this.siteId().trim() } : {}),
            terms: this.terms(),
            proposalNumber: this.proposalNumber().trim() || undefined,
            ...(this.proposalDate() ? { proposalDate: this.proposalDate() } : {}),
            ...(this.proposalValidUntil() ? { validUntil: this.proposalValidUntil() } : {}),
            totalPrice: this.compositionTotal(),
          };
          return this.templatesSvc.build(tpl._id, payload).pipe(
            tap((res) => {
              if (res.ok && typeof res.data === 'string') {
                this.setPreviewHtml(res.data);
                this.previewStatus.set('ready');
                this.scheduleAutosave();
                if (this.pendingRoutePrint) {
                  this.pendingRoutePrint = false;
                  setTimeout(() => this.printCurrentPreview(), 0);
                }
              } else if (!keepShowing) {
                this.setPreviewHtml(null);
                this.previewStatus.set('error');
              } else {
                this.toast.warning('Не удалось обновить превью — на листе предыдущая версия');
              }
            }),
            catchError(() => {
              if (!keepShowing) {
                this.setPreviewHtml(null);
                this.previewStatus.set('error');
              } else {
                this.toast.warning('Не удалось обновить превью — на листе предыдущая версия');
              }
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    this.destroyRef.onDestroy(() => this.cancelAutosave());
  }

  ngOnInit(): void {
    this.pendingRoutePrint = this.route?.snapshot.queryParamMap.get('action') === 'print';
    const queryId = this.route?.snapshot.queryParamMap.get('id')?.trim();
    const isNew = this.route?.snapshot.queryParamMap.get('new') === '1';
    if (queryId) {
      this.resumeDraftById(queryId);
    } else if (isNew) {
      this.clearLocalDraftPointers();
    } else {
      this.resumeLastDraft();
    }
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      this.isWide.set(true);
      return;
    }

    this.mediaQuery = window.matchMedia('(min-width: 1280px)');
    this.isWide.set(this.mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      this.isWide.set(event.matches);
      if (!event.matches && this.leftTool() && this.rightOpen()) {
        this.rightOpen.set(false);
      }
    };
    this.mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => {
      this.mediaQuery?.removeEventListener('change', onChange);
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeFlyouts();
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: PointerEvent): void {
    if (!this.leftTool() && !this.rightOpen()) return;
    const target = event.target as Node | null;
    if (!target) return;

    if (target instanceof Element && target.closest('.cdk-overlay-container')) {
      return;
    }

    const inside = [
      this.leftRail?.nativeElement,
      this.rightRail?.nativeElement,
      this.leftFlyout?.nativeElement,
      this.productsFlyout?.nativeElement,
      this.recipientFlyout?.nativeElement,
      this.rightFlyout?.nativeElement,
    ].some((el) => !!el && el.contains(target));

    if (!inside) {
      this.closeFlyouts();
    }
  }

  protected openTemplateTool(): void {
    if (this.isReadOnly()) return;
    this.leftTool.set('template');
    if (!this.isWide()) this.rightOpen.set(false);
  }

  protected onTemplateChange(tpl: DocumentTemplate | null): void {
    this.selectedTemplate.set(tpl);
    this.setPreviewHtml(null);
    if (tpl) this.writeStorage('kp.create.lastTemplateId', tpl._id);
    this.tableTemplateId.set(null);
    this.tableTargets.set([]);
    this.selectedTableTargetId.set(null);
    this.tableTargetLayouts.set({});
    this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));
    this.sheetLayout.set({ ...DEFAULT_KP_SHEET_LAYOUT });
    if (tpl) {
      this.previewStatus.set('loading');
      this.leftTool.set(null);
      this.syncTableTargets(tpl._id);
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    } else {
      this.setPreviewHtml(null);
      this.previewStatus.set('idle');
    }
  }

  protected canSaveDraft(): boolean {
    return Boolean(
      !this.isReadOnly() &&
      this.selectedTemplate()?._id &&
      this.organizationId().trim() &&
      this.previewStatus() === 'ready',
    );
  }

  protected saveDraft(manual = true): void {
    if (this.isReadOnly()) return;
    if (manual) this.cancelAutosave();
    const autosave = !manual;
    const template = this.selectedTemplate();
    const organizationId = this.organizationId().trim();
    const html = this.previewHtmlSource();
    if (!template?._id || !html) {
      if (!autosave) this.toast.error('Сначала выберите шаблон и дождитесь превью листа.');
      return;
    }
    if (!organizationId) {
      if (!autosave) this.toast.error('Выберите нашу фирму для сохранения черновика.');
      return;
    }
    if (autosave) this.autosaveLabel.set('Автосохранение…');

    // Do not send item.total — DTO forbids unknown fields (400).
    const payload: Partial<Proposal> = {
      number: this.proposalNumber().trim() || undefined,
      title: this.proposalTitle().trim() || undefined,
      ...(this.proposalDate() ? { date: this.proposalDate() } : {}),
      ...(this.proposalValidUntil() ? { validUntil: this.proposalValidUntil() } : {}),
      organizationId,
      ...(this.counterpartyId().trim() ? { counterpartyId: this.counterpartyId().trim() } : {}),
      contactPersonId: this.contactPersonId().trim() || null,
      siteId: this.siteId().trim() || null,
      status: this.proposalStatus(),
      orgMarkupPercent: this.clampMarkup(this.orgMarkupPercent()),
      vatPercent: this.clampVat(this.dealVatPercent()),
      discountType: this.discountType(),
      discountPercent: this.discountPercent(),
      discountAmount: this.discountAmount(),
      prepaymentPercent: this.prepaymentPercent(),
      productionDays: this.productionDays(),
      deliveryDays: this.deliveryDays(),
      sheetLayout: this.sheetLayout(),
      terms: this.terms(),
      items: this.draftLines().map((line, index) => ({
        lineKind: line.lineKind ?? (line.productId ? 'catalog' : 'custom'),
        ...(line.lineKind === 'module' || line.lineKind === 'material'
          ? { refId: line.refId ?? line.productId }
          : line.productId && !line.productId.startsWith('custom-')
            ? { productId: line.productId }
            : {}),
        productName: line.productName,
        ...(line.description ? { description: line.description } : {}),
        productSku: line.productSku,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        markupPercent: this.clampMarkup(this.orgMarkupPercent()),
        discountPercent: Math.min(100, Math.max(0, line.discountPercent ?? 0)),
        isOptional: line.isOptional === true,
        sortOrder: index,
      })),
      templateId: template._id,
      templateSnapshot: {
        templateId: template._id,
        html,
        tableLayout: this.kpTableLayout().map(({ key, visible }) => ({ key, visible })),
        sheetLayout: this.sheetLayout(),
        builtAt: new Date().toISOString(),
      },
    };
    const draftId = this.readStorage('kp.create.lastDraftId');
    const persist = (id: string | null) =>
      id ? this.proposalsSvc.update(id, payload) : this.proposalsSvc.create(payload);

    persist(draftId).subscribe((res) => {
      if (!res.ok && draftId && (res.error.status === 404 || res.error.status === 400)) {
        // Soft-deleted / stale local pointer — start a fresh draft once.
        this.removeStorage('kp.create.lastDraftId');
        this.proposalsSvc
          .create(payload)
          .subscribe((retry) => this.finishSave(retry, template._id, autosave));
        return;
      }
      this.finishSave(res, template._id, autosave);
    });
  }

  private finishSave(res: SilentResult<Proposal>, templateId: string, autosave: boolean): void {
    if (!res.ok) {
      this.pendingOutput = null;
      this.autosaveLabel.set('Ошибка автосохранения');
      if (!autosave || !this.autosaveToastShown) {
        this.toast.error('Не удалось сохранить черновик КП.');
        this.autosaveToastShown = true;
      }
      return;
    }
    this.writeStorage('kp.create.lastDraftId', res.data._id);
    this.currentDraftId.set(res.data._id);
    this.writeStorage('kp.create.lastTemplateId', templateId);
    this.proposalNumber.set(res.data.number ?? this.proposalNumber());
    this.proposalStatus.set(res.data.status ?? this.proposalStatus());
    this.autosaveLabel.set('Сохранено');
    if (!autosave || !this.autosaveToastShown) {
      this.toast.success('Черновик сохранён');
      this.autosaveToastShown = true;
    }
    const output = this.pendingOutput;
    this.pendingOutput = null;
    output?.();
  }

  protected toggleDownloadMenu(): void {
    this.downloadMenuOpen.update((open) => !open);
  }

  protected requestOutput(action: 'pdf' | 'print' | 'archive'): void {
    this.downloadMenuOpen.set(false);
    const run = (): void => {
      if (action === 'pdf') this.downloadPdf();
      else if (action === 'print') this.printCurrentPreview();
      else this.archiveCurrentQuotation();
    };
    if (this.proposalStatus() === 'accepted') {
      run();
      return;
    }
    if (!this.canSaveDraft()) {
      this.toast.error('Дождитесь готового превью и выберите нашу фирму.');
      return;
    }
    this.pendingOutput = run;
    this.cancelAutosave();
    this.saveDraft(false);
  }

  private downloadPdf(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) {
      this.toast.error('Сначала сохраните черновик КП.');
      return;
    }
    this.proposalsSvc.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `КП-${this.proposalNumber() || id}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.toast.success('PDF подготовлен');
      },
      error: () => this.toast.error('Сервис печати недоступен, используйте Печать в браузере.'),
    });
  }

  private printCurrentPreview(): void {
    if (!this.previewHtmlSource()) {
      this.toast.error('Превью листа ещё не готово.');
      return;
    }
    this.templateCenter?.printPreview();
  }

  private archiveCurrentQuotation(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) {
      this.toast.error('Сначала сохраните черновик КП.');
      return;
    }
    this.generatedDocumentsSvc.archiveQuotation(id).subscribe((res) => {
      if (res.ok) this.toast.success('КП сохранено в архив документов');
      else this.toast.error('Не удалось сохранить КП в архив документов.');
    });
  }

  private scheduleAutosave(): void {
    if (!this.selectedTemplate()?._id || !this.organizationId().trim()) return;
    this.cancelAutosave();
    this.autosaveTimer = setTimeout(() => {
      this.autosaveTimer = null;
      if (this.canSaveDraft()) this.saveDraft(false);
    }, 1200);
  }

  private cancelAutosave(): void {
    if (this.autosaveTimer !== null) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  private resumeDraftById(id: string): void {
    this.proposalsSvc.findById(id).subscribe((res) => {
      if (res.ok && this.isStudioStatus(res.data.status)) {
        this.writeStorage('kp.create.lastDraftId', id);
        this.currentDraftId.set(id);
        this.hydrateDraft(res.data);
        return;
      }
      this.clearLocalDraftPointers();
      this.draftLines.set([]);
      this.terms.set([]);
      this.selectedTemplate.set(null);
      this.setPreviewHtml(null);
      this.previewStatus.set('idle');
      this.toast.error('КП нельзя открыть для редактирования. Открыт новый лист.');
    });
  }

  private resumeLastDraft(): void {
    const draftId = this.readStorage('kp.create.lastDraftId');
    if (draftId) {
      this.proposalsSvc.findById(draftId).subscribe((res) => {
        if (res.ok && this.isStudioStatus(res.data.status)) {
          this.hydrateDraft(res.data);
          return;
        }
        // Deleted / missing КП — empty studio (do not resurrect last template alone).
        this.clearLocalDraftPointers();
        this.terms.set([]);
      });
      return;
    }
    // No draft pointer: empty studio (do not auto-pick a lonely template).
    this.removeStorage('kp.create.lastTemplateId');
  }

  private clearLocalDraftPointers(): void {
    this.currentDraftId.set(null);
    this.removeStorage('kp.create.lastDraftId');
    this.removeStorage('kp.create.lastTemplateId');
  }

  private resumeLastTemplate(): void {
    const templateId = this.readStorage('kp.create.lastTemplateId');
    if (!templateId) return;
    this.templatesSvc.findById(templateId).subscribe((res) => {
      if (res.ok) this.onTemplateChange(res.data);
    });
  }

  private hydrateDraft(draft: Proposal): void {
    this.currentDraftId.set(this.readStorage('kp.create.lastDraftId'));
    const templateId = this.refId(draft.templateId);
    this.proposalStatus.set(draft.status === 'accepted' ? 'accepted' : 'draft');
    this.organizationId.set(this.refId(draft.organizationId) ?? '');
    this.counterpartyId.set(this.refId(draft.counterpartyId) ?? '');
    this.contactPersonId.set(this.refId(draft.contactPersonId) ?? '');
    this.siteId.set(this.refId(draft.siteId) ?? '');
    this.terms.set(
      (draft.terms ?? []).map((term, index) => ({
        text: term.text ?? '',
        sortOrder: term.sortOrder ?? index,
      })),
    );
    this.orgMarkupPercent.set(this.clampMarkup(draft.orgMarkupPercent ?? 0));
    this.proposalNumber.set(draft.number ?? '');
    this.proposalTitle.set(draft.title ?? '');
    this.proposalDate.set(draft.date ? draft.date.slice(0, 10) : '');
    this.proposalValidUntil.set(draft.validUntil ? draft.validUntil.slice(0, 10) : '');
    this.dealVatPercent.set(this.clampVat(draft.vatPercent ?? 20));
    this.discountType.set(draft.discountType ?? 'none');
    this.discountPercent.set(Math.max(0, draft.discountPercent ?? 0));
    this.discountAmount.set(Math.max(0, draft.discountAmount ?? 0));
    this.prepaymentPercent.set(Math.min(100, Math.max(0, draft.prepaymentPercent ?? 0)));
    this.productionDays.set(Math.max(0, draft.productionDays ?? 0));
    this.deliveryDays.set(Math.max(0, draft.deliveryDays ?? 0));
    this.sheetLayout.set({ ...DEFAULT_KP_SHEET_LAYOUT, ...(draft.sheetLayout ?? {}) });
    this.draftLines.set(
      (draft.items ?? []).map((item) => {
        const lineKind = item.lineKind ?? (this.refId(item.productId) ? 'catalog' : 'custom');
        const refId = this.refId(item.refId);
        const productId =
          lineKind === 'module' || lineKind === 'material'
            ? (refId ?? `typed-${item.sortOrder ?? 0}`)
            : (this.refId(item.productId) ?? `custom-${item.sortOrder ?? 0}`);
        return {
          lineKind,
          productId,
          ...(refId ? { refId } : {}),
          productName: item.productName ?? 'Своя строка',
          ...(item.description ? { description: item.description } : {}),
          productSku: item.productSku,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          ...(item.discountPercent ? { discountPercent: item.discountPercent } : {}),
          ...(item.isOptional ? { isOptional: true } : {}),
        };
      }),
    );
    if (templateId) {
      this.templatesSvc.findById(templateId).subscribe((res) => {
        if (!res.ok) return;
        if (
          draft.status === 'accepted' &&
          this.applyLockedTemplateSnapshot(draft.templateSnapshot)
        ) {
          this.selectedTemplate.set(res.data);
          this.leftTool.set(null);
          return;
        }
        this.onTemplateChange(res.data);
        this.sheetLayout.set({ ...DEFAULT_KP_SHEET_LAYOUT, ...(draft.sheetLayout ?? {}) });
        this.rebuildPreview$.next();
      });
    } else {
      this.resumeLastTemplate();
    }
  }

  /** Accepted КП must keep rendering the saved HTML snapshot, not rebuild from the live template. */
  private applyLockedTemplateSnapshot(snapshot: Record<string, unknown> | undefined): boolean {
    const html = snapshot?.['html'];
    if (typeof html !== 'string' || !html.trim()) return false;
    this.setPreviewHtml(html);
    this.previewStatus.set('ready');
    this.autosaveLabel.set('Сохранено');
    return true;
  }

  private setPreviewHtml(html: string | null): void {
    this.previewHtmlSource.set(html);
    if (!html) {
      this.previewHtml.set(null);
      this.previewPages.set([]);
      return;
    }
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html)));
    if (typeof DOMParser === 'undefined') {
      this.previewPages.set([this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html))]);
      return;
    }
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const pages = Array.from(parsed.querySelectorAll('.doc-page'));
    if (pages.length === 0) {
      this.previewPages.set([this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(html))]);
      return;
    }
    const head = parsed.head?.innerHTML ?? '';
    this.previewPages.set(
      pages.map((page) =>
        this.sanitizer.bypassSecurityTrustHtml(
          this.withBaseHref(
            `<!DOCTYPE html><html><head>${head}</head><body>${page.outerHTML}</body></html>`,
          ),
        ),
      ),
    );
  }

  private isStudioStatus(status: Proposal['status']): boolean {
    return (
      status === 'draft' || status === 'sent' || status === 'accepted' || status === 'rejected'
    );
  }

  protected statusLabel(status = this.proposalStatus()): string {
    const labels: Record<Proposal['status'], string> = {
      draft: 'Черновик',
      sent: 'Отправлено',
      accepted: 'Принято',
      rejected: 'Отклонено',
      converted: 'В заказе',
      cancelled: 'Отменено',
    };
    return labels[status];
  }

  protected formatVersionDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU');
  }

  protected readonly nextStatusOptions = computed<ProposalCreateStatus[]>(() => {
    const transitions: Record<ProposalCreateStatus, ProposalCreateStatus[]> = {
      draft: ['sent'],
      sent: ['accepted', 'rejected'],
      accepted: ['draft'],
      rejected: ['sent'],
      converted: [],
      cancelled: [],
    };
    return transitions[this.proposalStatus()] ?? [];
  });

  protected onTopStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ProposalCreateStatus;
    if (this.nextStatusOptions().includes(status)) this.onStatusRequest(status);
  }

  protected toggleVersionMenu(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) return;
    this.versionMenuOpen.update((open) => !open);
    if (this.versionMenuOpen()) this.loadVersionSummaries(id);
  }

  private loadVersionSummaries(id: string): void {
    this.proposalsSvc.listVersions(id).subscribe((res) => {
      if (res.ok) this.versionSummaries.set(res.data);
      else this.toast.error('Не удалось загрузить версии КП.');
    });
  }

  protected saveVersion(): void {
    if (this.isReadOnly()) return;
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id) return;
    this.proposalsSvc.freeze(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error('Не удалось сохранить версию КП.');
        return;
      }
      this.proposalStatus.set(res.data.status ?? this.proposalStatus());
      this.versionSummaries.update((versions) => [
        ...versions,
        ...(res.data.currentVersion
          ? [{ version: res.data.currentVersion, frozenAt: new Date().toISOString() }]
          : []),
      ]);
      this.toast.success('Версия КП сохранена');
    });
  }

  protected openVersion(version: number): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id || this.isVersionView()) return;
    this.proposalsSvc.getVersion(id, version).subscribe((res) => {
      if (!res.ok) {
        this.toast.error('Не удалось открыть версию КП.');
        return;
      }
      const snapshot = res.data.payload?.['templateSnapshot'];
      const html =
        snapshot && typeof snapshot === 'object'
          ? (snapshot as Record<string, unknown>)['html']
          : undefined;
      if (typeof html !== 'string' || !html.trim()) {
        this.toast.error('В версии нет сохранённого листа для просмотра.');
        return;
      }
      this.currentPreviewBeforeVersion = this.previewHtmlSource();
      this.isVersionView.set(true);
      this.versionMenuOpen.set(false);
      this.cancelAutosave();
      this.setPreviewHtml(html);
      this.previewStatus.set('ready');
    });
  }

  protected returnToCurrentVersion(): void {
    if (!this.isVersionView()) return;
    this.isVersionView.set(false);
    this.setPreviewHtml(this.currentPreviewBeforeVersion);
    this.currentPreviewBeforeVersion = null;
    this.previewStatus.set(this.previewHtmlSource() ? 'ready' : 'idle');
  }

  protected createOrder(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id || this.proposalStatus() !== 'accepted' || this.isVersionView()) return;
    this.proposalsSvc.convertToOrder(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error('Не удалось создать заказ из КП.');
        return;
      }
      this.proposalStatus.set('converted');
      this.toast.success('Заказ создан из КП');
      void this.router.navigate(['/orders', res.data.orderId]);
    });
  }

  protected duplicateCurrent(): void {
    const id = this.readStorage('kp.create.lastDraftId');
    if (!id || this.isVersionView()) return;
    this.proposalsSvc.duplicate(id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error('Не удалось скопировать КП.');
        return;
      }
      this.toast.success(`Создана копия ${res.data.number}`);
      void this.router.navigate(['/proposals/create'], { queryParams: { id: res.data._id } });
    });
  }

  private refId(value: unknown): string | null {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && '_id' in value) {
      return String((value as { _id: string })._id);
    }
    return null;
  }

  private readStorage(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }

  private writeStorage(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  }

  private removeStorage(key: string): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  }

  private syncTableTargets(templateId: string): void {
    this.blocksSvc
      .listByTemplate(templateId)
      .pipe(
        switchMap((blocksResult) => {
          if (!blocksResult.ok) return of({ targets: [], layouts: {} });
          const blocks = blocksResult.data ?? [];
          const liveTables = blocks
            .map((block, index) => {
              const tableId = this.tableTemplateIdForBlock(block);
              if (!tableId) return null;
              const settings = block.settings ?? {};
              return {
                block,
                index,
                tableId,
                explicit: settings['kpLineItems'] === true || settings['role'] === 'line-items',
              };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
          const candidates = liveTables;
          if (candidates.length === 0) return of({ targets: [], layouts: {} });

          return forkJoin(
            candidates.map((candidate) =>
              this.tableTemplatesSvc.findById(candidate.tableId).pipe(
                map((result) => ({ candidate, result })),
                catchError(() => of({ candidate, result: null })),
              ),
            ),
          ).pipe(
            map((results) => {
              const targets: ProposalTableTarget[] = results.map(({ candidate }) => ({
                id: candidate.tableId,
                templateId: candidate.tableId,
                label: candidate.block.title?.trim() || `Таблица ${candidate.index + 1}`,
                explicit: candidate.explicit,
              }));
              const layouts: Record<string, ProposalTableLayoutColumn[]> = {};
              for (const { candidate, result } of results) {
                if (!result?.ok) continue;
                const columns = (result.data as TableTemplate).columns ?? [];
                if (columns.length > 0) {
                  layouts[candidate.tableId] = columns.map((column) => ({
                    key: column.key,
                    label: column.label,
                    visible: true,
                  }));
                }
              }
              return { targets, layouts };
            }),
          );
        }),
      )
      .subscribe(({ targets, layouts }) => {
        if (this.selectedTemplate()?._id !== templateId) return;
        this.tableTargets.set(targets);
        this.tableTargetLayouts.set(layouts);
        const defaultTarget = targets.find((target) => target.explicit) ?? targets[0] ?? null;
        this.selectedTableTargetId.set(defaultTarget?.id ?? null);
        this.applyTableTarget(defaultTarget?.id ?? null);
      });
  }

  private applyTableTarget(targetId: string | null): void {
    const target = this.tableTargets().find((entry) => entry.id === targetId);
    this.tableTemplateId.set(target?.templateId ?? null);
    const layout = targetId ? this.tableTargetLayouts()[targetId] : undefined;
    if (layout?.length) this.kpTableLayout.set(layout.map((column) => ({ ...column })));
    else this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected onTableTargetChange(targetId: string): void {
    if (this.isReadOnly() || !this.tableTargets().some((target) => target.id === targetId)) return;
    this.selectedTableTargetId.set(targetId);
    this.applyTableTarget(targetId);
  }

  private tableTemplateIdForBlock(block: TemplateBlock): string | null {
    if (block.type !== 'table') return null;
    if (block.source?.kind === 'table-template') {
      return block.source.mode === 'snapshot' ? null : block.source.refId;
    }
    const tableId = block.settings?.['tableTemplateId'];
    return typeof tableId === 'string' && tableId.length > 0 ? tableId : null;
  }

  protected onTableLayoutChange(layout: ProposalTableLayoutColumn[]): void {
    if (this.isReadOnly()) return;
    this.kpTableLayout.set(layout.map((column) => ({ ...column })));
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected onRecipientState(state: ProposalRecipientState): void {
    if (this.isReadOnly()) return;
    this.counterpartyId.set(state.counterpartyId.trim());
    this.contactPersonId.set(state.contactPersonId.trim());
    this.siteId.set(state.siteId.trim());
    if (this.selectedTemplate()?._id) this.rebuildPreview$.next();
    this.scheduleAutosave();
  }

  protected onTermsChange(terms: ProposalTerm[]): void {
    if (this.isReadOnly()) return;
    this.terms.set(terms.map((term, sortOrder) => ({ text: term.text, sortOrder })));
    if (this.selectedTemplate()?._id) this.rebuildPreview$.next();
    this.scheduleAutosave();
  }

  protected openRecipientTool(): void {
    if (this.isReadOnly()) return;
    this.leftTool.set('recipient');
    this.rightOpen.set(false);
  }

  protected openProductsTool(): void {
    if (this.isReadOnly()) return;
    this.leftTool.set('products');
    this.rightOpen.set(false);
  }

  protected onInspectorState(state: ProposalCreateInspectorState): void {
    if (this.isReadOnly()) return;
    const nextOrganization = (state.organizationId ?? '').trim();
    const nextCounterparty = (state.counterpartyId ?? '').trim();
    const nextMarkup = this.clampMarkup(state.orgMarkupPercent);
    const nextVat = this.clampVat(state.dealVatPercent ?? this.dealVatPercent());
    const nextDiscountType = state.discountType ?? this.discountType();
    const nextDiscountPercent = Math.max(0, state.discountPercent ?? this.discountPercent());
    const nextDiscountAmount = Math.max(0, state.discountAmount ?? this.discountAmount());
    const nextUnchanged =
      nextOrganization === this.organizationId() &&
      nextCounterparty === this.counterpartyId() &&
      nextMarkup === this.orgMarkupPercent() &&
      nextVat === this.dealVatPercent() &&
      nextDiscountType === this.discountType() &&
      nextDiscountPercent === this.discountPercent() &&
      nextDiscountAmount === this.discountAmount() &&
      (state.number ?? this.proposalNumber()) === this.proposalNumber() &&
      (state.title ?? this.proposalTitle()) === this.proposalTitle() &&
      (state.date ?? this.proposalDate()) === this.proposalDate() &&
      (state.validUntil ?? this.proposalValidUntil()) === this.proposalValidUntil() &&
      (state.prepaymentPercent ?? this.prepaymentPercent()) === this.prepaymentPercent() &&
      (state.productionDays ?? this.productionDays()) === this.productionDays() &&
      (state.deliveryDays ?? this.deliveryDays()) === this.deliveryDays() &&
      JSON.stringify(state.sheetLayout ?? this.sheetLayout()) ===
        JSON.stringify(this.sheetLayout());
    if (nextUnchanged) return;
    this.organizationId.set(nextOrganization);
    this.counterpartyId.set(nextCounterparty);
    this.orgMarkupPercent.set(nextMarkup);
    this.dealVatPercent.set(nextVat);
    this.discountType.set(nextDiscountType);
    this.discountPercent.set(nextDiscountPercent);
    this.discountAmount.set(nextDiscountAmount);
    this.proposalNumber.set(state.number ?? this.proposalNumber());
    this.proposalTitle.set(state.title ?? this.proposalTitle());
    this.proposalDate.set(state.date ?? this.proposalDate());
    this.proposalValidUntil.set(state.validUntil ?? this.proposalValidUntil());
    this.prepaymentPercent.set(
      Math.min(100, Math.max(0, state.prepaymentPercent ?? this.prepaymentPercent())),
    );
    this.productionDays.set(Math.max(0, state.productionDays ?? this.productionDays()));
    this.deliveryDays.set(Math.max(0, state.deliveryDays ?? this.deliveryDays()));
    if (state.sheetLayout) this.sheetLayout.set({ ...this.sheetLayout(), ...state.sheetLayout });
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected toggleLeftTool(tool: Exclude<LeftTool, null>): void {
    if (this.isReadOnly()) return;
    const next = this.leftTool() === tool ? null : tool;
    this.leftTool.set(next);
    if (next === 'products' || next === 'recipient') this.rightOpen.set(false);
    if (next && !this.isWide()) this.rightOpen.set(false);
  }

  protected toggleRightPane(pane: RightPane): void {
    const isSamePane = this.rightOpen() && this.rightPane() === pane;
    this.rightPane.set(pane);
    this.rightOpen.set(!isSamePane);
    if (
      !isSamePane &&
      (pane === 'table' || pane === 'composition' || pane === 'terms') &&
      (this.leftTool() === 'products' || this.leftTool() === 'recipient')
    ) {
      this.leftTool.set(null);
    }
    if (!isSamePane && !this.isWide()) this.leftTool.set(null);
  }

  protected toggleRight(): void {
    this.toggleRightPane('params');
  }

  protected onProductAdd(line: ProposalDraftLine): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const lineKind = line.lineKind ?? 'catalog';
      const qty = Math.max(0.001, line.quantity);
      if (lineKind === 'custom') {
        return [...rows, { ...line, lineKind, quantity: qty }];
      }
      const matchId =
        lineKind === 'module' || lineKind === 'material'
          ? (line.refId ?? line.productId)
          : line.productId;
      const existing = rows.findIndex((row) => {
        const rowKind = row.lineKind ?? 'catalog';
        if (rowKind !== lineKind) return false;
        if (lineKind === 'catalog') return row.productId === matchId;
        return (row.refId ?? row.productId) === matchId;
      });
      const nextLine: ProposalDraftLine = {
        ...line,
        lineKind,
        ...(lineKind === 'module' || lineKind === 'material'
          ? { refId: matchId, productId: matchId }
          : {}),
        quantity: qty,
      };
      if (existing < 0) return [...rows, nextLine];
      return rows.map((row, index) =>
        index === existing ? { ...row, quantity: row.quantity + qty } : row,
      );
    });
    if (this.tableTemplateId()) this.addCommercialColumns();
    this.refreshComposition();
  }

  protected addCustomLine(): void {
    if (this.isReadOnly()) return;
    const id = `custom-${Date.now()}-${this.draftLines().length}`;
    this.draftLines.update((rows) => [
      ...rows,
      {
        lineKind: 'custom',
        productId: id,
        productName: '',
        quantity: 1,
        unit: 'шт',
        unitPrice: 0,
        discountPercent: 0,
        isOptional: false,
      },
    ]);
    this.refreshComposition();
  }

  protected onQuantityChange(change: { index: number; quantity: number }): void {
    if (this.isReadOnly()) return;
    const quantity = Number.isFinite(change.quantity) && change.quantity >= 1 ? change.quantity : 1;
    this.draftLines.update((rows) =>
      rows.map((line, index) => (index === change.index ? { ...line, quantity } : line)),
    );
    this.refreshComposition();
  }

  protected onCompositionLineChange(change: ProposalCompositionLineChange): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) =>
      rows.map((line, index) => {
        if (index !== change.index) return line;
        const patch =
          line.lineKind === 'custom' && change.patch.productName !== undefined
            ? { ...change.patch, productName: change.patch.productName.trim() || 'Своя строка' }
            : change.patch;
        return { ...line, ...patch };
      }),
    );
    this.refreshComposition();
  }

  protected removeCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
    this.refreshComposition();
  }

  protected duplicateCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const line = rows[index];
      if (!line) return rows;
      const copy = { ...line, quantity: line.quantity };
      return [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)];
    });
    this.refreshComposition();
  }

  protected moveCompositionLine(change: { index: number; direction: -1 | 1 }): void {
    if (this.isReadOnly()) return;
    this.draftLines.update((rows) => {
      const nextIndex = change.index + change.direction;
      if (change.index < 0 || nextIndex < 0 || nextIndex >= rows.length) return rows;
      const next = [...rows];
      [next[change.index], next[nextIndex]] = [next[nextIndex], next[change.index]];
      return next;
    });
    this.refreshComposition();
  }

  /** TZ-SALES-355: FullEditor from composition without leaving studio. */
  protected editCompositionLine(index: number): void {
    if (this.isReadOnly()) return;
    const line = this.draftLines()[index];
    if (!line) return;
    const kind = line.lineKind ?? 'catalog';
    if (kind === 'custom') {
      this.toast.warning('Свою строку правьте прямо в составе');
      return;
    }
    const id = kind === 'catalog' ? line.productId : (line.refId ?? line.productId);
    if (!id) {
      this.toast.error('Не удалось открыть карточку: нет id позиции');
      return;
    }
    if (kind === 'catalog') {
      this.productsSvc
        .findById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            return;
          }
          const ref = this.dialog.open(ProductFormDialogComponent, {
            data: res.data,
            width: 'lg',
          });
          onDialogCloseOnce(ref, this.injector, () => {
            this.productsSvc
              .findById(id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((fresh) => {
                if (!fresh.ok) return;
                const product = fresh.data;
                this.applyCatalogEditToLine(index, {
                  productName: product.name ?? line.productName,
                  productSku: product.sku,
                  unit: product.unit ?? line.unit,
                  unitPrice:
                    typeof product.listPrice === 'number' ? product.listPrice : line.unitPrice,
                  photoUrl: this.mainPhotoUrlFromProduct(product) ?? line.photoUrl,
                });
              });
          });
        });
      return;
    }
    if (kind === 'module') {
      this.modulesSvc
        .findById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (!res.ok) {
            this.toast.error(extractErrorMessage(res.error));
            return;
          }
          const ref = this.dialog.open(ModuleFormDialogComponent, {
            data: res.data,
            width: 'lg',
          });
          onDialogCloseOnce(ref, this.injector, (closed) => {
            const mod = closed as ProductModule | null | undefined;
            if (!mod?._id) return;
            this.applyCatalogEditToLine(index, {
              productName: mod.name ?? line.productName,
              productSku: mod.article ?? line.productSku,
            });
          });
        });
      return;
    }
    this.materialsSvc
      .findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          return;
        }
        const ref = this.dialog.open(MaterialFormDialogComponent, {
          data: res.data,
          width: 'lg',
        });
        onDialogCloseOnce(ref, this.injector, (closed) => {
          const material = closed as Material | null | undefined;
          if (!material?._id) return;
          this.applyCatalogEditToLine(index, {
            productName: material.name ?? line.productName,
            productSku: material.article ?? material.sku ?? line.productSku,
            unit: material.unit ?? line.unit,
            unitPrice:
              typeof material.pricePerUnit === 'number' ? material.pricePerUnit : line.unitPrice,
          });
        });
      });
  }

  private applyCatalogEditToLine(index: number, patch: Partial<ProposalDraftLine>): void {
    this.draftLines.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
    this.refreshComposition();
  }

  private firstPhotoUrl(photoIds?: Array<string | Photo> | null): string | undefined {
    const photos = (photoIds ?? []).filter(
      (p): p is Photo => typeof p !== 'string' && !!p?.storageUrl,
    );
    if (!photos.length) return undefined;
    return photoListUrl(photos[0], photos) || undefined;
  }

  private mainPhotoUrlFromProduct(product: Product): string | undefined {
    for (const photo of product.photoIds ?? []) {
      if (typeof photo !== 'string' && photo?.storageUrl) {
        const all = (product.photoIds ?? []).filter(
          (p): p is Photo => typeof p !== 'string' && !!p?.storageUrl,
        );
        return photoListUrl(photo, all) || undefined;
      }
    }
    return undefined;
  }

  private refreshComposition(): void {
    if (this.selectedTemplate()?._id) this.rebuildPreview$.next();
    this.scheduleAutosave();
  }

  protected addCommercialColumns(): void {
    if (this.isReadOnly()) return;
    const canonical = [
      { key: 'index', label: '№', aliases: ['index', 'number', '№', 'номер'] },
      {
        key: 'productName',
        label: 'Наименование',
        aliases: ['productname', 'name', 'title', 'product', 'наименование'],
      },
      {
        key: 'quantity',
        label: 'Кол-во',
        aliases: ['quantity', 'qty', 'count', 'кол-во', 'количество'],
      },
      { key: 'unit', label: 'Ед.', aliases: ['unit', 'ед', 'ед.изм'] },
      { key: 'unitPrice', label: 'Цена', aliases: ['unitprice', 'price', 'unit_price', 'цена'] },
      { key: 'sum', label: 'Сумма', aliases: ['sum', 'total', 'amount', 'сумма'] },
    ];
    const existing = new Set(this.kpTableLayout().map((column) => column.key.trim().toLowerCase()));
    const next = [
      ...this.kpTableLayout(),
      ...canonical
        .filter((column) => !column.aliases.some((alias) => existing.has(alias)))
        .map(({ key, label }) => ({ key, label, visible: true })),
    ];
    if (next.length !== this.kpTableLayout().length) this.onTableLayoutChange(next);
  }

  protected onStatusRequest(status: ProposalCreateStatus): void {
    if (this.isVersionView()) return;
    const current = this.proposalStatus();
    const allowed: Record<ProposalCreateStatus, ProposalCreateStatus[]> = {
      draft: ['sent'],
      sent: ['accepted', 'rejected'],
      accepted: ['draft'],
      rejected: ['sent'],
      converted: [],
      cancelled: [],
    };
    if (!allowed[current].includes(status)) return;
    const draftId = this.readStorage('kp.create.lastDraftId');
    if (!draftId) {
      this.toast.error('Сначала дождитесь статуса «Сохранено».');
      return;
    }
    this.cancelAutosave();
    this.proposalsSvc.update(draftId, { status }).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(res.error.message || 'Не удалось изменить статус КП.');
        return;
      }
      this.proposalStatus.set(res.data.status ?? status);
      this.autosaveLabel.set('Сохранено');
      this.toast.success(`Статус КП: ${this.statusLabel(res.data.status ?? status)}`);
    });
  }

  protected closeFlyouts(): void {
    this.leftTool.set(null);
    this.rightOpen.set(false);
  }

  private calculateDealTotal(): number {
    const base = this.draftLines().reduce((sum, line) => {
      if (line.isOptional) return sum;
      const discount = Math.min(100, Math.max(0, line.discountPercent ?? 0));
      return sum + line.quantity * line.unitPrice * (1 - discount / 100);
    }, 0);
    const marked = base * (1 + this.clampMarkup(this.orgMarkupPercent()) / 100);
    if (this.discountType() === 'percent') {
      return this.roundMoney(marked * (1 - Math.min(100, this.discountPercent()) / 100));
    }
    if (this.discountType() === 'amount') {
      return this.roundMoney(Math.max(0, marked - this.discountAmount()));
    }
    return this.roundMoney(marked);
  }

  private clampMarkup(value: number): number {
    return Math.min(1000, Math.max(-100, Number.isFinite(value) ? value : 0));
  }

  private clampVat(value: number): number {
    return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  }

  private roundMoney(value: number): number {
    return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
  }

  /** Ensure relative URLs resolve against the app origin inside the sandboxed srcdoc. */
  private withBaseHref(html: string): string {
    const origin =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
    if (!origin) return html;

    const rewritten = html.replace(/(["'(])\/uploads\//g, `$1${origin}/uploads/`);
    if (/<base\s/i.test(rewritten)) return rewritten;

    const baseTag = `<base href="${origin}/">`;
    if (/<head[^>]*>/i.test(rewritten)) {
      return rewritten.replace(/<head[^>]*>/i, (open) => `${open}${baseTag}`);
    }
    return `<!DOCTYPE html><html><head>${baseTag}</head><body>${rewritten}</body></html>`;
  }
}
