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
import type { SafeHtml } from '@angular/platform-browser';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

export type KpTemplatePreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

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
              Загрузка шаблона…
            </div>
          } @else if (previewStatus() === 'error') {
            <div class="center__status center__status--error" data-test="kp-tpl-error" role="alert">
              Не удалось загрузить шаблон
            </div>
          } @else if (previewStatus() === 'ready' && previewHtml()) {
            <iframe
              class="center__frame"
              data-test="kp-tpl-html-preview"
              title="Превью шаблона КП"
              sandbox="allow-same-origin"
              [srcdoc]="previewHtml()!"
              [style.transform]="'translateX(-50%) scale(' + previewScale() + ')'"
            ></iframe>
          } @else {
            <div class="center__status" data-test="kp-tpl-loading" role="status">
              Загрузка шаблона…
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
      justify-content: center;
      align-items: flex-start;
      overflow: hidden;
      container-type: size;
    }
    .center__sheet {
      position: relative;
      width: min(100cqw, calc(100cqh * 210 / 297));
      height: min(100cqh, calc(100cqw * 297 / 210));
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 210 / 297;
      padding: 0;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, #fff);
      overflow: hidden;
      box-sizing: border-box;
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
      position: absolute;
      top: 0;
      left: 50%;
      width: 794px;
      height: 1123px;
      border: 0;
      background: #fff;
      transform-origin: top center;
    }
  `,
})
export class ProposalCreateTemplateCenterComponent implements AfterViewInit {
  private static readonly A4_WIDTH_PX = 794;
  private static readonly A4_HEIGHT_PX = 1123;

  private readonly destroyRef = inject(DestroyRef);
  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');

  readonly selected = input<DocumentTemplate | null>(null);
  readonly previewHtml = input<SafeHtml | null>(null);
  readonly previewStatus = input<KpTemplatePreviewStatus>('idle');
  readonly requestPick = output<void>();
  protected readonly previewScale = signal(1);

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
    const scale = Math.min(
      sheet.clientWidth / ProposalCreateTemplateCenterComponent.A4_WIDTH_PX,
      sheet.clientHeight / ProposalCreateTemplateCenterComponent.A4_HEIGHT_PX,
      1,
    );
    this.previewScale.set(Math.max(0.1, scale));
  }
}
