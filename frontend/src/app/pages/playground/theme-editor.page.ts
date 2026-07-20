import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiThemeEditorComponent } from '../../shared/theme';

/**
 * Theme Editor page (/playground/theme) — TZ-77.
 *
 * Full-bleed playground route с live OKLCH sliders для ink/paper/rule.
 * Persists overrides в localStorage; reset возвращает defaults.
 */
@Component({
  selector: 'app-theme-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, PiSectionComponent, PiThemeEditorComponent],
  template: `
    <app-pi-page-header
      eyebrow="Theme Editor"
      title="OKLCH · Live"
      subtitle="Sliders re-tint paper/ink/rule в real-time. Persists в localStorage."
      hint="0.1s · live"
    />

    <app-pi-section title="Sliders" hint="Lightness · Chroma · Hue" eyebrow="I">
      <app-pi-theme-editor />
    </app-pi-section>

    <app-pi-section title="Reset" hint="восстановить defaults" eyebrow="II">
      <p class="text-sm text-muted-foreground max-w-prose">
        Кнопка «Reset to defaults» восстанавливает base OKLCH values (paper 0.972/0.008/85, ink
        0.145/0/0, rule 0.85/0.006/80). Non-destructive: source-of-truth в @theme inline не
        меняется, overrides применяются через
        <code class="font-mono text-[11px]">var(--color-X-override, oklch(...))</code>
        fallback syntax.
      </p>
    </app-pi-section>

    <app-pi-section title="Architectural Utilities" hint="TZ-93 · 2 utilities" eyebrow="III">
      <p class="text-sm text-muted-foreground max-w-prose mb-stack-md">
        Brutalist architectural elements adopted from
        <code class="font-mono text-[11px]">stitch_professional_desktop_crm_refinement</code> —
        selectively, not wholesale. <code class="font-mono text-[11px]">.pi-corner-marks</code>
        was rolled back in TZ-93.1 (1990s-terminal risk). See
        <code class="font-mono text-[11px]">tasks/_archive/2026-07/TZ-93.md.done</code> for the full
        adoption matrix.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <!-- .pi-dashed-panel demo -->
        <div class="pi-dashed-panel p-stack-lg">
          <h3 class="font-title-sm text-ink mb-stack-sm">Dashed Panel</h3>
          <p class="text-sm text-muted-foreground">
            2px dashed border for empty states and draft-style surfaces. Lower perceptual contrast —
            apply only on near-empty surfaces.
          </p>
        </div>

        <!-- .pi-tech-label demo -->
        <div class="hairline bg-paper p-stack-lg relative">
          <span class="pi-tech-label absolute top-2 right-2">REF: TZ-93.2</span>
          <h3 class="font-title-sm text-ink mb-stack-sm">Tech Label</h3>
          <p class="text-sm text-muted-foreground">
            10px monospace metadata label with AAA contrast via
            <code class="font-mono text-[11px]">--color-muted-foreground-strong</code>. Use for REF
            numbers, IDs, timestamps in corners of structural panels.
          </p>
        </div>

        <!-- TZ-95: Table context demo -->
        <div class="hairline bg-paper p-stack-lg relative col-span-full">
          <span class="pi-tech-label absolute top-2 right-2">REF: TBL.04</span>
          <h3 class="font-title-sm text-ink mb-stack-sm">Table Context</h3>
          <table class="w-full text-sm">
            <thead class="hairline-b">
              <tr>
                <th class="eyebrow text-left py-2 px-3">ID</th>
                <th class="eyebrow text-left py-2 px-3">NAME</th>
                <th class="eyebrow text-right py-2 px-3">QTY</th>
                <th class="eyebrow text-right py-2 px-3">PRICE</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hairline-b">
                <td class="py-2 px-3 font-mono text-[11px] tabular-nums">TX-001</td>
                <td class="py-2 px-3">Material Alpha</td>
                <td class="py-2 px-3 text-right tabular-nums">42</td>
                <td class="py-2 px-3 text-right tabular-nums">1,250.00</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-mono text-[11px] tabular-nums">TX-002</td>
                <td class="py-2 px-3">Component Beta</td>
                <td class="py-2 px-3 text-right tabular-nums">8</td>
                <td class="py-2 px-3 text-right tabular-nums">3,400.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </app-pi-section>
  `,
})
export class ThemeEditorPage {}
