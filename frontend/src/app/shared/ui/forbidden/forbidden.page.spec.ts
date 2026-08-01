import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ForbiddenPage } from './forbidden.page';

/**
 * TZ-256 §ШАГ 7 — Forbidden page spec.
 *
 * Pure shape + signal-driven role-awareness. We mock the AuthService
 * minimally and verify the two copy profiles (unauthenticated vs
 * authenticated-but-lacking-capability). No HTTP, no router outcalls.
 */
describe('ForbiddenPage (TZ-256 §ШАГ 4)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForbiddenPage],
      providers: [
        provideRouter([]),
        // TZ-CLEANUP 2026-08-01: ForbiddenPage reads AuthService.user() in its
        // copy() signal. AuthService.createEffect lazily injects HttpClient,
        // so add provideHttpClient to satisfy the transitive DI dependency
        // (otherwise TestBed.createComponent triggers NG0201 at first signal read).
        provideHttpClient(),
        AuthService,
      ],
    });
  });

  it('renders unauthenticated copy when AuthService.user() is null', () => {
    const fixture = TestBed.createComponent(ForbiddenPage);
    TestBed.inject(AuthService).user.set(null);
    fixture.detectChanges();

    const tree = fixture.componentInstance.copy();

    expect(tree.eyebrow).toBe('требуется вход');
    expect(tree.title).toBe('Войдите в систему');
    expect(tree.body).toMatch(/авторизованным/i);
    expect(tree.ctaLabel).toBe('К странице входа');
  });

  it('renders insufficient-permissions copy when AuthService.user() is set', () => {
    const fixture = TestBed.createComponent(ForbiddenPage);
    TestBed.inject(AuthService).user.set({
      id: 'x',
      username: 'u',
      email: 'u@x',
      displayName: 'U',
      role: 'user',
      permissions: [],
    });
    fixture.detectChanges();

    const tree = fixture.componentInstance.copy();

    expect(tree.eyebrow).toBe('доступ ограничен');
    expect(tree.title).toBe('Недостаточно прав');
    expect(tree.body).toMatch(/роли нет прав/i);
    expect(tree.ctaLabel).toBe('На главную');
  });
});
