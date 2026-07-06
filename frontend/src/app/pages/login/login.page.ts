import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, LogIn } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';

/**
 * TZ-NEW LoginPage — the public entry point of the KPPDF site.
 *
 * Editorial form (Paper & Ink). Username + password, submits via
 * AuthService.login(). On success → / (which the router then
 * resolves to /materials via the AppLayout's default redirect).
 *
 * `publicOnlyGuard` is wired on the route, so already-authed users
 * who hit /login are bounced to / immediately.
 */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LucideAngularModule, ButtonComponent, FormFieldComponent],
  template: `
    <div
      class="min-h-screen bg-paper text-ink font-body flex items-center justify-center px-4 py-12"
    >
      <div
        class="w-full max-w-sm border hairline border-rule rounded-sm p-6 bg-paper"
      >
        <div class="flex items-center gap-2 mb-6">
          <span
            class="block w-[10px] h-[10px] bg-ink shrink-0"
            aria-hidden="true"
          ></span>
          <span class="font-display font-bold tracking-tight">
            KPPDF · Вход
          </span>
        </div>

        <h1 class="font-display text-2xl font-semibold mb-1">
          С возвращением.
        </h1>
        <p class="text-sm text-muted mb-6">
          Введите учётные данные для входа в систему.
        </p>

        <form
          (submit)="onSubmit($event)"
          class="space-y-4"
          autocomplete="on"
          data-test="login-form"
        >
          <app-pi-form-field
            label="Имя пользователя"
            htmlFor="login-username"
            [required]="true"
          >
            <input
              id="login-username"
              type="text"
              name="username"
              autocomplete="username"
              required
              [(ngModel)]="username"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!error()"
              [class.border-destructive]="!!error()"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Пароль"
            htmlFor="login-password"
            [required]="true"
          >
            <input
              id="login-password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
              class="w-full border hairline rounded-sm px-3 py-2 bg-paper text-sm font-body focus:outline-none transition-colors"
              [class.border-rule]="!error()"
              [class.border-destructive]="!!error()"
            />
          </app-pi-form-field>

          @if (error()) {
            <p role="alert" class="text-xs text-destructive">
              {{ error() }}
            </p>
          }

          <app-pi-button
            type="submit"
            variant="default"
            [disabled]="submitting()"
            class="w-full"
          >
            <lucide-angular [img]="logInIcon" [size]="13" aria-hidden="true" />
            {{ submitting() ? 'Входим…' : 'Войти' }}
          </app-pi-button>
        </form>

        <p class="eyebrow text-[10px] text-muted mt-6 text-center">
          kppdf-8.0 · 2026
        </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly logInIcon = LogIn;

  // Two-way-bound to <input> via ngModel — keep as plain string
  // properties (not signals) for ergonomic [(ngModel)] two-way binding.
  protected username = '';
  protected password = '';

  protected readonly submitting = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting()) return;
    const u = this.username.trim();
    const p = this.password;
    if (!u || !p) {
      this.error.set('Введите имя пользователя и пароль.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.login(u, p);
      await this.router.navigateByUrl('/');
    } catch (err) {
      const e = err as { error?: { message?: string }; message?: string };
      this.error.set(
        e?.error?.message ?? e?.message ?? 'Не удалось войти.',
      );
      this.submitting.set(false);
    }
  }
}
