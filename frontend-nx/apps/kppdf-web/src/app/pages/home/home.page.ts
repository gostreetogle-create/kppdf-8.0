import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiGroupWorkspaceComponent } from '@kppdf/features';

/**
 * NX Home is the post-login starting point for the operator's day.
 * The live order queue and shared OrderHubTray arrive in the next TZ; this
 * shell intentionally does not fabricate rows or a second order write path.
 */
@Component({
  selector: 'pi-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, RouterLink],
  template: `
    <app-pi-group-workspace [toc]="[]" tocActiveId="" [chips]="[]" activeId="">
      <main class="py-6" data-test="home-page">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="eyebrow">Рабочий день</div>
            <h1 class="font-display text-2xl m-0">Главная</h1>
            <p class="text-sm text-muted-foreground mt-2 mb-0">
              Очередь заказов и связанные рабочие шаги — в одном месте.
            </p>
          </div>
          <a routerLink="/orders" class="pi-outline-btn pi-focus-ring" data-test="home-orders-link">
            Все заказы
          </a>
        </div>

        <section class="pi-dashed-panel p-8 text-center" data-test="home-queue-placeholder" aria-live="polite">
          <h2 class="font-display text-lg m-0">Очередь подключится следующим шагом</h2>
          <p class="text-sm text-muted-foreground mt-2 mb-0">
            Здесь появится живая очередь заказов после загрузки данных.
          </p>
        </section>
      </main>
    </app-pi-group-workspace>
  `,
})
export class HomePage {}
