import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PAGES, PageConfig } from '../configs/pages.config';
import { isPageEnabled } from '../configs/gates.config';
import { CrudPageComponent } from '../shared/components/crud-page/crud-page.component';
import { AuthService } from '../core/services/auth.service';
import { ShowcasePage } from './showcase/showcase.page';

@Component({
  selector: 'app-page-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudPageComponent, NgComponentOutlet],
  template: `
    @if (customComponent(); as c) {
      <ng-container [ngComponentOutlet]="c" />
    } @else if (config(); as cfg) {
      <app-crud-page [config]="cfg" />
    } @else if (pageExists()) {
      <div class="card p-8 text-center">
        <h2 class="text-xl font-bold">Страница пока не активна</h2>
        <p class="text-sm text-muted-foreground mt-2">
          Эта таблица отключена в текущей конфигурации.
          Включите её в <code class="bg-muted px-1 py-0.5 rounded">frontend/src/app/configs/gates.config.ts</code>.
        </p>
      </div>
    } @else {
      <div class="card p-8 text-center">
        <h2 class="text-xl font-bold">Страница не найдена</h2>
        <p class="text-sm text-muted-foreground mt-2">
          Возможно, у вашей роли нет доступа или страница не существует.
        </p>
      </div>
    }
  `,
})
export class PageRenderer {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly config = computed<PageConfig | null>(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const page = PAGES.find((p) => p.id === id);
    if (!page) return null;
    if (!isPageEnabled(id)) return null;
    if (!this.auth.hasRole(page.roles)) return null;
    return page;
  });

  readonly pageExists = computed<boolean>(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return PAGES.some((p) => p.id === id);
  });

  /**
   * Some page ids map to custom components (not CrudPage).
   * Currently: 'showcase' → ShowcasePage (TZ-35).
   */
  readonly customComponent = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id === 'showcase') return ShowcasePage;
    return null;
  });
}
