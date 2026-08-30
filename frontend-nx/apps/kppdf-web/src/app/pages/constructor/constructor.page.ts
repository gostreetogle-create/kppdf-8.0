import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { CardComponent } from '@kppdf/ui/card';
import { CONSTRUCTOR_CREATE_KINDS } from './constructor.types';

/**
 * TZ-NX-CONSTRUCTOR-SHELL — compact Constructor workspace: kind chooser only.
 * Composition editing and domain API are out of scope for this wave.
 */
@Component({
  selector: 'pi-constructor-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PiPageChromeComponent, CardComponent],
  template: `
    <section
      class="max-w-3xl mx-auto"
      aria-labelledby="constructor-workspace-heading"
      data-test="constructor-workspace"
    >
      <app-pi-page-chrome [crumbs]="[{ label: 'Конструктор' }]" />

      <div class="mb-4 hairline rounded-sm px-4 py-3 text-sm bg-paper-2/40" data-test="constructor-domain-note">
        <p class="m-0 text-ink leading-relaxed">
          Конструктор — рабочее место для паспортов и состава каталога. Реестры
          показывают сохранённые записи; здесь создаются и редактируются сущности.
        </p>
        <p class="m-0 mt-2 text-muted-foreground leading-relaxed">
          <strong class="text-ink font-medium">Деталь</strong> — это Material с видом
          <code class="font-mono text-[11px]">part</code>, не отдельная коллекция.
          <strong class="text-ink font-medium">Комплекс</strong> не создаётся отдельно —
          он появится из состава Product, когда в BOM есть product-строка.
        </p>
      </div>

      <h2
        id="constructor-workspace-heading"
        class="sr-only"
      >
        Выбор типа создаваемой сущности
      </h2>

      <div
        class="grid gap-3 sm:grid-cols-2"
        role="list"
        aria-label="Доступные действия создания"
        data-test="constructor-cta-grid"
      >
        @for (entry of createKinds; track entry.kind) {
          <a
            [routerLink]="['/constructor/create', entry.kind]"
            class="block no-underline pi-focus-ring rounded-sm"
            role="listitem"
            [attr.aria-label]="entry.label"
            [attr.data-test]="entry.testId"
          >
            <app-pi-card
              [title]="entry.label"
              [description]="entry.description"
              [interactive]="true"
              [arrow]="false"
            />
          </a>
        }
      </div>
    </section>
  `,
})
export class ConstructorPage {
  protected readonly createKinds = CONSTRUCTOR_CREATE_KINDS;
}
