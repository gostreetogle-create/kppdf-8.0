import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';

/**
 * TZ-256.A remainder — `/admin` placeholder route component.
 *
 * Static "in development" stub for the `/admin` path. Without this, direct
 * navigation to `/admin` (deep links from docs, browser bookmarks, stale
 * nav items) would fall through to the catch-all `** → ''` redirect and
 * land on the user-default `/materials` page with no signal of intent.
 * This page gives the user a clear "we know about /admin, it's coming"
 * surface until TZ-256.B ships the real implementation.
 *
 * Pattern copy from users-admin.page.ts (TZ-257 §ШАГ 2):
 * standalone, OnPush, single dependency (PiPageHeaderComponent).
 *
 * Underscore `_` prefix in filename marks the component as a private
 * route-handler (not an auto-discovered lazy route); wiring is explicit
 * from `app.routes.ts`.
 *
 * No data fetch, no inject, no subscriptions — pure static render.
 */
@Component({
  selector: 'pi-admin-placeholder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Раздел в разработке"
      subtitle="Функциональность появится в ближайших обновлениях"
      data-testid="admin-placeholder-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <p class="text-sm text-muted-foreground">
        Подразделы «Пользователи» и «Роли» уже доступны через навигацию —
        промежуточные операции (создание, изменение, назначение ролей) появятся
        в ближайших релизах.
      </p>
    </section>
  `,
})
export class AdminPlaceholderPage {}
