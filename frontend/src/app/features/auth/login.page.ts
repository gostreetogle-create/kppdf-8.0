import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { z } from 'zod';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth.service';

/**
 * Backend contract for /auth/login — mirrors LoginDto on the server.
 * Used as a defence-in-depth validation: Angular form-validators give
 * instant UX feedback, zod guarantees the payload matches what the
 * server expects before we send.
 */
const loginSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(64),
  password: z.string().min(1, 'Введите пароль').max(128),
});

type LoginValues = z.infer<typeof loginSchema>;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-shell">
      <mat-card appearance="outlined" class="login-card">
        <mat-card-header>
          <mat-card-title>KPPDF</mat-card-title>
          <mat-card-subtitle>Вход в систему</mat-card-subtitle>
        </mat-card-header>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>Имя пользователя</mat-label>
            <input
              matInput
              type="text"
              autocomplete="username"
              formControlName="username"
              required
            />
            @if (form.controls.username.touched && form.controls.username.hasError('required')) {
              <mat-error>Введите имя пользователя</mat-error>
            }
            @if (form.controls.username.touched && form.controls.username.hasError('minlength')) {
              <mat-error>Минимум 3 символа</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Пароль</mat-label>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              autocomplete="current-password"
              formControlName="password"
              required
            />
            <button
              matSuffix
              type="button"
              mat-icon-button
              tabindex="-1"
              [attr.aria-label]="showPassword() ? 'Скрыть пароль' : 'Показать пароль'"
              (click)="showPassword.set(!showPassword())"
            >
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.controls.password.touched && form.controls.password.hasError('required')) {
              <mat-error>Введите пароль</mat-error>
            }
          </mat-form-field>

          @if (errorMsg(); as msg) {
            <div class="login-error" role="alert">{{ msg }}</div>
          }

          <button
            mat-flat-button
            type="submit"
            color="primary"
            [disabled]="loading()"
            class="login-submit"
          >
            @if (loading()) {
              <mat-spinner diameter="18"></mat-spinner>
              <span>Входим…</span>
            } @else {
              <span>Войти</span>
            }
          </button>

          <div class="hint">
            Используйте учётные данные, выданные администратором. По
            умолчанию создаётся пользователь <code>admin</code>.
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: `
    :host { display: block; }

    .login-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: var(--mat-sys-surface-container-low);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px 16px 24px;
    }

    .login-error {
      background: color-mix(in srgb, var(--mat-sys-error) 8%, transparent);
      color: var(--mat-sys-error);
      border-radius: 6px;
      font-size: 14px;
      padding: 10px 12px;
      line-height: 1.4;
    }

    .login-submit {
      height: 44px;
      font-size: 15px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .hint {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
    }

    code {
      background: var(--mat-sys-surface-container);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required]],
  });

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMsg = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const parsed = loginSchema.safeParse(this.form.getRawValue());
    if (!parsed.success) {
      // Form-validators already surfaced control-level errors; if zod
      // still complains, surface the first issue for cross-field context.
      this.errorMsg.set(parsed.error.issues[0]?.message ?? 'Некорректные данные');
      return;
    }

    const values: LoginValues = parsed.data;
    this.loading.set(true);
    this.errorMsg.set(null);

    try {
      await this.auth.login(values.username, values.password);
      await this.router.navigateByUrl('/home');
    } catch {
      // /auth/login returns 401 Unauthorized on bad credentials.
      this.errorMsg.set('Неверное имя пользователя или пароль');
    } finally {
      this.loading.set(false);
    }
  }
}
