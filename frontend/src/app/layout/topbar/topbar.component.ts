import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PAGES } from '../../configs/pages.config';

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

      <button class="btn-ghost btn-icon" (click)="toggleDark()" [title]="isDark() ? 'Light' : 'Dark'">
        {{ isDark() ? '☀️' : '🌙' }}
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
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly showResults = signal(false);
  readonly isDark = signal(false);
  readonly lang = signal<'ru' | 'en'>('ru');

  readonly results = signal(PAGES.filter((p) => this.auth.hasRole(p.roles)).slice(0, 5));

  onSearch(q: string): void {
    this.query.set(q);
    const lower = q.toLowerCase().trim();
    if (!lower) {
      this.results.set(PAGES.filter((p) => this.auth.hasRole(p.roles)).slice(0, 5));
    } else {
      this.results.set(
        PAGES.filter(
          (p) =>
            this.auth.hasRole(p.roles) &&
            (p.title.toLowerCase().includes(lower) || p.id.includes(lower)),
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

  toggleDark(): void {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDark());
  }

  setLang(l: 'ru' | 'en'): void {
    this.lang.set(l);
    // i18n will be wired in TZ-22+
    document.documentElement.lang = l;
  }
}
