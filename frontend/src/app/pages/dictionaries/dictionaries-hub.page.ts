import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiDictionaryShellComponent } from '../../shared/page/pi-dictionary-shell.component';

interface HubCard {
  route: string;
  label: string;
  description: string;
}

const HUB_CARDS: HubCard[] = [
  {
    route: '/categories',
    label: 'Категории',
    description: 'Дерево категорий материалов, drag-and-drop сортировка',
  },
  {
    route: '/dictionaries/units',
    label: 'Единицы измерения',
    description: 'Словарь единиц (м, кг, шт, м²…) — добавление, деактивация',
  },
  {
    route: '/dictionaries/color-references',
    label: 'Цвета (RAL)',
    description: 'Справочник цветов RAL для продукции',
  },
  {
    route: '/doc-template-categories',
    label: 'Категории шаблонов',
    description: 'Категории для конструктора документов',
  },
  {
    route: '/dictionaries/text-block-categories',
    label: 'Категории текстов',
    description: 'Категории текстовых блоков конструктора',
  },
];

/**
 * TZ-DICT-303 — dictionaries hub page («Справочники» / Обзор).
 *
 * Renders a card grid of links to all dictionary sections. Replaces the old
 * `DictionariesPage` that showed Units table on `/dictionaries`.
 *
 * Uses PiDictionaryShell for compact title chrome.
 */
@Component({
  selector: 'app-dictionaries-hub-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PiDictionaryShellComponent],
  template: `
    <app-pi-dictionary-shell [title]="'Справочники'">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (card of cards; track card.route) {
          <a
            [routerLink]="card.route"
            class="block hairline rounded-sm p-4
                   hover:bg-paper-2 transition-colors
                   pi-focus-ring cursor-pointer"
          >
            <h2 class="font-display font-semibold text-base tracking-tight mb-1">
              {{ card.label }}
            </h2>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {{ card.description }}
            </p>
          </a>
        }
      </div>
    </app-pi-dictionary-shell>
  `,
})
export class DictionariesHubPage {
  protected readonly cards = HUB_CARDS;
}
