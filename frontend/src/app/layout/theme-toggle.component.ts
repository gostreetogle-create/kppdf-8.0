import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Sun, Moon } from 'lucide-angular';
import { ThemeService } from '../shared/theme/theme.service';

/**
 * TZ-67 ThemeToggle — minimal button that flips ThemeService mode.
 *
 * Renders a small icon-only button: `moon` when light (click → dark),
 * `sun` when dark (click → light). Uses the signal-based ThemeService
 * from `core/` (TZ-33), so theme state stays in sync across the app
 * (header toggle, Theme Editor TZ-77, etc.).
 *
 * Standalone + OnPush. `aria-pressed` reflects current isDark state.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      class="pi-theme-toggle inline-flex items-center justify-center
             w-8 h-8 hairline rounded-sm
             hover:bg-paper-2 transition-colors"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="theme.isDark()"
      [attr.title]="ariaLabel()"
      (click)="theme.toggle()"
    >
      @if (theme.isDark()) {
        <lucide-angular [img]="sunIcon" [size]="14" aria-hidden="true" />
      } @else {
        <lucide-angular [img]="moonIcon" [size]="14" aria-hidden="true" />
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly sunIcon = Sun;
  protected readonly moonIcon = Moon;

  protected readonly ariaLabel = computed(() =>
    this.theme.isDark() ? 'Включить светлую тему' : 'Включить тёмную тему',
  );
}
