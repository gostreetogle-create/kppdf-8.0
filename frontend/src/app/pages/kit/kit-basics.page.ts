import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Kit basics — placeholder для базовых примитивов.
 *
 * Зона WR-501 (paper-and-ink.md). Сейчас заглушка.
 * Список примитивов: Button, Input, Checkbox, Badge, Skeleton, Icon.
 */
@Component({
  selector: 'app-kit-basics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pi-page-frame">
      <h1 class="font-display text-3xl font-bold tracking-[-0.02em] mb-2">Базовые компоненты</h1>
      <p class="text-sm text-muted-foreground max-w-prose mb-6">
        Button, Input, Checkbox, Badge, Skeleton, Icon — базовые атомы Paper & Ink.
      </p>
      <div class="pi-dashed-panel p-stack-lg bg-paper max-w-md">
        <span class="pi-tech-label">REF: KIT.03</span>
        <h3 class="font-title-sm text-ink mb-2 mt-2">Статус: experimental</h3>
        <p class="text-sm text-muted-foreground">
          Секция в разработке (WR-501). Полный канон — paper-and-ink.md.
        </p>
      </div>
    </div>
  `,
})
export class KitBasicsPage {}
