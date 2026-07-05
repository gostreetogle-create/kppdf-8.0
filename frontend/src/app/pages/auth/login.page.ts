import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div class="w-full max-w-sm card p-6 space-y-4">
        <div class="text-center space-y-1">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground text-xl font-bold mb-2"
          >
            К
          </div>
          <h1 class="text-2xl font-bold tracking-tight">KPPDF ERP</h1>
          <p class="text-sm text-muted-foreground">Войдите в аккаунт чтобы продолжить</p>
        </div>

        <form class="space-y-3" (ngSubmit)="onSubmit()">
          <div class="space-y-1">
            <label class="label" for="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              type="text"
              class="input"
              placeholder="Из .env: ADMIN_USERNAME"
              [(ngModel)]="username"
              required
              autocomplete="username"
            />
          </div>
          <div class="space-y-1">
            <label class="label" for="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              class="input"
              placeholder="Из .env: ADMIN_PASSWORD"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
            />
          </div>

        @if (errorMessage()) {
          <p class="text-sm text-destructive">{{ errorMessage() }}</p>
        }

        <button type="submit" class="btn-primary w-full" [disabled]="loading()">
          @if (loading()) { Вход... } @else { Войти }
        </button>
      </form>

      <p class="text-xs text-center text-muted-foreground">
        Креды берутся из <code class="bg-muted px-1 py-0.5 rounded">.env</code> →
        <code class="bg-muted px-1 py-0.5 rounded">ADMIN_USERNAME</code> /
        <code class="bg-muted px-1 py-0.5 rounded">ADMIN_PASSWORD</code>.
        На production смените пароль сразу после первого входа.
      </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  username = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.toast.success('Добро пожаловать!');
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Неверное имя пользователя или пароль');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
