import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiDemoComponent } from '../../shared/page/pi-demo.component';
import { CardComponent } from '../../shared/ui/card/card.component';

/**
 * Foundations page (/foundations) — TZ-70.
 *
 * Styleguide reference: палитра (8 OKLCH swatches), типографика
 * (4 samples), spacing & radius scale, grid-paper utility demo.
 * Каждый swatch показывает oklch value строкой (Paper & Ink — oklch-first).
 */
@Component({
  selector: 'app-foundations-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiDemoComponent,
    CardComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="02 · основы"
      title="Основы"
      subtitle="Палитра paper, ink и акценты. Типографика Syne и Jakarta."
      hint="0.1s · getting started"
    />

    <!-- ───── Section I. Палитра (8 swatches) ───── -->
    <app-pi-section title="Палитра" hint="13 OKLCH swatches" eyebrow="I">        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        @for (sw of palette; track sw.name) {
          <app-pi-card>
            <div
              preview
              class="w-full h-20 rounded-sm hairline"
              [style.background]="sw.cssVar"
            ></div>
            <div info>
              <h4 class="font-display text-sm font-semibold">{{ sw.name }}</h4>
              <p class="eyebrow text-[10px] tracking-[0.18em] mt-1">{{ sw.token }}</p>
              <p class="font-mono text-[10px] mt-1 text-muted-foreground">{{ sw.value }}</p>
            </div>
          </app-pi-card>
        }
      </div>
    </app-pi-section>

    <!-- ───── Section II. Типографика ───── -->
    <app-pi-section title="Типографика" hint="Syne display · Jakarta body · mono metadata" eyebrow="II">
      <div class="space-y-8 max-w-3xl">
        <div>
          <p class="eyebrow mb-2">Display 5xl</p>
          <h2 class="font-display text-5xl font-bold tracking-[-0.02em]">
            Заголовок Display
          </h2>
        </div>
        <div>
          <p class="eyebrow mb-2">Display 3xl</p>
          <h3 class="font-display text-3xl font-semibold">
            Подзаголовок Display
          </h3>
        </div>
        <div>
          <p class="eyebrow mb-2">Body base</p>
          <p class="text-base font-body leading-relaxed">
            Основной текст на 580ch для удобочитаемости. Эта строка длиной
            примерно 58 символов и комфортно ложится в reading-flow.
          </p>
        </div>
        <div>
          <p class="eyebrow mb-1">mono eyebrow</p>
          <p class="font-mono text-[11px] tracking-[0.18em] uppercase">UI KIT V0.1 · 2026</p>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section III. Spacing & Radius ───── -->
    <app-pi-section title="Spacing & Radius" hint="8/12/16/24/32/48/64" eyebrow="III">
      <div class="space-y-8">
        <div>
          <p class="eyebrow mb-3">Spacing scale</p>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
            @for (s of spacing; track s) {
              <div class="flex flex-col items-center gap-1">
                <div
                  class="bg-ink"
                  [style.width.px]="s"
                  [style.height.px]="s"
                ></div>
                <span class="font-mono text-[10px] text-muted-foreground">{{ s }}px</span>
              </div>
            }
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">Radius scale</p>
          <div class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col items-center gap-1">
              <div class="w-16 h-16 bg-paper-2 hairline rounded-none"></div>
              <span class="font-mono text-[10px] text-muted-foreground">0</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="w-16 h-16 bg-paper-2 hairline rounded-sm"></div>
              <span class="font-mono text-[10px] text-muted-foreground">sm 6px</span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="w-16 h-16 bg-paper-2 hairline rounded-md"></div>
              <span class="font-mono text-[10px] text-muted-foreground">md 10px</span>
            </div>
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">Hairline border (1px only)</p>
          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 hairline">hairline rule</div>
            <div class="px-4 py-2 hairline border-ink">hairline ink</div>
            <div class="px-4 py-2 hairline border-destructive">hairline destructive</div>
          </div>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section IV. Grid ───── -->
    <app-pi-section title="Grid" hint="grid-paper utility" eyebrow="IV">
      <app-pi-demo title="grid-paper" description="24×24px subtle pattern">
        <div
          preview
          class="grid-paper w-full h-48 hairline flex items-center justify-center rounded-sm"
        >
          <span class="eyebrow">24×24px grid canvas</span>
        </div>
      </app-pi-demo>
    </app-pi-section>
  `,
})
export class FoundationsPage {
  protected readonly palette = [
    { name: 'paper', token: '--color-paper', value: 'oklch(0.972 0.015 70)', cssVar: 'var(--color-paper)' },
    { name: 'paper-2', token: '--color-paper-2', value: 'oklch(0.930 0.045 80)', cssVar: 'var(--color-paper-2)' },
    { name: 'ink', token: '--color-ink', value: 'oklch(0.180 0.015 70)', cssVar: 'var(--color-ink)' },
    { name: 'rule', token: '--color-rule', value: 'oklch(0.850 0.020 70)', cssVar: 'var(--color-rule)' },
    { name: 'muted fg', token: '--color-muted-foreground', value: 'oklch(0.55 0.025 70)', cssVar: 'var(--color-muted-foreground)' },
    { name: 'destructive', token: '--color-destructive', value: 'oklch(0.5 0.18 27)', cssVar: 'var(--color-destructive)' },
    { name: 'accent-warm', token: '--color-accent-warm', value: 'oklch(0.50 0.18 60)', cssVar: 'var(--color-accent-warm)' },
    { name: 'accent-cool', token: '--color-accent-cool', value: 'oklch(0.45 0.14 250)', cssVar: 'var(--color-accent-cool)' },
    { name: 'sunrise-soft', token: '--color-sunrise-soft', value: 'oklch(0.94 0.055 80)', cssVar: 'var(--color-sunrise-soft)' },
    { name: 'sunrise-mist', token: '--color-sunrise-mist', value: 'oklch(0.965 0.040 80)', cssVar: 'var(--color-sunrise-mist)' },
    { name: 'sunrise', token: '--color-sunrise', value: 'oklch(0.66 0.14 55)', cssVar: 'var(--color-sunrise)' },
    { name: 'sunrise-warm', token: '--color-sunrise-warm', value: 'oklch(0.50 0.07 55)', cssVar: 'var(--color-sunrise-warm)' },
    { name: 'sunrise-glow', token: '--color-sunrise-glow', value: 'oklch(0.72 0.18 60)', cssVar: 'var(--color-sunrise-glow)' },
  ];

  protected readonly spacing = [4, 8, 12, 16, 24, 32, 48, 64];
}
