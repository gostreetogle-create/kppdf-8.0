import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/tokens';
import { PAGES, PageConfig, isListable } from '../../configs/pages.config';
import { GatesService } from '../../core/services/gates.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

interface PageWithCount extends PageConfig {
  count: number;
  status: 'empty' | 'low' | 'ok';
}

@Component({
  selector: 'app-task-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold tracking-tight">✅ Панель задач</h1>
        <p class="text-sm text-muted-foreground">
          Таблицы отсортированы по приоритету заполнения. Сначала — Phase 1 (foundation).
        </p>
      </header>

      <div class="flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">Фильтр:</span>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'all'" (click)="filter.set('all')">Все</button>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'empty'" (click)="filter.set('empty')">
          🔴 Пустые
        </button>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'low'" (click)="filter.set('low')">
          🟡 Низкие
        </button>
      </div>

      @for (phase of phaseGroups(); track phase.priority) {
        <section>
          <h2 class="text-lg font-semibold flex items-center gap-2 mb-2">
            <span>Phase {{ phase.priority }}</span>
            <app-badge [label]="phase.pages.length + ' таблиц'" variant="secondary" />
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (page of phase.pages; track page.id) {
              <a
                [routerLink]="'/p/' + page.id"
                class="card p-4 hover:shadow-md transition-all hover:border-primary"
              >
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ page.icon }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate">{{ page.title }}</div>
                    <div class="text-xs text-muted-foreground">
                      /{{ page.id }}
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                      <span
                        class="inline-block w-2 h-2 rounded-full"
                        [class.bg-destructive]="page.status === 'empty'"
                        [class.bg-warning]="page.status === 'low'"
                        [class.bg-success]="page.status === 'ok'"
                      ></span>
                      <span class="text-xs text-muted-foreground">
                        {{ page.count }} {{ page.count === 1 ? 'запись' : 'записей' }}
                      </span>
                      @if (page.roles) {
                        <span class="text-[10px] opacity-60">🔒 {{ page.roles.join(',') }}</span>
                      }
                    </div>
                  </div>
                </div>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class TaskPanelPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly gates = inject(GatesService);

  readonly filter = signal<'all' | 'empty' | 'low'>('empty');
  readonly pages = signal<PageWithCount[]>([]);

  readonly phaseGroups = computed(() => {
    const filtered =
      this.filter() === 'all'
        ? this.pages()
        : this.pages().filter((p) =>
            this.filter() === 'empty' ? p.status === 'empty' : p.status === 'low',
          );
    const groups: Record<number, PageWithCount[]> = {};
    for (const page of filtered) {
      if (!groups[page.priority]) groups[page.priority] = [];
      groups[page.priority].push(page);
    }
    return Object.entries(groups)
      .map(([p, pages]) => ({ priority: Number(p), pages }))
      .sort((a, b) => a.priority - b.priority);
  });

  ngOnInit(): void {
    this.fetchCounts();
  }

  private fetchCounts(): void {
    // Skip pages without a list-all endpoint (sub-resources, backend-less
    // stubs, or paths with parent-id placeholders). Otherwise we'd issue
    // `?limit=0` against non-existent paths and pollute the console with
    // 404 noise. See `isListable()` in pages.config.ts for the exact rule.
    const listable = this.gates.filterEnabled(PAGES).filter(isListable);

    const promises = listable.map((p) =>
      this.http
        .get<unknown[]>(`${this.baseUrl}${this.resolveEndpoint(p.endpoint)}`, {
          params: { limit: '0' },
        })
        .toPromise()
        .then((data) => {
          const count = Array.isArray(data) ? data.length : 0;
          return { ...p, count, status: this.statusOf(count) } as PageWithCount;
        })
        .catch(() => ({ ...p, count: 0, status: 'empty' as const })),
    );
    Promise.all(promises).then((results) => {
      results.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
      this.pages.set(results);
    });
  }

  private statusOf(count: number): 'empty' | 'low' | 'ok' {
    if (count === 0) return 'empty';
    if (count < 5) return 'low';
    return 'ok';
  }

  private resolveEndpoint(endpoint: string): string {
    if (endpoint.includes(':')) return endpoint.split('/:')[0];
    return endpoint;
  }
}
