import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

export type KpTemplatePreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

const KP_A4_WIDTH_PX = 794;
const KP_A4_HEIGHT_PX = 1123;
const KP_SCALE_SAFETY_INSET_PX = 2;
/** Как долго держать временный кадр печати, если диалог не прислал afterprint. */
const KP_PRINT_FRAME_KEEP_MS = 60_000;

export function calculateKpPreviewScale(sheetWidth: number, sheetHeight: number): number {
  if (sheetWidth <= 0 || sheetHeight <= 0) return 0;
  return Math.min(
    Math.max(0, sheetWidth - KP_SCALE_SAFETY_INSET_PX) / KP_A4_WIDTH_PX,
    Math.max(0, sheetHeight - KP_SCALE_SAFETY_INSET_PX) / KP_A4_HEIGHT_PX,
    1,
  );
}

/**
 * Center A4 sheet (TZ-SALES-317 shell + TZ-SALES-319 build HTML preview).
 * No template-name chrome / draftLines on the sheet — only sandboxed build HTML.
 */
@Component({
  selector: 'app-proposal-create-template-center',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="center" data-test="kp-create-template-center">
      <div class="center__stage">
        <div #sheet class="center__sheet" data-test="kp-tpl-preview">
          @if (!selected()) {
            <div class="center__empty" data-test="kp-tpl-empty">
              <app-pi-button
                type="button"
                variant="default"
                size="sm"
                data-test="kp-tpl-add"
                (click)="requestPick.emit()"
              >
                Добавить шаблон
              </app-pi-button>
            </div>
          } @else if (previewStatus() === 'loading') {
            <div class="center__status" data-test="kp-tpl-loading" role="status">
              Загрузка превью…
            </div>
          } @else if (previewStatus() === 'error') {
            <div class="center__status center__status--error" data-test="kp-tpl-error" role="alert">
              Не удалось построить превью
            </div>
          } @else if (previewStatus() === 'ready' && previewHtml()) {
            @for (page of previewPages().length ? previewPages() : [previewHtml()!]; track $index) {
              <div class="center__page" [attr.data-test]="'kp-tpl-page-' + ($index + 1)">
                <div class="center__page-label">Страница {{ $index + 1 }}</div>
                <iframe
                  class="center__frame"
                  data-test="kp-tpl-html-preview"
                  title="Превью листа КП"
                  sandbox="allow-same-origin"
                  [srcdoc]="page"
                  [style.pointer-events]="'none'"
                  [style.transform]="'translateX(-50%) scale(' + previewScale() + ')'"
                ></iframe>
              </div>
            }
          } @else {
            <div class="center__status" data-test="kp-tpl-loading" role="status">
              Загрузка превью…
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    .center {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
    .center__stage {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      overflow: auto;
      padding: 0.75rem 0.25rem 1rem;
      container-type: inline-size;
    }
    .center__sheet {
      width: 100%;
      min-height: 0;
      box-sizing: border-box;
    }
    .center__page {
      position: relative;
      width: min(100%, 794px);
      max-width: 100%;
      aspect-ratio: 210 / 297;
      margin: 0 auto;
      border: 1px solid var(--color-rule);
      background: var(--color-paper);
      overflow: hidden;
      box-sizing: border-box;
    }
    .center__page-label {
      position: absolute;
      top: -1.1rem;
      left: 0;
      color: var(--color-muted);
      font-size: 0.6875rem;
    }
    .center__empty,
    .center__status {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      text-align: center;
      font-size: 0.8125rem;
      color: var(--color-muted);
      box-sizing: border-box;
    }
    .center__status--error {
      color: var(--color-danger, var(--color-ink));
    }
    .center__frame {
      display: block;
      position: absolute;
      top: 0;
      left: 50%;
      width: 794px;
      height: 1123px;
      border: 0;
      background: var(--color-paper);
      overflow: hidden;
      pointer-events: none;
      transform-origin: top center;
    }
  `,
})
export class ProposalCreateTemplateCenterComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');

  readonly selected = input<DocumentTemplate | null>(null);
  readonly previewHtml = input<SafeHtml | null>(null);
  readonly previewPages = input<SafeHtml[]>([]);
  readonly previewStatus = input<KpTemplatePreviewStatus>('idle');
  readonly requestPick = output<void>();
  protected readonly previewScale = signal(1);

  /**
   * Печать КП (TZ-SALES-366): системный диалог вызывается НЕ из sandbox-превью
   * (там Chrome игнорирует print() без allow-modals), а во временном
   * родительском iframe печати, куда кладётся тот же build HTML всех листов.
   * Пустое/loading превью молча выходим — toast уже показан на page.
   */
  printPreview(): void {
    const html = this.collectPrintHtml();
    if (!html) return;
    this.openTempPrintFrame(html);
  }

  /** Возвращает полный build HTML (все листы .doc-page) + печатный CSS или null. */
  protected collectPrintHtml(): string | null {
    const safe = this.previewHtml();
    if (!safe) return null;
    const raw = this.sanitizer.sanitize(SecurityContext.HTML, safe);
    if (!raw || !raw.trim()) return null;
    return this.injectPrintCss(raw);
  }

  /**
   * build HTML уже несёт все листы и @page A4 с page-break; добавляем только
   * печать фона «как на экране» (паритет с PDF, где puppeteer printBackground)
   * и явный разрыв между листами на случай, если бланк собран без него.
   */
  private injectPrintCss(html: string): string {
    const printCss =
      '<style>@media print{html,body{background:var(--color-paper);print-color-adjust:exact;-webkit-print-color-adjust:exact}.doc-page{page-break-after:always}.doc-page:last-child{page-break-after:auto}}</style>';
    if (html.includes('</head>')) {
      return html.replace('</head>', `${printCss}</head>`);
    }
    return `<!DOCTYPE html><html><head>${printCss}</head><body>${html}</body></html>`;
  }

  /**
   * Временный невидимый родительский iframe печати (не sandboxed, в отличие от
   * ленты превью) — иначе print() игнорируется. Печатаем после load(srcdoc),
   * убираем кадр после закрытия диалога или по таймауту (Safari).
   */
  protected openTempPrintFrame(html: string): void {
    const frame = document.createElement('iframe');
    frame.setAttribute('data-test', 'kp-temp-print-frame');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.visibility = 'hidden';
    frame.style.pointerEvents = 'none';

    const cleanup = (): void => {
      if (frame.isConnected) frame.remove();
    };

    // srcdoc задаём до вставки, чтобы первым документом кадра был сам бланк,
    // а не about:blank (иначе первый load может прийти пустым и съесть once).
    frame.srcdoc = html;
    frame.addEventListener(
      'load',
      () => {
        if (frame.contentWindow?.location?.href !== 'about:srcdoc') return;
        this.requestPrint(frame, cleanup);
      },
      { once: true },
    );
    document.body.appendChild(frame);
    window.setTimeout(cleanup, KP_PRINT_FRAME_KEEP_MS);
  }

  private requestPrint(frame: HTMLIFrameElement, cleanup: () => void): void {
    const win = frame.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.addEventListener?.('afterprint', cleanup);
    win.focus?.();
    win.print?.();
    // Chrome блокирует до закрытия диалога; Safari возвращается сразу — таймаут-страховка.
    window.setTimeout(cleanup, KP_PRINT_FRAME_KEEP_MS);
  }

  ngAfterViewInit(): void {
    const sheet = this.sheet()?.nativeElement;
    if (!sheet) return;

    const recalculate = (): void => this.recalculateScale();
    if (typeof ResizeObserver === 'undefined') {
      recalculate();
      return;
    }

    const observer = new ResizeObserver(recalculate);
    observer.observe(sheet);
    this.destroyRef.onDestroy(() => observer.disconnect());
    recalculate();
  }

  private recalculateScale(): void {
    const sheet = this.sheet()?.nativeElement;
    if (!sheet || sheet.clientWidth <= 0 || sheet.clientHeight <= 0) return;
    this.previewScale.set(calculateKpPreviewScale(sheet.clientWidth, sheet.clientHeight));
  }
}
