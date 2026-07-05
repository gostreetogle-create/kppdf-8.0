import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { GatesService } from '../../core/services/gates.service';
import { PAGES, PageConfig } from '../../configs/pages.config';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <header class="border-b bg-card px-4 h-14 flex items-center gap-3">
      <div class="flex-1 max-w-xl relative">
        <app-icon
          name="Search"
          [size]="16"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          placeholder="Поиск по таблицам..."
          class="input w-full pl-9"
          [ngModel]="query()"
          (ngModelChange)="onSearch($event)"
          (focus)="showResults.set(true)"
          (blur)="onBlur()"
        />
        @if (showResults() && results().length > 0) {
          <div
            class="absolute top-full left-0 right-0 mt-1 card max-h-80 overflow-y-auto z-50 shadow-lg"
          >
            @for (page of results(); track page.id) {
              <a
                [routerLink]="'/p/' + page.id"
                (click)="clear()"
                class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                <app-icon [name]="page.icon" [size]="14" />
                <span class="flex-1">{{ page.title }}</span>
                <span class="text-xs text-muted-foreground">{{ page.category }}</span>
              </a>
            }
          </div>
        }
      </div>

      <button
        class="btn-ghost btn-icon"
        (click)="theme.toggle()"
        [title]="theme.theme() === 'dark' ? 'Light' : 'Dark'"
        [attr.aria-label]="'Toggle theme, currently ' + theme.theme()"
      >
        @if (theme.theme() === 'dark') {
          <app-icon name="Sun" [size]="18" />
        } @else {
          <app-icon name="Moon" [size]="18" />
        }
      </button>

      <select class="input w-20" [ngModel]="lang()" (ngModelChange)="setLang($event)">
        <option value="ru">RU</option>
        <option value="en">EN</option>
      </select>

      <div class="text-sm text-muted-foreground">
        @if (auth.user(); as u) {
          {{ u.email }}
        }
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly gates = inject(GatesService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly showResults = signal(false);
  readonly lang = signal<'ru' | 'en'>('ru');

  /** Reactive visible pages — picks up gate overrides on signal change. */
  private readonly visiblePages = computed<PageConfig[]>(() =>
    this.gates.filterEnabled(PAGES).filter((p) => this.auth.hasRole(p.roles)),
  );

  /** Reactive search results — picks up query, visibility, gate overrides, role. */
  readonly results = computed<PageConfig[]>(() => {
    const q = this.query().toLowerCase().trim();
    const all = this.visiblePages();
    if (!q) return all.slice(0, 5);
    return all
      .filter((p) => p.title.toLowerCase().includes(q) || p.id.includes(q))
      .slice(0, 10);
  });

  onSearch(q: string): void {
    this.query.set(q);
  }

  clear(): void {
    this.query.set('');
  }

  onBlur(): void {
    setTimeout(() => this.showResults.set(false), 200);
  }

  setLang(l: 'ru' | 'en'): void {
    this.lang.set(l);
    document.documentElement.lang = l;
  }
}
