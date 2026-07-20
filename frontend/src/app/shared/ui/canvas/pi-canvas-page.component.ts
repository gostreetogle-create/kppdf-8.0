import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
        [class.pi-canvas-page-paper--landscape]="orientation() === 'landscape'"
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
        border: 1.5px solid oklch(var(--color-rule));
        padding: 32px;
        min-height: calc(1.414 * min(100vw - 64px, 720px));
        position: relative;
      }

      .pi-canvas-page-paper--landscape {
        min-height: calc(min(100vw - 64px, 900px) / 1.414);
      }
    `,
  ],
})
export class PiCanvasPageComponent {
  readonly maxWidthPx = input<number>(720);
  readonly pageSize = input<'A4' | 'A5' | 'Letter' | 'Legal'>('A4');
  readonly orientation = input<'portrait' | 'landscape'>('portrait');
}
