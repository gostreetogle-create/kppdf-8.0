import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  FileText,
  LucideAngularModule,
  Package,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-angular';
import { Subject, catchError, debounceTime, forkJoin, map, of, switchMap, tap } from 'rxjs';
import type { SilentResult } from '../../../core/silent-http';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import {
  DocumentTemplatesService,
  type BuildPreviewLine,
  type BuildTableLayoutColumn,
  type DocumentTemplate,
} from '../../../shared/services/pi-document-templates.service';
import {
  TableTemplatesService,
  type TableTemplate,
} from '../../../shared/services/pi-table-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { ProposalsService, type Proposal } from '../../../shared/services/pi-proposals.service';
import { PiToastService } from '../../../shared/ui/toast';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';
import { ProposalDraftLine, ProposalProductRailComponent } from './proposal-product-rail.component';
import {
  ProposalCreateInspectorComponent,
  type ProposalCreateInspectorState,
  type ProposalTableLayoutColumn,
  type ProposalTableTarget,
} from './proposal-create-inspector.component';
import {
  ProposalCreateTemplateCenterComponent,
  type KpTemplatePreviewStatus,
} from './proposal-create-template-center.component';
import { ProposalCreateTemplatePickerComponent } from './proposal-create-template-picker.component';

/** Which left tool flyout is open (mutually exclusive). */
type LeftTool = 'template' | 'products' | null;

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
    ProposalCreateInspectorComponent,
    ProposalCreateTemplateCenterComponent,
    ProposalCreateTemplatePickerComponent,
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
          </nav>

          <section
            class="kp-create-studio__center"
            data-test="kp-create-center"
            aria-label="Превью КП"
          >
            @if (selectedTemplate() && autosaveLabel()) {
              <div class="kp-create-studio__savebar" data-test="kp-save-bar">
                <span class="text-[11px] text-muted-foreground" data-test="kp-autosave-status">
                  {{ autosaveLabel() }}
                </span>
              </div>
            }
            <app-proposal-create-template-center
              [selected]="selectedTemplate()"
              [previewHtml]="previewHtml()"
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
              <app-proposal-product-rail (productAdd)="onProductAdd($event)" />
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
              id="kp-flyout-params"
              class="kp-create-studio__flyout kp-create-studio__flyout--right"
              [attr.id]="rightPane() === 'table' ? 'kp-flyout-table' : 'kp-flyout-params'"
              data-test="kp-create-right"
              [attr.aria-label]="rightPane() === 'table' ? 'Таблица' : 'Параметры'"
              #rightFlyout
            >
              <app-proposal-create-inspector
                [draftLines]="draftLines()"
                [tableLayout]="kpTableLayout()"
                [tableOnly]="rightPane() === 'table'"
                [tableTemplateId]="tableTemplateId()"
                [tableTargets]="tableTargets()"
                [selectedTableTargetId]="selectedTableTargetId()"
                [selectedCounterpartyId]="counterpartyId()"
                (stateChange)="onInspectorState($event)"
                (tableLayoutChange)="onTableLayoutChange($event)"
                (tableTargetChange)="onTableTargetChange($event)"
              />
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
  private readonly proposalsSvc = inject(ProposalsService);
  private readonly toast = inject(PiToastService);
  private readonly tableTemplatesSvc = inject(TableTemplatesService);
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('leftRail') private leftRail?: ElementRef<HTMLElement>;
  @ViewChild('rightRail') private rightRail?: ElementRef<HTMLElement>;
  @ViewChild('leftFlyout') private leftFlyout?: ElementRef<HTMLElement>;
  @ViewChild('productsFlyout') private productsFlyout?: ElementRef<HTMLElement>;
  @ViewChild('rightFlyout') private rightFlyout?: ElementRef<HTMLElement>;

  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly kpSectionChips = KP_SECTION_CHIPS;
  protected readonly fileIcon = FileText;
  protected readonly packageIcon = Package;
  protected readonly slidersIcon = SlidersHorizontal;
  protected readonly tableIcon = TableProperties;

  protected readonly isWide = signal(true);
  protected readonly leftTool = signal<LeftTool>(null);
  protected readonly rightOpen = signal(false);
  protected readonly rightPane = signal<'params' | 'table'>('params');
  protected readonly selectedTemplate = signal<DocumentTemplate | null>(null);
  /** In-memory draft positions (SALES-314). Not persisted; not painted on the sheet (319). */
  protected readonly draftLines = signal<ProposalDraftLine[]>([]);
  protected readonly previewHtml = signal<SafeHtml | null>(null);
  private readonly previewHtmlSource = signal<string | null>(null);
  protected readonly previewStatus = signal<KpTemplatePreviewStatus>('idle');
  protected readonly organizationId = signal('');
  protected readonly counterpartyId = signal('');
  protected readonly orgMarkupPercent = signal(0);
  protected readonly dealVatPercent = signal(20);
  protected readonly kpTableLayout = signal<ProposalTableLayoutColumn[]>(
    DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })),
  );
  protected readonly tableTemplateId = signal<string | null>(null);
  protected readonly tableTargets = signal<ProposalTableTarget[]>([]);
  protected readonly selectedTableTargetId = signal<string | null>(null);
  private readonly tableTargetLayouts = signal<Record<string, ProposalTableLayoutColumn[]>>({});
  protected readonly autosaveLabel = signal('');
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private autosaveToastShown = false;

  private readonly rebuildPreview$ = new Subject<void>();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.rebuildPreview$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          const tpl = this.selectedTemplate();
          if (!tpl?._id) {
            this.previewHtml.set(null);
            this.previewStatus.set('idle');
            return of(null);
          }
          this.previewStatus.set('loading');
          const org = this.organizationId().trim();
          const markup = this.clampMarkup(this.orgMarkupPercent());
          const previewLines: BuildPreviewLine[] = this.draftLines().map((line) => ({
            productName: line.productName,
            quantity: line.quantity,
            unitPrice: this.roundMoney(line.unitPrice * (1 + markup / 100)),
            ...(line.productSku ? { productSku: line.productSku } : {}),
            ...(line.unit ? { unit: line.unit } : {}),
          }));
          const tableLayout: BuildTableLayoutColumn[] = this.kpTableLayout().map(
            ({ key, visible }) => ({ key, visible }),
          );
          const payload = {
            previewLines,
            tableLayout,
            tableTargetId: this.tableTemplateId() ?? undefined,
            dealTotals: { vatPercent: this.clampVat(this.dealVatPercent()) },
            ...(org ? { organizationId: org } : {}),
          };
          return this.templatesSvc.build(tpl._id, payload).pipe(
            tap((res) => {
              if (res.ok && typeof res.data === 'string') {
                this.previewHtmlSource.set(res.data);
                this.previewHtml.set(
                  this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(res.data)),
                );
                this.previewStatus.set('ready');
                this.scheduleAutosave();
              } else {
                this.previewHtmlSource.set(null);
                this.previewHtml.set(null);
                this.previewStatus.set('error');
              }
            }),
            catchError(() => {
              this.previewHtmlSource.set(null);
              this.previewHtml.set(null);
              this.previewStatus.set('error');
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
      this.rightFlyout?.nativeElement,
    ].some((el) => !!el && el.contains(target));

    if (!inside) {
      this.closeFlyouts();
    }
  }

  protected openTemplateTool(): void {
    this.leftTool.set('template');
    if (!this.isWide()) this.rightOpen.set(false);
  }

  protected onTemplateChange(tpl: DocumentTemplate | null): void {
    this.selectedTemplate.set(tpl);
    this.previewHtmlSource.set(null);
    this.previewHtml.set(null);
    if (tpl) this.writeStorage('kp.create.lastTemplateId', tpl._id);
    this.tableTemplateId.set(null);
    this.tableTargets.set([]);
    this.selectedTableTargetId.set(null);
    this.tableTargetLayouts.set({});
    this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));
    if (tpl) {
      this.previewStatus.set('loading');
      this.leftTool.set(null);
      this.syncTableTargets(tpl._id);
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    } else {
      this.previewHtmlSource.set(null);
      this.previewHtml.set(null);
      this.previewStatus.set('idle');
    }
  }

  protected canSaveDraft(): boolean {
    return Boolean(
      this.selectedTemplate()?._id &&
      this.organizationId().trim() &&
      this.previewStatus() === 'ready',
    );
  }

  protected saveDraft(manual = true): void {
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
      organizationId,
      ...(this.counterpartyId().trim() ? { counterpartyId: this.counterpartyId().trim() } : {}),
      status: 'draft',
      orgMarkupPercent: this.clampMarkup(this.orgMarkupPercent()),
      items: this.draftLines().map((line, index) => ({
        productId: line.productId,
        productName: line.productName,
        productSku: line.productSku,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        markupPercent: this.clampMarkup(this.orgMarkupPercent()),
        sortOrder: index,
      })),
      templateId: template._id,
      templateSnapshot: {
        templateId: template._id,
        html,
        tableLayout: this.kpTableLayout().map(({ key, visible }) => ({ key, visible })),
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
      this.autosaveLabel.set('Ошибка автосохранения');
      if (!autosave || !this.autosaveToastShown) {
        this.toast.error('Не удалось сохранить черновик КП.');
        this.autosaveToastShown = true;
      }
      return;
    }
    this.writeStorage('kp.create.lastDraftId', res.data._id);
    this.writeStorage('kp.create.lastTemplateId', templateId);
    this.autosaveLabel.set('Сохранено');
    if (!autosave || !this.autosaveToastShown) {
      this.toast.success('Черновик сохранён');
      this.autosaveToastShown = true;
    }
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
      if (res.ok && res.data.status === 'draft') {
        this.writeStorage('kp.create.lastDraftId', id);
        this.hydrateDraft(res.data);
        return;
      }
      this.clearLocalDraftPointers();
      this.draftLines.set([]);
      this.selectedTemplate.set(null);
      this.previewHtmlSource.set(null);
      this.previewHtml.set(null);
      this.previewStatus.set('idle');
      this.toast.error('КП нельзя открыть для редактирования. Открыт новый лист.');
    });
  }

  private resumeLastDraft(): void {
    const draftId = this.readStorage('kp.create.lastDraftId');
    if (draftId) {
      this.proposalsSvc.findById(draftId).subscribe((res) => {
        if (res.ok && res.data.status === 'draft') {
          this.hydrateDraft(res.data);
          return;
        }
        // Deleted / missing КП — empty studio (do not resurrect last template alone).
        this.clearLocalDraftPointers();
      });
      return;
    }
    // No draft pointer: empty studio (do not auto-pick a lonely template).
    this.removeStorage('kp.create.lastTemplateId');
  }

  private clearLocalDraftPointers(): void {
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
    const templateId = this.refId(draft.templateId);
    this.organizationId.set(this.refId(draft.organizationId) ?? '');
    this.counterpartyId.set(this.refId(draft.counterpartyId) ?? '');
    this.orgMarkupPercent.set(this.clampMarkup(draft.orgMarkupPercent ?? 0));
    this.draftLines.set(
      (draft.items ?? []).map((item) => ({
        productId: this.refId(item.productId) ?? '',
        productName: item.productName ?? 'Изделие',
        productSku: item.productSku,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })),
    );
    if (templateId) {
      this.templatesSvc.findById(templateId).subscribe((res) => {
        if (res.ok) this.onTemplateChange(res.data);
      });
    } else {
      this.resumeLastTemplate();
    }
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
    if (!this.tableTargets().some((target) => target.id === targetId)) return;
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
    this.kpTableLayout.set(layout.map((column) => ({ ...column })));
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected onInspectorState(state: ProposalCreateInspectorState): void {
    const nextOrganization = (state.organizationId ?? '').trim();
    const nextCounterparty = (state.counterpartyId ?? '').trim();
    const nextMarkup = this.clampMarkup(state.orgMarkupPercent);
    const nextVat = this.clampVat(state.dealVatPercent ?? this.dealVatPercent());
    const unchanged =
      nextOrganization === this.organizationId() &&
      nextCounterparty === this.counterpartyId() &&
      nextMarkup === this.orgMarkupPercent() &&
      nextVat === this.dealVatPercent();
    if (unchanged) return;
    this.organizationId.set(nextOrganization);
    this.counterpartyId.set(nextCounterparty);
    this.orgMarkupPercent.set(nextMarkup);
    this.dealVatPercent.set(nextVat);
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected toggleLeftTool(tool: Exclude<LeftTool, null>): void {
    const next = this.leftTool() === tool ? null : tool;
    this.leftTool.set(next);
    if (next === 'products') this.rightOpen.set(false);
    if (next && !this.isWide()) this.rightOpen.set(false);
  }

  protected toggleRightPane(pane: 'params' | 'table'): void {
    const isSamePane = this.rightOpen() && this.rightPane() === pane;
    this.rightPane.set(pane);
    this.rightOpen.set(!isSamePane);
    if (!isSamePane && pane === 'table' && this.leftTool() === 'products') {
      this.leftTool.set(null);
    }
    if (!isSamePane && !this.isWide()) this.leftTool.set(null);
  }

  protected toggleRight(): void {
    this.toggleRightPane('params');
  }

  protected onProductAdd(line: ProposalDraftLine): void {
    this.draftLines.update((rows) => [...rows, line]);
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
      this.scheduleAutosave();
    }
  }

  protected closeFlyouts(): void {
    this.leftTool.set(null);
    this.rightOpen.set(false);
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
