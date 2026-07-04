import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PAGES, PageConfig } from '../configs/pages.config';
import { CrudPageComponent } from '../shared/components/crud-page/crud-page.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-page-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudPageComponent],
  template: `
    @if (config(); as cfg) {
      <app-crud-page [config]="cfg" />
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
    if (!this.auth.hasRole(page.roles)) return null;
    return page;
  });
}
