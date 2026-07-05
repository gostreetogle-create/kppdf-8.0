import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from './api.tokens';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

const ACCESS_KEY = 'kppdf.access';
const REFRESH_KEY = 'kppdf.refresh';

/**
 * Centralised authentication state. Signal-based — components read directly.
 *
 * - Token storage: localStorage so page reload keeps the session alive.
 * - State ownership: this service is the single source of truth; UI
 *   components never read localStorage directly.
 * - Why HttpClient (not httpResource): login / logout / refresh are
 *   mutations. httpResource is for read-only data fetching; we'll switch
 *   to it when listing pages are introduced.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // --- reactive state ---

  readonly accessToken = signal<string | null>(this.read(ACCESS_KEY));
  readonly refreshToken = signal<string | null>(this.read(REFRESH_KEY));
  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  // --- lifecycle ---

  /**
   * Called once via `provideAppInitializer`. If a token is present in
   * localStorage, validate it against /auth/me; clear state on 401.
   */
  async bootstrap(): Promise<void> {
    if (!this.accessToken()) return;
    try {
      const user = await firstValueFrom(
        this.http.get<AuthUser>(`${this.baseUrl}/auth/me`),
      );
      this.user.set(user);
    } catch {
      this.clear();
    }
  }

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
        username,
        password,
      }),
    );
    this.setTokens(res.access, res.refresh);
    this.user.set(res.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/auth/logout`, {}),
      );
    } catch {
      // network error — still clear local state so we don't get stuck
    } finally {
      this.clear();
    }
  }

  // --- helpers ---

  private read(k: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(k);
  }

  private setTokens(access: string, refresh: string): void {
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  private clear(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.user.set(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
