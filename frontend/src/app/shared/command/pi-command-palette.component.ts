import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild, ElementRef, afterNextRender, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { PiCommandPaletteService } from './pi-command-palette.service';
import { ThemeService } from '../../core/theme.service';

export type CommandItem = {
  id: string;
  label: string;
  group: 'Маршруты' | 'Компоненты' | 'Действия';
  shortcut?: string;
  action: () => void;
};

/**
 * PiCommandPaletteComponent — TZ-75.
 *
 * Linear / Raycast-style fuzzy search overlay. Standalone + OnPush +
 * signal-based. Backdrop = ink @ 30% opacity (NOT blur, NOT glass).
 *
 * Keyboard nav:
 *   - ArrowDown / ArrowUp — cycle selectedIdx
 *   - Enter — activate selected item
 *   - Escape — close (handled in service)
 */
@Component({
  selector: 'app-pi-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (palette.isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-ink/30"
        (click)="palette.close()"
      >
        <div
          class="bg-paper border hairline border-rule rounded-sm w-[520px] max-h-[60vh] overflow-hidden flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <input
            #search
            type="text"
            placeholder="Поиск компонента, раздела или действия…"
            class="w-full px-4 py-3 text-base border-b hairline border-rule bg-paper text-ink font-body focus:outline-none"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            (keydown)="onKeyDown($event)"
            aria-label="Поиск"
            autocomplete="off"
            spellcheck="false"
          />
          <ul class="overflow-y-auto max-h-[50vh]" role="listbox">
            @for (item of filtered(); track item.id; let i = $index) {
              <li role="option" [attr.aria-selected]="i === selectedIdx()">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 flex items-center justify-between text-sm transition-colors"
                  [class.bg-ink]="i === selectedIdx()"
                  [class.text-paper]="i === selectedIdx()"
                  [class.hover:bg-paper-2]="i !== selectedIdx()"
                  (click)="select(item)"
                >
                  <span class="font-body">{{ item.label }}</span>
                  <span class="eyebrow text-[11px] text-muted-foreground">
                    {{ item.group }}{{ item.shortcut ? ' · ' + item.shortcut : '' }}
                  </span>
                </button>
              </li>
            }
            @if (filtered().length === 0) {
              <li class="px-4 py-3 text-sm text-muted-foreground font-body">
                Ничего не найдено.
              </li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class PiCommandPaletteComponent {
  protected readonly palette = inject(PiCommandPaletteService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly injector = inject(Injector);

  protected readonly searchRef = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly query = signal('');
  protected readonly selectedIdx = signal(0);

  protected readonly items = signal<CommandItem[]>(this.buildItems());

  protected readonly filtered = computed<CommandItem[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.items();
    if (q === '') return all;
    return all.filter((item) => this.fuzzyMatch(q, item.label.toLowerCase()));
  });

  constructor() {
    // Auto-focus input + reset state when palette opens
    effect(() => {
      const open = this.palette.isOpen();
      if (!open) {
        this.query.set('');
        this.selectedIdx.set(0);
        return;
      }
      // schedule focus + scroll into view after DOM renders
      afterNextRender(() => {
        const el = this.searchRef()?.nativeElement;
        if (el) {
          el.focus();
          el.select();
        }
      }, { injector: this.injector });
    });

    // Keep selectedIdx in range when filtered list shrinks
    effect(() => {
      const len = this.filtered().length;
      if (this.selectedIdx() >= len && len > 0) {
        this.selectedIdx.set(0);
      }
    });
  }

  protected onKeyDown(e: KeyboardEvent): void {
    const len = this.filtered().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIdx.update((i) => (len === 0 ? 0 : (i + 1) % len));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIdx.update((i) => (len === 0 ? 0 : (i - 1 + len) % len));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = this.filtered()[this.selectedIdx()];
      if (item) this.select(item);
    }
  }

  protected select(item: CommandItem): void {
    item.action();
    this.palette.close();
  }

  /** Simple subsequence fuzzy match — every char in `q` must appear in `s` in order. */
  private fuzzyMatch(q: string, s: string): boolean {
    let i = 0;
    for (const ch of s) {
      if (ch === q[i]) i++;
      if (i === q.length) return true;
    }
    return i === q.length;
  }

  private buildItems(): CommandItem[] {
    const go = (path: string): CommandItem => ({
      id: `route-${path}`,
      label: path,
      group: 'Маршруты',
      action: () => this.router.navigateByUrl(path),
    });
    const action = (id: string, label: string, fn: () => void): CommandItem => ({
      id,
      label,
      group: 'Действия',
      action: fn,
    });
    return [
      go('/overview'),
      go('/foundations'),
      go('/basics'),
      go('/forms'),
      go('/overlays'),
      go('/navigation'),
      { id: 'prim-button', label: 'Button', group: 'Компоненты', action: () => this.router.navigateByUrl('/basics') },
      { id: 'prim-badge', label: 'Badge', group: 'Компоненты', action: () => this.router.navigateByUrl('/basics') },
      { id: 'prim-card', label: 'Card', group: 'Компоненты', action: () => this.router.navigateByUrl('/basics') },
      { id: 'prim-input', label: 'Input', group: 'Компоненты', action: () => this.router.navigateByUrl('/basics') },
      { id: 'prim-form-field', label: 'FormField', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-select', label: 'Select', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-checkbox', label: 'Checkbox', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-slider', label: 'Slider', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-table', label: 'Table', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-pagination', label: 'Pagination', group: 'Компоненты', action: () => this.router.navigateByUrl('/forms') },
      { id: 'prim-dialog', label: 'Dialog', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-sheet', label: 'Sheet', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-tooltip', label: 'Tooltip', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-popover', label: 'Popover', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-dropdown', label: 'DropdownMenu', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-toast', label: 'Toast', group: 'Компоненты', action: () => this.router.navigateByUrl('/overlays') },
      { id: 'prim-tabs', label: 'Tabs', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-breadcrumb', label: 'Breadcrumb', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-accordion', label: 'Accordion', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-progress', label: 'Progress', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-skeleton', label: 'Skeleton', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-avatar', label: 'Avatar', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-separator', label: 'Separator', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-scroll-area', label: 'ScrollArea', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      { id: 'prim-charts', label: 'Charts (bar + line)', group: 'Компоненты', action: () => this.router.navigateByUrl('/navigation') },
      action('action-toggle-theme', 'Переключить тему (light/dark)', () => this.theme.toggle()),
    ];
  }
}
