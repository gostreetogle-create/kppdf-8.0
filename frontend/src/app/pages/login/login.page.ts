import { ChangeDetectionStrategy, Component, inject, isDevMode, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, LogIn, Eye, EyeOff, KeyRound } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';

/**
 * Полная документация страницы: docs/pages/login.page.md
 *
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
  imports: [LucideAngularModule, ButtonComponent, FormFieldComponent, InputComponent],
  template: `
    <div
      class="min-h-screen bg-paper text-ink font-body flex items-center justify-center px-page-x"
    >
      <main
        class="w-full max-w-sm border hairline border-sunrise-warm rounded-sm px-10 py-12 bg-paper box-border overflow-hidden"
      >
        <div class="flex items-center gap-2 mb-10">
          <span class="block w-[10px] h-[10px] bg-ink shrink-0" aria-hidden="true"></span>
          <span class="font-display font-bold tracking-tight"> KPPDF · Вход </span>
        </div>

        <h1 class="font-display text-2xl font-semibold mb-3">С возвращением.</h1>
        <p class="text-sm text-muted-foreground mb-8">
          Введите учётные данные для входа в систему.
        </p>

        <form
          (submit)="onSubmit($event)"
          class="space-y-section"
          autocomplete="on"
          data-test="login-form"
        >
          <app-pi-form-field label="Имя пользователя" htmlFor="login-username" [required]="true">
            <app-pi-input
              id="login-username"
              type="text"
              autocomplete="username"
              [(value)]="username"
              [invalid]="!!error()"
              placeholder="Имя пользователя"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Пароль" htmlFor="login-password" [required]="true">
            <div class="relative">
              <app-pi-input
                id="login-password"
                [type]="passwordVisible() ? 'text' : 'password'"
                autocomplete="current-password"
                [(value)]="password"
                [invalid]="!!error()"
                placeholder="Пароль"
                class="pr-9"
              />
              <button
                type="button"
                (click)="passwordVisible.set(!passwordVisible())"
                [attr.aria-label]="passwordVisible() ? 'Скрыть пароль' : 'Показать пароль'"
                [attr.aria-pressed]="passwordVisible()"
                class="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-7 h-7 rounded-sm text-muted-foreground hover:text-ink hover:bg-paper-2 transition-colors pi-focus-ring"
              >
                <lucide-angular
                  [img]="passwordVisible() ? eyeOffIcon : eyeIcon"
                  [size]="14"
                  aria-hidden="true"
                />
              </button>
            </div>
          </app-pi-form-field>

          @if (error()) {
            <p role="alert" class="text-xs text-destructive">
              {{ error() }}
            </p>
          }

          <app-pi-button type="submit" variant="default" [disabled]="submitting()" class="w-full">
            <lucide-angular [img]="logInIcon" [size]="13" aria-hidden="true" />
            {{ submitting() ? 'Входим…' : 'Войти' }}
          </app-pi-button>

          @if (isDev) {
            <button
              type="button"
              (click)="fillDemoCredentials()"
              data-test="fill-demo-button"
              [attr.aria-label]="'Заполнить демо-данные для входа'"
              title="Заполнит поля: admin / AdminPass123"
              class="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-ink py-1 transition-colors pi-focus-ring"
            >
              <lucide-angular [img]="keyIcon" [size]="12" aria-hidden="true" />
              <span>Заполнить демо-данные</span>
            </button>
          }
        </form>

        <p class="eyebrow text-[10px] text-muted-foreground mt-10 text-center">kppdf-8.0 · 2026</p>
      </main>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly logInIcon = LogIn;
  protected readonly eyeIcon = Eye;
  protected readonly eyeOffIcon = EyeOff;
  protected readonly keyIcon = KeyRound;

  /**
   * Dev-only flag (Angular's `isDevMode()`): the autofill button is only
   * visible when this is true, and Angular's tree-shaker strips the
   * `@if (isDev) { ... }` branch from production bundles.
   */
  protected readonly isDev = isDevMode();

  /**
   * Dev helper: fills the form with the seeded admin credentials so a
   * developer never has to retype them (root cause of repeated 401s).
   *
   * Credentials must match the backend seed in
   * `backend/scripts/.../seed.ts` and the `reset-password.js` helper.
   * If the seed is changed, update both places.
   */
  protected fillDemoCredentials(): void {
    this.username = 'admin';
    this.password = 'AdminPass123';
  }

  /**
   * Show/hide password in the field (TZ-NEW visual-feedback).
   * Defaults to `false` — type="password" is the safer default.
   * Toggle is intentionally trivial: not persisted across reloads
   * (password managers don't read the field while it's plain text
   * either, but UX-wise keep it ephemeral — sessions are short).
   */
  protected readonly passwordVisible = signal(false);

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
      this.error.set(e?.error?.message ?? e?.message ?? 'Не удалось войти.');
      this.submitting.set(false);
    }
  }
}
