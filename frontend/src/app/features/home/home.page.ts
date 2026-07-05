import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/auth.service';

/**
 * Заглушка «Главной» — Indexed routes тут не будет, после login ты будешь
 * попадать сюда и смотреть на список доступных разделов (как только мы
 * подключим реестр страниц).
 *
 * Сейчас показывает приветствие + имя/роль + кнопку выхода.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="home-shell">
      <mat-card appearance="outlined" class="home-card">
        <mat-card-header>
          <mat-card-title>
            @if (auth.user(); as user) {
              Добро пожаловать, {{ user.displayName }}.
            } @else {
              Добро пожаловать.
            }
          </mat-card-title>
          <mat-card-subtitle>
            @if (auth.user(); as user) {
              {{ user.username }} · {{ user.role }}
            } @else {
              сессия ещё не подтверждена
            }
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p>
            Это заглушка главной страницы. Дальше будем добавлять разделы
            по одному — Контрагенты, Организации, Каталог продуктов и т.д.
            Сообщи, какой добавить первым.
          </p>
          <p class="hint">
            Текущая сессия хранится в <code>localStorage</code> под ключами
            <code>kppdf.access</code> и <code>kppdf.refresh</code>.
          </p>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-stroked-button type="button" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Выйти
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    :host { display: block; }

    .home-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: var(--mat-sys-surface-container-low);
    }

    .home-card {
      width: 100%;
      max-width: 560px;
    }

    p {
      line-height: 1.55;
      margin: 0 0 12px;
    }

    .hint {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
    }

    code {
      background: var(--mat-sys-surface-container);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  `,
})
export class HomePage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
