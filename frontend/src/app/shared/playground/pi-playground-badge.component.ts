import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BadgeComponent } from '../ui/badge/badge.component';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';
export type BadgeSize = 'sm' | 'md';

const VARIANT_OPTIONS: { value: BadgeVariant; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'destructive', label: 'Destructive' },
];

const SIZE_OPTIONS: { value: BadgeSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
];

/**
 * PiPlaygroundBadgeComponent — TZ-76.
 *
 * Storybook-style live controls для <app-pi-badge>. Live preview +
 * controls panel.
 */
@Component({
  selector: 'app-pi-playground-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 hairline rounded-sm overflow-hidden">
      <!-- Live preview -->
      <div
        class="p-10 flex items-center justify-center bg-[linear-gradient(var(--color-rule)_1px,transparent_1px),linear-gradient(90deg,var(--color-rule)_1px,transparent_1px)] bg-[size:24px_24px]"
        data-test="playground-badge-preview"
      >
        <app-pi-badge [variant]="variant()" [size]="size()" [dot]="dot()">
          {{ text() }}
        </app-pi-badge>
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
            [checked]="dot()"
            (change)="dot.set($any($event.target).checked)"
          />
          Show dot
        </label>

        <div>
          <label class="eyebrow text-[10px] block mb-1">Text</label>
          <input
            type="text"
            class="w-full hairline rounded-sm px-3 py-1.5 bg-paper text-sm font-body focus:outline-none focus:border-ink"
            [value]="text()"
            (input)="text.set($any($event.target).value)"
            aria-label="Text"
          />
        </div>
      </div>
    </div>
  `,
})
export class PiPlaygroundBadgeComponent {
  protected readonly VARIANT_OPTIONS = VARIANT_OPTIONS;
  protected readonly SIZE_OPTIONS = SIZE_OPTIONS;

  protected readonly variant = signal<BadgeVariant>('default');
  protected readonly size = signal<BadgeSize>('md');
  protected readonly dot = signal(true);
  protected readonly text = signal('beta');
}
