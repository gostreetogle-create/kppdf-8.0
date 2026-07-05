import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiDemoComponent } from '../../shared/page/pi-demo.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { PiToastService } from '../../shared/ui/toast';
import { LucideAngularModule, ArrowUpRight, CircleDot } from 'lucide-angular';

/**
 * Overview page (/) — TZ-69.
 *
 * Russian editorial landing: hero + быстрый старт + 5 section-cards +
 * 3 Roman-numerated принципа. Также hosts Sonner-style Toast test
 * panel (TZ-56 smoke test target).
 */
@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiDemoComponent,
    ButtonComponent,
    BadgeComponent,
    LucideAngularModule,
  ],
  template: `
    <app-pi-page-header
      eyebrow="01 · обзор"
      title="Paper &amp; Ink"
      subtitle="Редакторский UI-кит для Angular 20"
      description="Типографика Syne и Plus Jakarta Sans. Палитра paper и ink в OKLCH. Полный набор компонентов без зависимости на Material."
      version="v0.1"
    />

    <!-- ───── Section I. Быстрый старт ───── -->
    <app-pi-section title="Быстрый старт" hint="0.1s · getting started" eyebrow="I">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-pi-demo title="Установка" description="Один пакет, нулевые зависимости">
          <div preview>
            <app-pi-button variant="default" size="md" (click)="copyInstall()">
              pnpm add @paper-and-ink/tokens
            </app-pi-button>
          </div>
        </app-pi-demo>
        <app-pi-demo title="Документация" description="Полный API reference">
          <div preview>
            <app-pi-button variant="outline" size="md" [routerLink]="['/foundations']">
              <lucide-angular [img]="arrowUpRightIcon" size="14" />
              Открыть
            </app-pi-button>
          </div>
        </app-pi-demo>
        <app-pi-demo title="Playground" description="Живые пропсы и темы">
          <div preview>
            <app-pi-button variant="ghost" size="md" [routerLink]="['/basics']">
              <lucide-angular [img]="arrowUpRightIcon" size="14" />
              Запустить
            </app-pi-button>
          </div>
        </app-pi-demo>
      </div>
    </app-pi-section>

    <!-- ───── Section II. Что внутри ───── -->
    <app-pi-section title="Что внутри" hint="5 разделов" eyebrow="II">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (card of sectionCards; track card.href) {
          <a
            [routerLink]="[card.href]"
            class="group block p-5 border hairline border-rule rounded-sm transition-colors hover:border-ink"
          >
            <div class="flex items-start justify-between">
              <span class="eyebrow text-[10px]">{{ card.eyebrow }}</span>
              <lucide-angular
                [img]="arrowUpRightIcon"
                size="14"
                class="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
              />
            </div>
            <h3 class="font-display text-lg font-semibold mt-2">{{ card.title }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ card.description }}</p>
            <div class="flex flex-wrap gap-1.5 mt-3">
              @for (tag of card.tags; track tag) {
                <app-pi-badge variant="outline" size="sm">{{ tag }}</app-pi-badge>
              }
            </div>
          </a>
        }
      </div>
    </app-pi-section>

    <!-- ───── Section III. Принципы ───── -->
    <app-pi-section title="Принципы" hint="3 манифеста" eyebrow="III">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        @for (p of principles; track p.index) {
          <article>
            <p class="font-display text-4xl font-light text-accent-warm">{{ p.index }}</p>
            <h3 class="font-display text-base font-semibold mt-3">{{ p.title }}</h3>
            <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
              {{ p.body }}
            </p>
          </article>
        }
      </div>
    </app-pi-section>

    <!-- ───── Sonner-style Toast test panel (TZ-56 smoke test target) ───── -->
    <app-pi-section title="Toast (Sonner-style)" hint="smoke test panel" eyebrow="IV">
      <p class="text-sm text-muted-foreground mb-4">
        Нажмите любую кнопку чтобы отправить toast в очередь. Press
        <kbd class="font-mono text-xs px-1 border hairline border-rule rounded-sm">Esc</kbd>
        чтобы закрыть все.
      </p>

      <div class="flex gap-3 flex-wrap" data-test="toast-buttons">
        <button
          type="button"
          data-toast-trigger="default"
          class="hairline-b border border-rule px-4 py-2 text-sm hover:bg-paper-2 transition-colors"
          (click)="triggerDefault()"
        >Show default</button>
        <button
          type="button"
          data-toast-trigger="success"
          class="hairline-b border border-ink px-4 py-2 text-sm hover:bg-paper-2 transition-colors"
          (click)="triggerSuccess()"
        >Show success</button>
        <button
          type="button"
          data-toast-trigger="error"
          class="hairline-b border border-destructive px-4 py-2 text-sm hover:bg-paper-2 transition-colors"
          (click)="triggerError()"
        >Show error</button>
        <button
          type="button"
          data-toast-trigger="warning"
          class="hairline-b border border-destructive px-4 py-2 text-sm hover:bg-paper-2 transition-colors"
          (click)="triggerWarning()"
        >Show warning</button>
      </div>

      <button
        type="button"
        class="mt-6 text-xs text-muted-foreground hover:text-ink"
        data-test="clear-queue"
        (click)="toast.dismiss()"
      >Dismiss все (или нажмите Esc)</button>
    </app-pi-section>
  `,
})
export class OverviewPage {
  protected readonly toast = inject(PiToastService);
  protected readonly arrowUpRightIcon = ArrowUpRight;
  protected readonly circleDotIcon = CircleDot;

  protected readonly sectionCards = [
    {
      eyebrow: '02',
      title: 'Основы',
      description: 'Палитра paper, ink и акценты. Типографика Syne и Jakarta.',
      tags: ['токены', 'типографика', 'сетка'],
      href: '/foundations',
    },
    {
      eyebrow: '03',
      title: 'Кнопки и инпуты',
      description: 'Базовые примитивы: 6 вариантов × 4 размера для кнопок.',
      tags: ['button', 'input', 'badge', 'card'],
      href: '/basics',
    },
    {
      eyebrow: '04',
      title: 'Формы и таблицы',
      description: 'Реактивные формы с валидацией и sortable paginated таблицы.',
      tags: ['form', 'table', 'pagination'],
      href: '/forms',
    },
    {
      eyebrow: '05',
      title: 'Оверлеи',
      description: 'Dialog, Sheet, Tooltip, Popover, DropdownMenu, Toast.',
      tags: ['dialog', 'sheet', 'menu', 'toast'],
      href: '/overlays',
    },
    {
      eyebrow: '06',
      title: 'Навигация и данные',
      description: 'Tabs, breadcrumbs, accordion, charts. Tabs underline, не pill.',
      tags: ['tabs', 'breadcrumb', 'charts'],
      href: '/navigation',
    },
  ];

  protected readonly principles = [
    {
      index: 'I',
      title: 'Токены не хардкод',
      body:
        'Один источник истины — CSS variables на :root. Никаких hex в шаблонах. Тема редактируется в одном месте.',
    },
    {
      index: 'II',
      title: 'Плоская иерархия',
      body:
        'Никаких вложенных card-в-card. Одна структурная единица = одна единица чтения. Глаз скользит, не теряется.',
    },
    {
      index: 'III',
      title: 'Гарнитура важнее декора',
      body:
        'Syne display, Jakarta body, mono для metadata. Никаких emoji-иконок. Только шрифт, hairlines и воздух.',
    },
  ];

  copyInstall(): void {
    this.toast.show('Команда скопирована', { duration: 3000 });
  }

  triggerDefault(): void {
    this.toast.show('Default toast', { duration: 0 });
  }

  triggerSuccess(): void {
    this.toast.success('Test welcome', { duration: 0 });
  }

  triggerError(): void {
    this.toast.error('Something went wrong', { duration: 0 });
  }

  triggerWarning(): void {
    this.toast.warning('Be careful', { duration: 0 });
  }
}
