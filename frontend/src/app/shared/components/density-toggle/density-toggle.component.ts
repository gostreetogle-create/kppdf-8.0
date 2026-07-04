import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

export type Density = 'compact' | 'comfortable' | 'spacious';

const SPACING: Record<Density, string> = {
  compact: '0.5',
  comfortable: '0.75',
  spacious: '1',
};

const FONT_SIZE: Record<Density, string> = {
  compact: '0.875',
  comfortable: '0.95',
  spacious: '1',
};

@Component({
  selector: 'hlm-density-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center rounded-md border border-border bg-background p-0.5"
      role="radiogroup"
      aria-label="Density"
    >
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="density() === 'compact'"
        [class]="btnClass('compact')"
        (click)="set('compact')"
        title="Compact"
      >
        <span class="lucide-align-justify h-3.5 w-3.5" aria-hidden="true"></span>
      </button>
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="density() === 'comfortable'"
        [class]="btnClass('comfortable')"
        (click)="set('comfortable')"
        title="Comfortable"
      >
        <span class="lucide-rows-3 h-3.5 w-3.5" aria-hidden="true"></span>
      </button>
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="density() === 'spacious'"
        [class]="btnClass('spacious')"
        (click)="set('spacious')"
        title="Spacious"
      >
        <span class="lucide-rows-4 h-3.5 w-3.5" aria-hidden="true"></span>
      </button>
    </div>
  `,
})
export class DensityToggleComponent {
  // Avoid circular dep — feature, not used here; placeholder for ThemeService future use
  private readonly _theme = inject(ThemeService, { optional: true });

  protected readonly density = signal<Density>(this.initial());

  set(d: Density): void {
    this.density.set(d);
    try {
      localStorage.setItem('kppdf-density', d);
    } catch {}
    this.apply(d);
  }

  private initial(): Density {
    if (typeof localStorage === 'undefined') return 'comfortable';
    const s = localStorage.getItem('kppdf-density');
    if (s === 'compact' || s === 'comfortable' || s === 'spacious') return s;
    return 'comfortable';
  }

  private apply(d: Density): void {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--spacing-unit', SPACING[d] + 'rem');
    document.documentElement.style.setProperty('--font-scale', FONT_SIZE[d]);
  }

  protected btnClass(active: Density): string {
    const isActive = this.density() === active;
    return [
      'inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    ].join(' ');
  }
}
