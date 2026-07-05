import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PAGES, PageConfig } from '../../configs/pages.config';

/**
 * Vertical layer in the left-to-right product hierarchy.
 * Order in the array = order of columns on the board.
 */
interface Column {
  /** Roman numeral shown in the header — communicates left-to-right reading direction. */
  numeral: string;
  title: string;
  subtitle: string;
  icon: string;
  /** Page ids that belong to this layer; resolved against PAGES at runtime. */
  pageIds: string[];
}

const COLUMNS: Column[] = [
  {
    numeral: 'I',
    title: 'Сырьё',
    subtitle: 'Что мы ПОКУПАЕМ у поставщиков',
    icon: '🧱',
    pageIds: ['material'],
  },
  {
    numeral: 'II',
    title: 'Готовый продукт',
    subtitle: 'Что мы ПРОДАЁМ клиентам',
    icon: '📦',
    pageIds: ['product'],
  },
  {
    numeral: 'III',
    title: 'Рецепты и детали',
    subtitle: 'Из чего собрано и какие модули',
    icon: '🧬',
    pageIds: ['product-module', 'bom'],
  },
  {
    numeral: 'IV',
    title: 'Документы и фото',
    subtitle: 'Что идёт с товаром',
    icon: '📘',
    pageIds: ['product-passport', 'certificate', 'inventor-file', 'photo'],
  },
];

@Component({
  selector: 'app-products-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold tracking-tight">📦 Продукция — обзор</h1>
        <p class="text-sm text-muted-foreground max-w-3xl mt-1">
          Слева направо — что во что входит. Кликните на карточку, чтобы открыть
          соответствующую таблицу и начать работу.
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 items-start">
        @for (col of columns(); track col.numeral) {
          <section class="flex flex-col gap-3">
            <header class="px-1">
              <div class="flex items-baseline gap-2">
                <span class="text-[11px] font-mono font-semibold text-muted-foreground tracking-wider">{{ col.numeral }}</span>
                <span class="text-2xl">{{ col.icon }}</span>
              </div>
              <h2 class="font-semibold mt-1.5 leading-tight">{{ col.title }}</h2>
              <p class="text-xs text-muted-foreground mt-0.5">{{ col.subtitle }}</p>
            </header>

            <div class="space-y-2">
              @for (page of col.pages; track page.id) {
                <a
                  [routerLink]="'/p/' + page.id"
                  class="card p-4 block hover:shadow-md hover:border-primary transition-all group"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-2xl shrink-0">{{ page.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm leading-tight">{{ page.title }}</div>
                      <div class="text-[11px] text-muted-foreground font-mono mt-1 truncate">
                        {{ page.endpoint }}
                      </div>
                    </div>
                    <span
                      class="text-primary text-lg shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    >→</span>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      </div>

      <!-- Vertical flow labels between columns (only on desktop where columns are inline). -->
      <div class="hidden lg:grid grid-cols-4 gap-x-4 text-center text-xs text-muted-foreground italic -mt-2">
        <span></span>
        <span>↓ собрано из ↓</span>
        <span>↓ сопровождается документами ↓</span>
        <span></span>
      </div>

      <!-- Relationship summary card -->
      <section class="card p-5 bg-muted/30">
        <h3 class="font-semibold text-sm flex items-center gap-2">
          <span>🔗</span> Полная цепочка (что во что входит)
        </h3>
        <ol class="mt-3 space-y-1.5 text-sm">
          <li>
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">Material</code>
            (сырьё) — указывается как строка состава внутри
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">Bom</code>
            конкретного продукта.
          </li>
          <li>
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">Bom</code>
            (спецификация) — рецепт одного продукта: какие материалы и сколько.
          </li>
          <li>
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">ProductModule</code>
            — переиспользуемая деталь для модульных продуктов (рама, полотно, наличник).
          </li>
          <li>
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">ProductPassport</code>,
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">Certificate</code>,
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">InventorFile</code>,
            <code class="text-xs px-1.5 py-0.5 bg-background rounded">Photo</code>
            — документы и графика, привязанные к продукту.
          </li>
        </ol>
        <p class="text-xs text-muted-foreground mt-3 italic">
          💡 Чтобы увидеть «как делать» (TechProcess, WorkOrder, Worker), перейдите в категорию «Производство».
          «Кому продаём» (Quotation, Contract, Order) — в «Продажи».
        </p>
      </section>
    </div>
  `,
})
export class ProductsOverviewPage {
  readonly columns = computed(() =>
    COLUMNS.map((c) => ({
      ...c,
      pages: c.pageIds
        .map((id) => PAGES.find((p) => p.id === id))
        .filter((p): p is PageConfig => p !== undefined),
    })),
  );
}
