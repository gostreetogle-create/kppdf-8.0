import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Kit overview — entry point для Paper & Ink UI Kit.
 *
 * Показывает карту разделов и статус каждого примитива.
 */
@Component({
  selector: 'app-kit-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="pi-page-frame">
      <h1 class="font-display text-3xl font-bold tracking-[-0.02em] mb-2">Paper & Ink · UI Kit</h1>
      <p class="text-sm text-muted-foreground max-w-prose mb-8">
        Библиотека UI-примитивов KPPDF: компоненты, токены, оверлеи, формы. Каждый примитив имеет
        паспорт: назначение, anti-use, keyboard, статус.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          routerLink="/kit/foundations"
          class="hairline rounded-sm p-4 hover:bg-paper-2 transition-colors no-underline"
        >
          <span class="eyebrow mb-1 block">02</span>
          <h2 class="font-title-sm text-ink mb-1">Основы</h2>
          <p class="text-xs text-muted-foreground">OKLCH-палитра, типографика, spacing, grid.</p>
          <span class="text-[10px] font-mono text-sunrise-warm mt-2 block">Статус: canonical</span>
        </a>

        <a
          routerLink="/kit/forms"
          class="hairline rounded-sm p-4 hover:bg-paper-2 transition-colors no-underline"
        >
          <span class="eyebrow mb-1 block">04</span>
          <h2 class="font-title-sm text-ink mb-1">Формы и таблицы</h2>
          <p class="text-xs text-muted-foreground">Реактивные формы, валидация, pi-table.</p>
          <span class="text-[10px] font-mono text-sunrise-warm mt-2 block">Статус: canonical</span>
        </a>

        <a
          routerLink="/kit/overlays"
          class="hairline rounded-sm p-4 hover:bg-paper-2 transition-colors no-underline"
        >
          <span class="eyebrow mb-1 block">05</span>
          <h2 class="font-title-sm text-ink mb-1">Оверлеи</h2>
          <p class="text-xs text-muted-foreground">Dialog, Sheet, Drawer, Toast, DropdownMenu.</p>
          <span class="text-[10px] font-mono text-sunrise-warm mt-2 block">Статус: canonical</span>
        </a>

        <div class="hairline rounded-sm p-4 opacity-60">
          <span class="eyebrow mb-1 block">03</span>
          <h2 class="font-title-sm text-ink mb-1">Базовые</h2>
          <p class="text-xs text-muted-foreground">
            Button, Input, Checkbox, Badge, Skeleton — скоро.
          </p>
          <span class="text-[10px] font-mono text-muted-foreground mt-2 block"
            >Статус: experimental</span
          >
        </div>

        <div class="hairline rounded-sm p-4 opacity-60">
          <span class="eyebrow mb-1 block">06</span>
          <h2 class="font-title-sm text-ink mb-1">Навигация</h2>
          <p class="text-xs text-muted-foreground">Breadcrumb, Tabs, Sidebar — скоро.</p>
          <span class="text-[10px] font-mono text-muted-foreground mt-2 block"
            >Статус: experimental</span
          >
        </div>
      </div>

      <div class="mt-8 hairline-t pt-6">
        <h3 class="eyebrow mb-3">Агентам</h3>
        <p class="text-xs text-muted-foreground">
          Слепок этой карты для промптов:
          <code class="font-mono text-[11px]">docs/ui-rules.md</code>
          (таблица примитивов + запрещено + stop rule).
        </p>
      </div>

      <div class="mt-8 hairline-t pt-6">
        <h3 class="eyebrow mb-3">Неполные секции (leftover)</h3>
        <ul class="space-y-1 text-sm text-muted-foreground">
          <li>
            <code class="font-mono text-[11px]">/kit/basics</code> — placeholder, ждёт WR-501
            (paper-and-ink)
          </li>
          <li>
            <code class="font-mono text-[11px]">/kit/navigation</code> — placeholder, компоненты не
            готовы
          </li>
          <li><code class="font-mono text-[11px]">/kit/playground/theme</code> — не реализован</li>
          <li><code class="font-mono text-[11px]">/kit/playground/code</code> — не реализован</li>
        </ul>
      </div>
    </div>
  `,
})
export class KitOverviewPage {}
