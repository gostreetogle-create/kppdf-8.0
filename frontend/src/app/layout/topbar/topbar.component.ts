import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { PAGES, PageConfig } from '../../configs/pages.config';
import { getEnabledPages } from '../../configs/gates.config';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="border-b bg-card px-4 h-14 flex items-center gap-3">
      <div class="flex-1 max-w-xl relative">
        <input
          type="search"
          placeholder="🔍 Поиск по таблицам..."
          class="input w-full"
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
                <span>{{ page.icon }}</span>
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
        {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
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
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly showResults = signal(false);
  readonly lang = signal<'ru' | 'en'>('ru');

  private readonly visiblePages = (): PageConfig[] =>
    getEnabledPages(PAGES).filter((p) => this.auth.hasRole(p.roles));

  readonly results = signal(this.visiblePages().slice(0, 5));

  onSearch(q: string): void {
    this.query.set(q);
    const lower = q.toLowerCase().trim();
    if (!lower) {
      this.results.set(this.visiblePages().slice(0, 5));
    } else {
      this.results.set(
        this.visiblePages().filter(
          (p) => p.title.toLowerCase().includes(lower) || p.id.includes(lower),
        ).slice(0, 10),
      );
    }
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
