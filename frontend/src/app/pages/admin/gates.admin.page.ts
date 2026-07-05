import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GatesService, GateView } from '../../core/services/gates.service';
import { ToastService } from '../../core/services/toast.service';
import { CATEGORIES, PAGES, PageConfig } from '../../configs/pages.config';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

type Filter = 'all' | 'enabled' | 'disabled' | 'overridden';

@Component({
  selector: 'app-gates-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, BadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold tracking-tight">⚙️ Гейты (admin)</h1>
        <p class="text-sm text-muted-foreground">
          Включение / отключение таблиц в Sidebar, Topbar, Dashboard, TaskPanel и в
          прямом доступе <code class="bg-muted px-1 py-0.5 rounded">/p/:id</code>.
          Override хранится в backend <code class="bg-muted px-1 py-0.5 rounded">featureflags</code> под
          ключом <code class="bg-muted px-1 py-0.5 rounded">gate:&lt;pageId&gt;</code>.
        </p>
      </header>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="card p-4">
          <div class="text-xs text-muted-foreground">Включено</div>
          <div class="text-2xl font-bold mt-1 text-success">{{ stats().enabled }} / {{ stats().total }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted-foreground">Отключено</div>
          <div class="text-2xl font-bold mt-1 text-destructive">{{ stats().disabled }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted-foreground">С override</div>
          <div class="text-2xl font-bold mt-1 text-warning">{{ stats().overridden }}</div>
        </div>
        <div class="card p-4">
          <div class="text-xs text-muted-foreground">Состояние</div>
          <div class="text-sm mt-2">
            @if (gates.loading()) {
              <app-badge label="Загрузка…" variant="warning" />
            } @else if (gates.lastError(); as e) {
              <span class="text-destructive" [title]="e">⚠ ошибка</span>
            } @else {
              <app-badge label="OK" variant="success" />
            }
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-muted-foreground">Фильтр:</span>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'all'" (click)="filter.set('all')">
          Все ({{ stats().total }})
        </button>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'enabled'" (click)="filter.set('enabled')">
          🟢 Включённые ({{ stats().enabled }})
        </button>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'disabled'" (click)="filter.set('disabled')">
          🔴 Скрытые ({{ stats().disabled }})
        </button>
        <button class="btn-outline btn-sm" [class.btn-primary]="filter() === 'overridden'" (click)="filter.set('overridden')">
          ✏ С override ({{ stats().overridden }})
        </button>

        <div class="flex-1"></div>

        <button class="btn-outline btn-sm" (click)="reload()" [disabled]="gates.loading()">
          🔄 Обновить
        </button>
      </div>

      <!-- Categories -->
      @for (cat of categoriesWithEntries(); track cat.id) {
        <section class="card p-4">
          <h2 class="text-lg font-semibold flex items-center gap-2 mb-3">
            <span>{{ cat.icon }}</span>
            <span>{{ cat.title }}</span>
            <app-badge [label]="cat.entries.length + ' / ' + cat.totalInCategory" variant="secondary" />
          </h2>
          @if (cat.entries.length === 0) {
            <p class="text-xs text-muted-foreground">Нет таблиц по фильтру в этой категории.</p>
          }
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            @for (row of cat.entries; track row.id) {
              <div class="rounded-lg border p-3 flex items-start gap-3 hover:border-primary transition-colors">
                <span class="text-2xl shrink-0">{{ row.icon }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <a [routerLink]="'/p/' + row.id" class="font-medium hover:underline">{{ row.title }}</a>
                    @if (row.roles && row.roles.length) {
                      <app-badge [label]="'🔒 ' + row.roles.join(',')" variant="outline" />
                    }
                    @if (row.hasOverride) {
                      <app-badge label="override" variant="warning" />
                    }
                  </div>
                  <code class="text-[11px] text-muted-foreground break-all">{{ row.endpoint }}</code>
                </div>
                <button
                  type="button"
                  class="btn-sm shrink-0"
                  [class.btn-primary]="row.effective"
                  [class.btn-outline]="!row.effective"
                  (click)="toggle(row.id, !row.effective)"
                  [disabled]="busy().has(row.id)"
                  [title]="row.effective ? 'Скрыть таблицу' : 'Показать таблицу'"
                >
                  @if (busy().has(row.id)) { ⏳ }
                  @else if (row.effective) { 🟢 ВКЛ }
                  @else { 🔴 ВЫКЛ }
                </button>
              </div>
            }
          </div>
        </section>
      }

      <p class="text-xs text-muted-foreground">
        Скрытая таблица больше не появляется в Sidebar/Topbar/Dashboard, но
        прямой <code class="bg-muted px-1 py-0.5 rounded">/p/&lt;id&gt;</code> показывает карточку
        «Страница пока не активна». Включение мгновенно (optimistic) по сигналу.
      </p>
    </div>
  `,
})
export class GatesAdminPage {
  private readonly toast = inject(ToastService);
  readonly gates = inject(GatesService);

  readonly filter = signal<Filter>('all');

  /** Busy state per gate id during toggle — disables button. */
  readonly busy = signal<Set<string>>(new Set());

  /** Aggregated stats — derived from service entries. */
  readonly stats = computed(() => {
    const list = this.gates.entries();
    return {
      total: list.length,
      enabled: list.filter((e) => e.effective).length,
      disabled: list.filter((e) => !e.effective).length,
      overridden: list.filter((e) => !!e.override).length,
    };
  });

  /** Static catalog lookup so the page can render title/icon/endpoint for each gate row. */
  private readonly catalog = new Map<string, PageConfig>(PAGES.map((p) => [p.id, p]));

  /** Grouped view: category → rows after filter applied. */
  readonly categoriesWithEntries = computed(() => {
    const entries = this.gates.entries();
    const filt = this.filter();
    const filtered = entries.filter((g: GateView) => {
      if (filt === 'enabled') return g.effective;
      if (filt === 'disabled') return !g.effective;
      if (filt === 'overridden') return !!g.override;
      return true;
    });
    return CATEGORIES.map((cat) => {
      const inCat = filtered
        .filter((g) => this.catalog.get(g.id)?.category === cat.id)
        .map((g) => {
          const src = this.catalog.get(g.id);
          return {
            id: g.id,
            title: src?.title ?? g.id,
            icon: src?.icon ?? '❔',
            endpoint: src?.endpoint ?? `gate:${g.id}`,
            roles: src?.roles,
            effective: g.effective,
            hasOverride: !!g.override,
          };
        });
      const totalInCategory = this.catalog
        ? Array.from(this.catalog.values()).filter((p) => p.category === cat.id).length
        : 0;
      return { ...cat, entries: inCat, totalInCategory };
    }).filter((c) => c.totalInCategory > 0);
  });

  async toggle(id: string, enabled: boolean): Promise<void> {
    this.busy.update((set) => new Set([...set, id]));
    const result = await this.gates.toggle(id, enabled);
    this.busy.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
    if (result.ok) {
      this.toast.success(
        enabled ? `«${this.catalog.get(id)?.title ?? id}» включена` : `«${this.catalog.get(id)?.title ?? id}» скрыта`,
      );
    } else {
      this.toast.error(`Не удалось переключить: ${result.error}`);
    }
  }

  reload(): void {
    this.gates.refresh().subscribe({
      next: () => this.toast.success('Гейты обновлены'),
      error: () => this.toast.error('Не удалось обновить гейты'),
    });
  }
}
