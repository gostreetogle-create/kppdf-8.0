import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Kit navigation — placeholder для навигационных примитивов.
 *
 * Список: Breadcrumb, Tabs, Sidebar. Сейчас заглушка.
 */
@Component({
  selector: 'app-kit-navigation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-page-frame">
      <h1 class="font-display text-3xl font-bold tracking-[-0.02em] mb-2">Навигация</h1>
      <p class="text-sm text-muted-foreground max-w-prose mb-6">
        Breadcrumb, Tabs, Sidebar — навигационные примитивы.
      </p>
      <div class="pi-dashed-panel p-stack-lg bg-paper max-w-md">
        <span class="pi-tech-label">REF: KIT.06</span>
        <h3 class="font-title-sm text-ink mb-2 mt-2">Статус: experimental</h3>
        <p class="text-sm text-muted-foreground">Секция в разработке. Компоненты ещё не готовы.</p>
      </div>
    </div>
  `,
})
export class KitNavigationPage {}
