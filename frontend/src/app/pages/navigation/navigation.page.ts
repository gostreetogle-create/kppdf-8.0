import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiProgressComponent } from '../../shared/ui/progress/pi-progress.component';
import { PiSkeletonComponent } from '../../shared/ui/skeleton/pi-skeleton.component';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';
import { PiSeparatorComponent } from '../../shared/ui/separator/pi-separator.component';
import { PiScrollAreaComponent } from '../../shared/ui/scroll-area/pi-scroll-area.component';
import { PiBarChartComponent } from '../../shared/ui/charts/pi-bar-chart.component';
import { PiLineChartComponent } from '../../shared/ui/charts/pi-line-chart.component';
import { TabsComponent } from '../../shared/ui/pi-tabs.component';
import { TabComponent } from '../../shared/ui/pi-tab.component';
import { AccordionComponent } from '../../shared/ui/pi-accordion.component';
import { AccordionItemComponent } from '../../shared/ui/pi-accordion-item.component';
import { BreadcrumbComponent } from '../../shared/ui/pi-breadcrumb.component';
import { BreadcrumbItemComponent } from '../../shared/ui/pi-breadcrumb-item.component';

/**
 * Navigation page (/navigation) — TZ-74.
 *
 * Showcase: Tabs (3 panels), Breadcrumb, Accordion, Progress + Skeleton
 * + Avatar, Charts (bar + line), Separator, ScrollArea.
 */
@Component({
  selector: 'app-navigation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    PiProgressComponent,
    PiSkeletonComponent,
    AvatarComponent,
    PiSeparatorComponent,
    PiScrollAreaComponent,
    PiBarChartComponent,
    PiLineChartComponent,
    TabsComponent,
    TabComponent,
    AccordionComponent,
    AccordionItemComponent,
    BreadcrumbComponent,
    BreadcrumbItemComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="06 · навигация и данные"
      title="Навигация &amp; Данные"
      description="Tabs, breadcrumbs, accordion, charts. Tabs underline-индикатор, не pill."
    />

    <!-- ───── Section I. Tabs ───── -->
    <app-pi-section title="Tabs" hint="3 panels · underline indicator" eyebrow="I">
      <app-pi-tabs [(value)]="activeTab" ariaLabel="Разделы">
        <app-pi-tab value="tab-1" label="Обзор" />
        <app-pi-tab value="tab-2" label="Метрики" />
        <app-pi-tab value="tab-3" label="Документы" />
      </app-pi-tabs>
      <div role="tabpanel" class="px-4 py-6 border-b hairline border-rule">
        @switch (activeTab()) {
          @case ('tab-1') {
            <p class="text-sm">Контент обзора — здесь можно описать общую картину раздела.</p>
          }
          @case ('tab-2') {
            <p class="text-sm">Метрики — числовые показатели за выбранный период.</p>
          }
          @case ('tab-3') {
            <p class="text-sm">Документы — список файлов и связанных записей.</p>
          }
        }
      </div>
    </app-pi-section>

    <!-- ───── Section II. Breadcrumb ───── -->
    <app-pi-section title="Breadcrumb" hint="3-level" eyebrow="II">
      <app-pi-breadcrumb ariaLabel="Путь">
        <app-pi-breadcrumb-item href="/overview">Обзор</app-pi-breadcrumb-item>
        <app-pi-breadcrumb-item href="/forms">Формы</app-pi-breadcrumb-item>
        <app-pi-breadcrumb-item [current]="true">Редактирование</app-pi-breadcrumb-item>
      </app-pi-breadcrumb>
    </app-pi-section>

    <!-- ───── Section III. Accordion ───── -->
    <app-pi-section title="Accordion" hint="single-expand" eyebrow="III">
      <app-pi-accordion [multi]="false">
        <app-pi-accordion-item title="Что такое Paper & Ink?" value="item-1">
          <p class="text-sm leading-relaxed">
            Редакторский UI-кит: типографика Syne, палитра paper/ink в OKLCH,
            zero-deps и hairline-эстетика без Material-look.
          </p>
        </app-pi-accordion-item>
        <app-pi-accordion-item title="Как установить?" value="item-2">
          <p class="text-sm leading-relaxed">
            <code class="mono text-[11px]">pnpm add @paper-and-ink/tokens</code> — один пакет,
            ноль зависимостей.
          </p>
        </app-pi-accordion-item>
        <app-pi-accordion-item title="Где взять темы?" value="item-3">
          <p class="text-sm leading-relaxed">
            CSS variables на :root. Тема — это просто набор значений.
          </p>
        </app-pi-accordion-item>
      </app-pi-accordion>
    </app-pi-section>

    <!-- ───── Section IV. Progress + Skeleton + Avatar ───── -->
    <app-pi-section title="Progress · Skeleton · Avatar" hint="состояния загрузки и идентичности" eyebrow="IV">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-4">
          <p class="eyebrow">Progress</p>
          <app-pi-progress [value]="62" variant="linear" />
          <app-pi-progress [value]="42" variant="circular" size="md" />
          <app-pi-progress [value]="0" variant="linear" [indeterminate]="true" />
        </div>
        <div class="space-y-3">
          <p class="eyebrow">Skeleton</p>
          <app-pi-skeleton variant="text" [count]="5" />
          <app-pi-skeleton variant="circle" width="48px" height="48px" />
        </div>
        <div class="space-y-3">
          <p class="eyebrow">Avatar</p>
          <div class="flex items-center gap-3">
            <app-pi-avatar initials="ИИ" size="md" />
            <app-pi-avatar initials="JD" size="md" />
            <app-pi-avatar size="md" alt="Anonymous user" />
          </div>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section V. Charts ───── -->
    <app-pi-section title="Charts" hint="bar · line" eyebrow="V">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p class="eyebrow mb-3">Выручка по регионам (bar)</p>
          <app-pi-bar-chart [results]="barData()" [xAxis]="true" [yAxis]="true" />
        </div>
        <div>
          <p class="eyebrow mb-3">Активные пользователи (line)</p>
          <app-pi-line-chart [results]="lineData()" [legend]="true" />
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section VI. Separator ───── -->
    <app-pi-section title="Separator" hint="plain · with label · vertical" eyebrow="VI">
      <div class="space-y-6">
        <div>
          <p class="text-sm mb-2">Plain</p>
          <app-pi-separator />
        </div>
        <div>
          <p class="text-sm mb-2">With label</p>
          <app-pi-separator label="или" />
        </div>
        <div class="flex items-center">
          <span>One</span>
          <app-pi-separator orientation="vertical" />
          <span>Two</span>
          <app-pi-separator orientation="vertical" />
          <span>Three</span>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section VII. ScrollArea ───── -->
    <app-pi-section title="ScrollArea" hint="themed hairline scrollbar" eyebrow="VII">
      <app-pi-scroll-area maxHeight="200px">
        @for (line of manyLines; track $index) {
          <p class="py-1 text-sm">строка {{ $index + 1 }} — длинный текст для демо прокрутки</p>
        }
      </app-pi-scroll-area>
    </app-pi-section>
  `,
})
export class NavigationPage {
  protected readonly activeTab = signal('tab-1');

  protected readonly barData = signal([
    { name: 'Q1', value: 240 },
    { name: 'Q2', value: 198 },
    { name: 'Q3', value: 312 },
    { name: 'Q4', value: 278 },
  ]);

  protected readonly lineData = signal([
    { name: 'Активные', series: [
      { name: 'Янв', value: 120 },
      { name: 'Фев', value: 145 },
      { name: 'Мар', value: 162 },
      { name: 'Апр', value: 198 },
      { name: 'Май', value: 215 },
      { name: 'Июн', value: 244 },
      { name: 'Июл', value: 268 },
      { name: 'Авг', value: 290 },
      { name: 'Сен', value: 312 },
      { name: 'Окт', value: 334 },
      { name: 'Ноя', value: 358 },
      { name: 'Дек', value: 380 },
    ] },
  ]);

  protected readonly manyLines = Array.from({ length: 30 }, (_, i) => i);
}
