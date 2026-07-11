import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

/**
 * TZ-86 Phase D.1 — `pi-canvas-page` Paper & Ink primitive.
 *
 * A4-aspect-ratio paper wrapper for the document-constructor builder canvas.
 * 1:√2 ratio = 210×297mm; `aspect-[1/1.414]` enforces the prop on the inner
 * page. Scrollable on Y if content exceeds the page height; horizontal
 * scroll is suppressed (canvas is a fixed column).
 *
 * Visual contract:
 *   - Pure off-white `bg-paper` (warm paper direction, OKLCH ~0.972)
 *   - Single 1px hairline border on all 4 sides
 *   - No drop-shadow (Paper & Ink forbids `box-shadow` / `drop-shadow`)
 *   - 32px inner padding (≈ 7.5mm — close to a Word/Google Docs page)
 *   - Page is centered horizontally in the scrollable parent
 *
 * Selection ring for the currently active block is provided by the parent
 * (BlockRenderer sets a 2px ink outline) — this primitive is structural.
 */
@Component({
  selector: 'pi-canvas-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-canvas-page-host w-full h-full overflow-y-auto overflow-x-hidden">
      <div
        class="pi-canvas-page-paper mx-auto my-8"
        [style.max-width.px]="maxWidthPx()"
        [attr.data-page-size]="pageSize()"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .pi-canvas-page-host {
        background: oklch(var(--color-paper-2) / 0.5);
      }

      .pi-canvas-page-paper {
        background: oklch(var(--color-paper));
        border: 1px solid oklch(var(--color-rule));
        padding: 32px;
        min-height: calc(1.414 * min(100vw - 64px, 720px));
        position: relative;
      }
    `,
  ],
})
export class PiCanvasPageComponent {
  /**
   * Visual max-width of the page in pixels. Default 720 — comfortable reading
   * width on desktop without overwhelming the canvas pane. Builders can
   * override for print-preview-style zoom-out.
   */
  readonly maxWidthPx = input<number>(720);

  /**
   * Page size hint — purely for the `data-page-size` attribute used in
   * browser dev tools / e2e selectors; the actual visual size is governed
   * by the parent's flex layout. Default 'A4'.
   */
  readonly pageSize = input<'A4' | 'A5' | 'Letter' | 'Legal'>('A4');
}
