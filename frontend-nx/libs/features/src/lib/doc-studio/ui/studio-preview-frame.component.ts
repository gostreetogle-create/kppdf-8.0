import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';

/**
 * TZ-NX-STUDIO-EDITOR-PAGE-THIN — extracted from `StudioEditorPage`'s canvas
 * host (`viewMode() === 'preview'` branch): loading/error states + the
 * zoom-scaled A4 preview iframe. Pure presentational, no facade coupling.
 */
@Component({
  selector: 'pi-studio-preview-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <p class="preview-state" data-test="studio-preview-loading">Формирование просмотра…</p>
    } @else if (error(); as err) {
      <p class="preview-state preview-state--error" data-test="studio-preview-error">{{ err }}</p>
    } @else if (html(); as safeHtml) {
      <iframe
        class="studio-preview-frame"
        data-test="studio-preview-frame"
        sandbox="allow-same-origin"
        [srcdoc]="safeHtml"
        [style.width.px]="width()"
        [style.height.px]="height()"
        [style.transform]="'scale(' + scale() + ')'"
      ></iframe>
    }
  `,
  styles: [`
    .preview-state {
      margin: 0; padding: 24px; font-size: 13px; color: var(--color-muted-foreground);
    }
    .preview-state--error { color: var(--color-destructive); }
    .studio-preview-frame {
      /* TZ-NX-PO-SWEEP-06 — width/height/transform:scale set inline
         ([style.*] bindings) to the real A4 px size + zoomMode-matching
         scale factor; this is layout-only (position/origin). Positions
         against the host page's .studio-canvas-host (position: relative),
         which stays the DOM parent regardless of view encapsulation. */
      display: block; border: none; background: #fff;
      position: absolute; top: 0; left: 0;
      transform-origin: top left;
    }
  `],
})
export class StudioPreviewFrameComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly html = input<SafeHtml | null>(null);
  readonly width = input(0);
  readonly height = input(0);
  readonly scale = input(1);
}
