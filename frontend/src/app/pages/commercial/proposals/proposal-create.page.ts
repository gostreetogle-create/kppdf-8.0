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
import { FileText, LucideAngularModule, Package, SlidersHorizontal } from 'lucide-angular';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import {
  DocumentTemplatesService,
  type BuildPreviewLine,
  type BuildTableLayoutColumn,
  type DocumentTemplate,
} from '../../../shared/services/pi-document-templates.service';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';
import { ProposalDraftLine, ProposalProductRailComponent } from './proposal-product-rail.component';
import {
  ProposalCreateInspectorComponent,
  type ProposalCreateInspectorState,
  type ProposalTableLayoutColumn,
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
            aria-label="Параметры КП"
            #rightRail
          >
            <button
              type="button"
              class="kp-create-studio__rail-btn pi-focus-ring"
              [class.kp-create-studio__rail-btn--active]="rightOpen()"
              [attr.aria-expanded]="rightOpen()"
              aria-controls="kp-flyout-params"
              aria-label="Параметры"
              title="Параметры"
              data-test="kp-create-toggle-right"
              (click)="toggleRight()"
            >
              <lucide-angular [img]="slidersIcon" [size]="18" aria-hidden="true" />
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
              data-test="kp-create-right"
              aria-label="Параметры"
              #rightFlyout
            >
              <app-proposal-create-inspector
                [draftLines]="draftLines()"
                [tableLayout]="kpTableLayout()"
                (stateChange)="onInspectorState($event)"
                (tableLayoutChange)="onTableLayoutChange($event)"
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
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      padding: 0.5rem;
    }

    .kp-create-studio__flyout {
      position: absolute;
      top: 0;
      bottom: 0;
      z-index: 20;
      width: var(--kp-flyout-w);
      max-width: calc(100% - (var(--kp-rail) * 2));
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
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
  `,
})
export class ProposalCreatePage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly templatesSvc = inject(DocumentTemplatesService);
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

  protected readonly isWide = signal(true);
  protected readonly leftTool = signal<LeftTool>(null);
  protected readonly rightOpen = signal(false);
  protected readonly selectedTemplate = signal<DocumentTemplate | null>(null);
  /** In-memory draft positions (SALES-314). Not persisted; not painted on the sheet (319). */
  protected readonly draftLines = signal<ProposalDraftLine[]>([]);
  protected readonly previewHtml = signal<SafeHtml | null>(null);
  protected readonly previewStatus = signal<KpTemplatePreviewStatus>('idle');
  protected readonly organizationId = signal('');
  protected readonly kpTableLayout = signal<ProposalTableLayoutColumn[]>(
    DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })),
  );

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
          const previewLines: BuildPreviewLine[] = this.draftLines().map((line) => ({
            productName: line.productName,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            ...(line.productSku ? { productSku: line.productSku } : {}),
            ...(line.unit ? { unit: line.unit } : {}),
          }));
          const tableLayout: BuildTableLayoutColumn[] = this.kpTableLayout().map(
            ({ key, visible }) => ({ key, visible }),
          );
          const payload = {
            previewLines,
            tableLayout,
            ...(org ? { organizationId: org } : {}),
          };
          return this.templatesSvc.build(tpl._id, payload).pipe(
            tap((res) => {
              if (res.ok && typeof res.data === 'string') {
                this.previewHtml.set(
                  this.sanitizer.bypassSecurityTrustHtml(this.withBaseHref(res.data)),
                );
                this.previewStatus.set('ready');
              } else {
                this.previewHtml.set(null);
                this.previewStatus.set('error');
              }
            }),
            catchError(() => {
              this.previewHtml.set(null);
              this.previewStatus.set('error');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngOnInit(): void {
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
    this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map((column) => ({ ...column })));
    if (tpl) {
      this.leftTool.set(null);
      this.rebuildPreview$.next();
    } else {
      this.previewHtml.set(null);
      this.previewStatus.set('idle');
    }
  }

  protected onTableLayoutChange(layout: ProposalTableLayoutColumn[]): void {
    this.kpTableLayout.set(layout.map((column) => ({ ...column })));
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
    }
  }

  protected onInspectorState(state: ProposalCreateInspectorState): void {
    const next = (state.organizationId ?? '').trim();
    if (next === this.organizationId()) return;
    this.organizationId.set(next);
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
    }
  }

  protected toggleLeftTool(tool: Exclude<LeftTool, null>): void {
    const next = this.leftTool() === tool ? null : tool;
    this.leftTool.set(next);
    if (next && !this.isWide()) {
      this.rightOpen.set(false);
    }
  }

  protected toggleRight(): void {
    const next = !this.rightOpen();
    this.rightOpen.set(next);
    if (next && !this.isWide()) {
      this.leftTool.set(null);
    }
  }

  protected onProductAdd(line: ProposalDraftLine): void {
    this.draftLines.update((rows) => [...rows, line]);
    if (this.selectedTemplate()?._id) {
      this.rebuildPreview$.next();
    }
  }

  protected closeFlyouts(): void {
    this.leftTool.set(null);
    this.rightOpen.set(false);
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
