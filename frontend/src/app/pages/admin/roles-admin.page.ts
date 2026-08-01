import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';

/**
 * TZ-257 §ШАГ 2 — `roles-admin.page`.
 *
 * Read-only slice of `GET /api/admin/roles`. System roles are
 * flagged `isSystem: true` and rendered as read-only — mutations of
 * system roles are intentionally TZ-257.A territory per spec
 * TZ-257 §ШАГ 0 («System roles `isSystem: true` — read-only after
 * creation»).
 */
interface ClientRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'pi-roles-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent],
  template: `
    <app-pi-page-header
      eyebrow="администрирование"
      title="Роли"
      subtitle="Управление ролями и их набором прав"
      data-testid="roles-admin-header"
    />

    <section class="pi-page-frame pi-edge-bleed py-page-y">
      <p class="text-sm text-muted-foreground mb-4">
        Read-only slice backend support shipped in TZ-257. System roles
        <code>isSystem: true</code> flag read-only after creation. Mutation endpoints (create /
        patch / delete) tracked as TZ-257.A.
      </p>

      @if (loading()) {
        <p class="text-sm text-muted-foreground">Загрузка…</p>
      } @else if (error(); as err) {
        <p class="text-sm text-red-600" data-testid="roles-admin-error">
          {{ err }}
        </p>
      } @else {
        <table class="pi-table w-full" data-testid="roles-admin-table">
          <thead>
            <tr>
              <th class="text-left pi-table-th">Имя</th>
              <th class="text-left pi-table-th">Описание</th>
              <th class="text-left pi-table-th">Permissions</th>
              <th class="text-left pi-table-th">Тип</th>
            </tr>
          </thead>
          <tbody>
            @for (r of roles(); track r.id) {
              <tr class="pi-table-tr">
                <td class="pi-table-td font-mono text-xs">{{ r.name }}</td>
                <td class="pi-table-td text-muted-foreground">
                  {{ r.description ?? '—' }}
                </td>
                <td class="pi-table-td">
                  @if (r.permissions.length === 0) {
                    <span class="font-mono text-xs pi-badge pi-badge-neutral">—</span>
                  } @else {
                    @for (p of r.permissions; track p) {
                      <span class="font-mono text-xs pi-badge pi-badge-neutral mr-1">{{ p }}</span>
                    }
                  }
                </td>
                <td class="pi-table-td">
                  @if (r.isSystem) {
                    <span class="pi-badge pi-badge-warning">system</span>
                  } @else {
                    <span class="pi-badge pi-badge-success">custom</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="pi-table-td text-center text-muted-foreground py-8">
                  Роли не найдены.
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class RolesAdminPage {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly roles = signal<ClientRole[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<ClientRole[]>(`${this.baseUrl}/admin/roles`));
      this.roles.set(data);
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
