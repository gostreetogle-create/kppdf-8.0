import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ThemeEditorService } from './theme-editor.service';
import { ButtonComponent } from '../ui/button/button.component';
import { CardComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';

interface SliderGroup {
  label: string;
  values: {
    key: 'lightness' | 'chroma' | 'hue';
    label: string;
    min: number;
    max: number;
    step: number;
  }[];
  current: () => { lightness: number; chroma: number; hue: number };
  onChange: (key: 'lightness' | 'chroma' | 'hue', value: number) => void;
}

/**
 * PiThemeEditorComponent — TZ-77.
 *
 * Live OKLCH sliders для ink/paper/rule tokens. Reactive: каждый
 * slider commit обновляет CSS variable `--color-X-override`, что
 * instantly re-tints все consumers (TZ-32 base values сохранены
 * через fallback syntax).
 */
@Component({
  selector: 'app-pi-theme-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent, BadgeComponent, DecimalPipe],
  template: `
    <div class="space-y-8">
      @for (group of groups; track group.label) {
        <section>
          <div class="flex items-baseline justify-between mb-3">
            <h3 class="font-display text-lg font-semibold">{{ group.label }}</h3>
            <span class="eyebrow text-[10px] text-muted-foreground">
              {{ format(group.current()) }}
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (slider of group.values; track slider.key) {
              <div class="hairline rounded-sm p-4 bg-paper">
                <div class="flex items-center justify-between mb-2">
                  <label class="eyebrow text-[10px]">{{ slider.label }}</label>
                  <span class="mono text-[11px]">
                    {{ group.current()[slider.key] | number: '1.0-2' }}
                  </span>
                </div>
                <input
                  type="range"
                  class="w-full accent-ink"
                  [attr.id]="sliderId(group.label, slider.key)"
                  [attr.name]="sliderId(group.label, slider.key)"
                  [min]="slider.min"
                  [max]="slider.max"
                  [step]="slider.step"
                  [value]="group.current()[slider.key]"
                  (input)="
                    group.onChange(slider.key, $any($event.target).valueAsNumber); svc.commit()
                  "
                  [attr.aria-label]="group.label + ' ' + slider.label"
                />
              </div>
            }
          </div>
        </section>
      }

      <section>
        <h3 class="font-display text-lg font-semibold mb-3">Live preview</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <app-pi-card title="Sample card" description="Reactive to ink/paper/rule sliders" />
          <div class="p-5 hairline rounded-sm space-y-3">
            <p class="text-sm">
              Этот текст и эта граница реактивно перекрашиваются при движении слайдеров.
            </p>
            <div class="flex flex-wrap gap-2">
              <app-pi-badge variant="default">Default</app-pi-badge>
              <app-pi-badge variant="secondary">Secondary</app-pi-badge>
              <app-pi-badge variant="outline">Outline</app-pi-badge>
              <app-pi-badge variant="destructive">Destructive</app-pi-badge>
            </div>
            <app-pi-button variant="default">Action</app-pi-button>
          </div>
        </div>
      </section>

      <div class="flex justify-end">
        <app-pi-button variant="outline" (click)="svc.reset()"> Reset to defaults </app-pi-button>
      </div>
    </div>
  `,
  // Note: | number pipe requires CommonModule — we import it via the host template's local imports
})
export class PiThemeEditorComponent {
  protected readonly svc = inject(ThemeEditorService);

  /** Generate a kebab-case ID for a slider input, safe for Angular template expressions. */
  protected sliderId(label: string, key: string): string {
    return (
      'theme-' +
      (label + '-' + key)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+$/, '')
    );
  }

  protected format(v: { lightness: number; chroma: number; hue: number }): string {
    return `oklch(${v.lightness.toFixed(1)}% ${v.chroma.toFixed(2)} ${v.hue.toFixed(0)})`;
  }

  protected readonly groups: SliderGroup[] = [
    {
      label: 'Ink (text + borders)',
      values: [
        { key: 'lightness', label: 'Lightness', min: 0, max: 50, step: 0.5 },
        { key: 'chroma', label: 'Chroma', min: 0, max: 0.5, step: 0.01 },
        { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
      ],
      current: () => this.svc.ink(),
      onChange: (k, v) => this.svc.setInk({ [k]: v }),
    },
    {
      label: 'Paper (background)',
      values: [
        { key: 'lightness', label: 'Lightness', min: 80, max: 100, step: 0.1 },
        { key: 'chroma', label: 'Chroma', min: 0, max: 0.05, step: 0.001 },
        { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
      ],
      current: () => this.svc.paper(),
      onChange: (k, v) => this.svc.setPaper({ [k]: v }),
    },
    {
      label: 'Rule (hairlines)',
      values: [
        { key: 'lightness', label: 'Lightness', min: 50, max: 95, step: 0.5 },
        { key: 'chroma', label: 'Chroma', min: 0, max: 0.05, step: 0.001 },
        { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
      ],
      current: () => this.svc.rule(),
      onChange: (k, v) => this.svc.setRule({ [k]: v }),
    },
  ];
}
