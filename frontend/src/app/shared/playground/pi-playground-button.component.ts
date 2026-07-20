import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideAngularModule, Save } from 'lucide-angular';
import { ButtonComponent } from '../ui/button/button.component';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_OPTIONS: { value: ButtonVariant; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'link', label: 'Link' },
  { value: 'destructive', label: 'Destructive' },
];

const SIZE_OPTIONS: { value: ButtonSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'icon', label: 'Icon' },
];

/**
 * PiPlaygroundButtonComponent — TZ-76.
 *
 * Storybook-style live controls для <app-pi-button>. Split view:
 * left = live preview (grid-paper canvas), right = controls panel.
 * Signal-driven: changing controls reactively mutates live instance.
 */
@Component({
  selector: 'app-pi-playground-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, LucideAngularModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 hairline rounded-sm overflow-hidden">
      <!-- Live preview -->
      <div
        class="p-10 flex items-center justify-center bg-[linear-gradient(var(--color-rule)_1px,transparent_1px),linear-gradient(90deg,var(--color-rule)_1px,transparent_1px)] bg-[size:24px_24px]"
        data-test="playground-button-preview"
      >
        <app-pi-button [variant]="variant()" [size]="size()" [disabled]="disabled() || loading()">
          @if (loading()) {
            <span
              class="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></span>
          } @else if (hasLeadingIcon()) {
            <lucide-angular [img]="saveIcon" size="14" />
          }
          <span>{{ label() }}</span>
        </app-pi-button>
      </div>

      <!-- Controls -->
      <div class="p-6 space-y-4 bg-paper">
        <p class="eyebrow">Live controls</p>

        <div>
          <label class="eyebrow text-[10px] block mb-1">Variant</label>
          <select
            class="w-full hairline rounded-sm px-3 py-1.5 bg-paper text-sm font-body focus:outline-none focus:border-ink"
            [value]="variant()"
            (change)="variant.set($any($event.target).value)"
            aria-label="Variant"
          >
            @for (opt of VARIANT_OPTIONS; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        <div>
          <label class="eyebrow text-[10px] block mb-1">Size</label>
          <select
            class="w-full hairline rounded-sm px-3 py-1.5 bg-paper text-sm font-body focus:outline-none focus:border-ink"
            [value]="size()"
            (change)="size.set($any($event.target).value)"
            aria-label="Size"
          >
            @for (opt of SIZE_OPTIONS; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>

        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            class="hairline"
            [checked]="disabled()"
            (change)="disabled.set($any($event.target).checked)"
          />
          Disabled
        </label>

        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            class="hairline"
            [checked]="loading()"
            (change)="loading.set($any($event.target).checked)"
          />
          Loading
        </label>

        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            class="hairline"
            [checked]="hasLeadingIcon()"
            (change)="hasLeadingIcon.set($any($event.target).checked)"
          />
          Leading icon
        </label>

        <div>
          <label class="eyebrow text-[10px] block mb-1">Label</label>
          <input
            type="text"
            class="w-full hairline rounded-sm px-3 py-1.5 bg-paper text-sm font-body focus:outline-none focus:border-ink"
            [value]="label()"
            (input)="label.set($any($event.target).value)"
            aria-label="Label"
          />
        </div>
      </div>
    </div>
  `,
})
export class PiPlaygroundButtonComponent {
  protected readonly saveIcon = Save;

  protected readonly VARIANT_OPTIONS = VARIANT_OPTIONS;
  protected readonly SIZE_OPTIONS = SIZE_OPTIONS;

  protected readonly variant = signal<ButtonVariant>('default');
  protected readonly size = signal<ButtonSize>('md');
  protected readonly disabled = signal(false);
  protected readonly loading = signal(false);
  protected readonly hasLeadingIcon = signal(false);
  protected readonly label = signal('Сохранить');
}
