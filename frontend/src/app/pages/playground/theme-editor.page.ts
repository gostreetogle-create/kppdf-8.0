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
        Кнопка «Reset to defaults» восстанавливает base OKLCH values
        (paper 0.972/0.008/85, ink 0.145/0/0, rule 0.85/0.006/80).
        Non-destructive: source-of-truth в @theme inline не меняется,
        overrides применяются через <code class="mono text-[11px]">var(--color-X-override, oklch(...))</code>
        fallback syntax.
      </p>
    </app-pi-section>
  `,
})
export class ThemeEditorPage {}
