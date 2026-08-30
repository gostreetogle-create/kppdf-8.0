import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * TZ-AUDIT-6 PiEmptyTile — placeholder square for missing thumbnails.
 *
 * Used as a stand-in for `<img>` when a record has no photo / logo
 * yet (Materials page catalog, future Organization logos, etc.).
 * Before this component existed, every page that needed an empty
 * image slot inlined an `8-line` <div> + <span> combo describing
 * exactly the same shape:
 *
 *   <div class="w-12 h-12 hairline rounded-sm
 *               bg-paper-2 flex items-center justify-center">
 *     <span class="text-muted-foreground text-xs">—</span>
 *   </div>
 *
 * Visual contract:
 *  - 1:1 aspect ratio matching the real thumbnail
 *  - Hairline `border-rule` (matches `pi-icon-btn`, `pi-input`)
 *  - `bg-paper-2` fill (subtle vs. `bg-paper` page surface)
 *  - Em-dash placeholder, 0.875em, `text-muted-foreground` (matches `.empty-cell`
 *    typography for visual coherence across the editorial system)
 *  - `aria-hidden="true"` by default — the real image owns the a11y
 *    label; this tile is purely decorative.
 *
 * Inputs:
 *  - `sizePx`: edge length in pixels. Default `48` matches the
 *    catalog table thumbnail column width.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-pi-empty-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pi-empty-tile hairline rounded-sm
             bg-paper-2 flex items-center justify-center"
      [style.width.px]="sizePx()"
      [style.height.px]="sizePx()"
      aria-hidden="true"
    >
      <span class="pi-empty-tile__glyph text-muted-foreground" aria-hidden="true"> — </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .pi-empty-tile {
        user-select: none;
      }
      .pi-empty-tile__glyph {
        font-size: 0.875em;
        opacity: 0.6;
        line-height: 1;
      }
    `,
  ],
})
export class PiEmptyTileComponent {
  /** Edge length in pixels. Defaults to 48px (catalog thumbnail). */
  readonly sizePx = input<number>(48);
}
