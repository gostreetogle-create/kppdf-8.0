import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Paper wrapper for the document-constructor builder canvas.
 * Supports A3/A4/A5 page sizes and portrait/landscape orientations.
 * The paper uses flex column so child content fills the full page height.
 */
@Component({
  selector: 'pi-canvas-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-canvas-page-host">
      <div
        class="pi-canvas-page-paper mx-auto my-4"
        [class.pi-canvas-page-paper--landscape]="orientation() === 'landscape'"
        [class.pi-canvas-page-paper--a3]="pageSize() === 'A3'"
        [class.pi-canvas-page-paper--a5]="pageSize() === 'A5'"
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
        overflow-y: auto;
        overflow-x: hidden;
      }

      .pi-canvas-page-paper {
        background: oklch(var(--color-paper));
        border: 2px solid var(--color-ink);
        padding: 0;
        min-height: calc(1.414 * min(100vw - 64px, 720px));
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .pi-canvas-page-paper--a3 {
        min-height: calc(1.414 * min(100vw - 64px, 900px));
      }

      .pi-canvas-page-paper--a5 {
        min-height: calc(1.414 * min(100vw - 64px, 520px));
      }

      .pi-canvas-page-paper--landscape {
        min-height: calc(min(100vw - 64px, 900px) / 1.414);
      }

      .pi-canvas-page-paper--landscape.pi-canvas-page-paper--a3 {
        min-height: calc(min(100vw - 64px, 1100px) / 1.414);
      }

      .pi-canvas-page-paper--landscape.pi-canvas-page-paper--a5 {
        min-height: calc(min(100vw - 64px, 680px) / 1.414);
      }

      @media print {
        .pi-canvas-page-paper {
          border: none !important;
        }
        .pi-canvas-page-host {
          background: white !important;
        }
      }
    `,
  ],
})
export class PiCanvasPageComponent {
  readonly maxWidthPx = input<number>(720);
  readonly pageSize = input<'A3' | 'A4' | 'A5'>('A4');
  readonly orientation = input<'portrait' | 'landscape'>('portrait');
}
