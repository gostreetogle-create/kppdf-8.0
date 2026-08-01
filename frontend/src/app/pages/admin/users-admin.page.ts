import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';

/**
 * TZ-257 §ШАГ 2 — `users-admin.page`.
 *
 * Minimal-viable admin page surfacing the read-only slice of
 * `GET /api/admin/users`. Mutations (create/patch/deactivate/...) are
 * tracked as TZ-257.A follow-up; this page is intentionally a skeleton
 * that demonstrates the routing + capability-gate wiring without
 * introducing RBAC-bypass risks.
 *
 * Read-side calls go through `HttpClient` directly (no AuthService
 * mutation) — the auth interceptor auto-attaches the bearer token,
 * and a 403 from the backend will be transparently redirected to
 * `/forbidden` (TZ-256 §ШАГ 5).
 */
interface ClientUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'pi-users-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Пользователи"
      subtitle="Управление учётными записями системы"
      data-testid="users-admin-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <p class="text-sm text-muted-foreground mb-4">
        Read-only slice backend support shipped in TZ-257. Mutations (create / patch / activate /
        deactivate / change-password) tracked as TZ-257.A follow-up.
      </p>

      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка…</p>
      } @else if (error(); as err) {
        <p class="text-sm text-red-600" data-testid="users-admin-error">
          {{ err }}
        </p>
      } @else {
        <table class="pi-table w-full" data-testid="users-admin-table">
          <thead>
            <tr>
              <th class="text-left pi-table-th">Логин</th>
              <th class="text-left pi-table-th">ФИО</th>
              <th class="text-left pi-table-th">Email</th>
              <th class="text-left pi-table-th">Роль</th>
              <th class="text-left pi-table-th">Активен</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr class="pi-table-tr">
                <td class="pi-table-td font-mono text-xs">{{ u.username }}</td>
                <td class="pi-table-td">{{ u.displayName }}</td>
                <td class="pi-table-td text-muted-foreground">{{ u.email }}</td>
                <td class="pi-table-td">
                  <span class="font-mono text-xs pi-badge pi-badge-neutral">{{ u.role }}</span>
                </td>
                <td class="pi-table-td">
                  @if (u.isActive) {
                    <span class="pi-badge pi-badge-success">да</span>
                  } @else {
                    <span class="pi-badge pi-badge-warning">нет</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="pi-table-td text-center text-muted-foreground py-8">
                  Пользователи не найдены.
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class UsersAdminPage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly users = signal<ClientUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<ClientUser[]>(`${this.baseUrl}/admin/users?limit=200`),
      );
      this.users.set(data);
    } catch (err) {
      this.error.set(this.describe(err));
    } finally {
      this.loading.set(false);
    }
  }

  private describe(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}
