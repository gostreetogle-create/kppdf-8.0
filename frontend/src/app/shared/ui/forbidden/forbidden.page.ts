import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

/**
 * TZ-256 §ШАГ 4 — Single forbidden state.
 *
 * Reached from two paths:
 *   1. Direct URL hit on a capability-gated route without the
 *      required permission → `capabilityRouteGuard` redirects here
 *      via `router.parseUrl('/forbidden')`.
 *   2. Backend `403 Forbidden` returned on a sensitive endpoint
 *      → `auth.interceptor` redirects here (TZ-256 §ШАГ 5).
 *
 * NOT a 404 page — by design, returning 404 would leak existence
 * («this URL exists but you can't see it»). The /forbidden page
 * is intentionally generic and role-aware:
 *
 *   - When `AuthService.user() === null` (post-logout state) the
 *     copy shifts to «войдите в систему» (auth-style messaging).
 *     This avoids an attacker learning that a path existed by
 *     its rebadged UX.
 *   - When authenticated but lacking capability, the copy is
 *     «недостаточно прав» with a path back to `/` (the user's
 *     last operational landing).
 *
 * Single page by TZ-256 §0 — DO NOT spawn per-route 403 states.
 */
@Component({
  selector: 'pi-forbidden-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-4 px-6 py-12"
      data-testid="forbidden-page"
    >
      <p class="text-xs uppercase tracking-widest text-[var(--pi-text-muted)]">
        403 {{ copy().eyebrow }}
      </p>
      <h1 class="text-3xl font-medium tracking-tight">{{ copy().title }}</h1>
      <p class="max-w-prose text-[var(--pi-text-muted)]">
        {{ copy().body }}
      </p>
      <div class="flex gap-3 pt-2">
        <a
          [routerLink]="['/']"
          class="inline-flex items-center rounded-sm border border-[var(--pi-border)] bg-[var(--pi-surface)] px-3 py-2 text-sm font-medium hover:bg-[var(--pi-surface-hover)]"
        >
          {{ copy().ctaLabel }}
        </a>
      </div>
    </section>
  `,
})
export class ForbiddenPage {
  private readonly auth = inject(AuthService);

  /**
   * Profile-aware copy. Pure computation — no HTTP, no signal
   * subscriptions beyond the AuthService.user() signal read.
   */
  copy(): {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
  } {
    const user = this.auth.user();
    if (!user) {
      return {
        eyebrow: 'требуется вход',
        title: 'Войдите в систему',
        body: 'Этот раздел доступен только авторизованным пользователям. Войдите в систему и повторите попытку.',
        ctaLabel: 'К странице входа',
      };
    }
    return {
      eyebrow: 'доступ ограничен',
      title: 'Недостаточно прав',
      body: 'У вашей роли нет прав для просмотра этого раздела. Если вам кажется, что это ошибка — обратитесь к администратору.',
      ctaLabel: 'На главную',
    };
  }
}
