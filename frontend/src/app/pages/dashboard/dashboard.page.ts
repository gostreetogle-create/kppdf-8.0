import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/tokens';
import { CATEGORIES, PAGES } from '../../configs/pages.config';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold tracking-tight">📊 Дашборд</h1>
        <p class="text-sm text-muted-foreground">Обзор системы и приоритеты заполнения</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-6">
          <div class="text-sm text-muted-foreground">Всего таблиц</div>
          <div class="text-3xl font-bold mt-1">{{ PAGES.length }}</div>
          <div class="text-xs text-muted-foreground mt-1">в {{ CATEGORIES.length }} категориях</div>
        </div>
        <div class="card p-6 border-l-4 border-l-destructive">
          <div class="text-sm text-muted-foreground">Пустые таблицы</div>
          <div class="text-3xl font-bold mt-1 text-destructive">
            {{ emptyCount() }} / {{ PAGES.length }}
          </div>
          <div class="text-xs text-muted-foreground mt-1">нужно заполнить</div>
        </div>
        <div class="card p-6 border-l-4 border-l-warning">
          <div class="text-sm text-muted-foreground">Низкое заполнение</div>
          <div class="text-3xl font-bold mt-1 text-warning">{{ lowCount() }}</div>
          <div class="text-xs text-muted-foreground mt-1">1-5 записей</div>
        </div>
        <div class="card p-6 border-l-4 border-l-success">
          <div class="text-sm text-muted-foreground">Готовые таблицы</div>
          <div class="text-3xl font-bold mt-1 text-success">{{ okCount() }}</div>
          <div class="text-xs text-muted-foreground mt-1">≥ 5 записей</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (cat of CATEGORIES; track cat.id) {
          <a [routerLink]="'/p/' + getFirstPage(cat.id)" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ cat.icon }}</span>
                <div>
                  <div class="font-semibold">{{ cat.title }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ getPagesFor(cat.id).length }} таблиц
                  </div>
                </div>
              </div>
              <app-badge
                [label]="getEmptyFor(cat.id) + ' пустых'"
                [variant]="getEmptyFor(cat.id) > 0 ? 'destructive' : 'success'"
              />
            </div>
          </a>
        }
      </div>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly PAGES = PAGES;
  readonly CATEGORIES = CATEGORIES;

  readonly counts = signal<Record<string, number>>({});

  ngOnInit(): void {
    this.fetchCounts();
  }

  private fetchCounts(): void {
    const promises = PAGES.map((p) =>
      this.http
        .get<unknown[]>(`${this.baseUrl}${this.resolveEndpoint(p.endpoint)}`, {
          params: { limit: '0' },
        })
        .toPromise()
        .then((data) => {
          const arr = Array.isArray(data) ? data : [];
          return [p.id, arr.length] as const;
        })
        .catch(() => [p.id, 0] as const),
    );
    Promise.all(promises).then((entries) => {
      this.counts.set(Object.fromEntries(entries));
    });
  }

  private resolveEndpoint(endpoint: string): string {
    if (endpoint.includes(':')) return endpoint.split('/:')[0];
    return endpoint;
  }

  emptyCount(): number {
    return Object.values(this.counts()).filter((c) => c === 0).length;
  }
  lowCount(): number {
    return Object.values(this.counts()).filter((c) => c > 0 && c < 5).length;
  }
  okCount(): number {
    return Object.values(this.counts()).filter((c) => c >= 5).length;
  }
  getPagesFor(catId: number): typeof PAGES {
    return PAGES.filter((p) => p.category === catId);
  }
  getFirstPage(catId: number): string {
    return this.getPagesFor(catId)[0]?.id ?? 'dashboard';
  }
  getEmptyFor(catId: number): number {
    const c = this.counts();
    return this.getPagesFor(catId).filter((p) => (c[p.id] ?? 0) === 0).length;
  }
}
