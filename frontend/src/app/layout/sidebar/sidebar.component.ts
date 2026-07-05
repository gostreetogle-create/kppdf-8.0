import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORIES, PageConfig, PAGES } from '../../configs/pages.config';
import { GatesService } from '../../core/services/gates.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 border-r bg-card flex flex-col h-full">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold"
          >
            К
          </div>
          <div>
            <div class="font-bold text-sm">KPPDF ERP</div>
            <div class="text-xs text-muted-foreground">v0.1.0</div>
          </div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto scrollbar-thin p-2">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-accent text-accent-foreground"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <span>📊</span> Дашборд
        </a>
        <a
          routerLink="/task-panel"
          routerLinkActive="bg-accent text-accent-foreground"
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          <span>✅</span> Панель задач
        </a>

        @if (auth.hasRole(['admin'])) {
          <a
            routerLink="/admin/gates"
            routerLinkActive="bg-accent text-accent-foreground"
            class="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <span>⚙️</span> Гейты
          </a>
        }

        <div class="my-2 border-t"></div>

        @for (cat of categories; track cat.id) {
          <div class="mb-1">
            <button
              class="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              (click)="toggle(cat.id)"
            >
              <span class="flex items-center gap-1.5">
                <span>{{ cat.icon }}</span>
                <span>{{ cat.title }}</span>
                <span class="text-[10px] opacity-60">({{ getPagesFor(cat.id).length }})</span>
              </span>
              <span class="text-[10px]">{{ isOpen(cat.id) ? '▾' : '▸' }}</span>
            </button>
            @if (isOpen(cat.id)) {
              <div class="ml-2 space-y-0.5">
                @if (cat.dashboardPath) {
                  <a
                    [routerLink]="cat.dashboardPath"
                    routerLinkActive="bg-accent text-accent-foreground font-medium"
                    class="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-accent hover:text-accent-foreground border-b border-dashed mb-1"
                  >
                    <span class="text-sm">📊</span>
                    <span class="flex-1 truncate font-medium">Обзор категории</span>
                  </a>
                }
                @for (page of getPagesFor(cat.id); track page.id) {
                  <a
                    [routerLink]="'/p/' + page.id"
                    routerLinkActive="bg-accent text-accent-foreground font-medium"
                    class="flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <span class="text-sm">{{ page.icon }}</span>
                    <span class="flex-1 truncate">{{ page.title }}</span>
                    @if (page.roles) {
                      <span class="text-[9px] opacity-50">🔒</span>
                    }
                  </a>
                }
              </div>
            }
          </div>
        }
      </nav>

      <div class="border-t p-3 text-xs text-muted-foreground">
        @if (auth.user(); as user) {
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {{ (user.email.charAt(0) || 'U').toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="truncate text-foreground font-medium text-sm">{{ user.email }}</div>
              <div class="text-[10px] opacity-70">{{ user.role }}</div>
            </div>
            <button class="btn-ghost btn-sm" (click)="auth.logout()" title="Выйти">⏻</button>
          </div>
        }
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly gates = inject(GatesService);
  readonly categories = CATEGORIES;

  private readonly openIds = signal(new Set<number>([1, 2, 3]));

  readonly pagesByCategory = computed(() => {
    const grouped: Record<number, PageConfig[]> = {};
    for (const cat of this.categories) grouped[cat.id] = [];
    // Read gates.effectiveMap() so the computed re-runs when overrides change.
    const visible = this.gates.filterEnabled(PAGES);
    for (const page of visible) {
      if (page.hidden) continue; // UI-only flag — hide from Sidebar/TaskPanel/Dashboard.
      if (this.auth.hasRole(page.roles)) {
        grouped[page.category]?.push(page);
      }
    }
    for (const cat of this.categories) {
      grouped[cat.id]?.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
    }
    return grouped;
  });

  getPagesFor(catId: number): PageConfig[] {
    return this.pagesByCategory()[catId] ?? [];
  }

  isOpen(catId: number): boolean {
    return this.openIds().has(catId);
  }

  toggle(catId: number): void {
    const next = new Set(this.openIds());
    if (next.has(catId)) next.delete(catId);
    else next.add(catId);
    this.openIds.set(next);
  }
}
