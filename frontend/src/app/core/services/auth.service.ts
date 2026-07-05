import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../tokens';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly isBrowser: boolean;

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly refreshSignal = signal<string | null>(null);

  /** Single in-flight refresh (shared) to avoid race when multiple 401s hit. */
  private refreshInFlight: Observable<{ access: string; refresh: string } | null> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly role = computed(() => this.userSignal()?.role ?? null);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.tokenSignal.set(this.loadFromStorage('access') as string | null);
      this.userSignal.set(this.loadFromStorage('user') as AuthUser | null);
      this.refreshSignal.set(this.loadFromStorage('refresh') as string | null);
    }
  }

  getAccessToken(): string | null {
    return this.tokenSignal();
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, { username, password })
      .pipe(tap((res) => this.applyAuth(res)));
  }

  refresh(): Observable<{ access: string; refresh: string } | null> {
    if (!this.isBrowser) return of(null);
    if (this.refreshInFlight) return this.refreshInFlight;
    const refresh = this.refreshSignal();
    if (!refresh) {
      this.logout();
      return of(null);
    }
    this.refreshInFlight = this.http
      .post<{ access: string; refresh: string }>(`${this.baseUrl}/auth/refresh`, { refresh })
      .pipe(
        tap((res) => this.applyTokens(res.access, res.refresh)),
        catchError(() => {
          this.logout();
          return of(null);
        }),
        shareReplay(1),
      );
    // Clear in-flight cache once it completes
    this.refreshInFlight.subscribe({ complete: () => (this.refreshInFlight = null) });
    return this.refreshInFlight;
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/auth/me`);
  }

  logout(): void {
    if (this.isBrowser) this.clearStorage();
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.refreshSignal.set(null);
    if (this.isBrowser) void this.router.navigate(['/login']);
  }

  hasRole(roles: string[] | undefined): boolean {
    if (!roles || roles.length === 0) return true;
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  private applyAuth(res: AuthResponse): void {
    this.applyTokens(res.access, res.refresh);
    this.userSignal.set(res.user);
    if (this.isBrowser) this.saveToStorage('user', res.user);
  }

  private applyTokens(access: string, refresh: string): void {
    this.tokenSignal.set(access);
    this.refreshSignal.set(refresh);
    if (this.isBrowser) {
      this.saveToStorage('access', access);
      this.saveToStorage('refresh', refresh);
    }
  }

  private saveToStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(`kppdf.${key}`, JSON.stringify(value));
    } catch {
      // localStorage unavailable
    }
  }

  private loadFromStorage(key: string): unknown {
    try {
      const raw = localStorage.getItem(`kppdf.${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem('kppdf.access');
      localStorage.removeItem('kppdf.refresh');
      localStorage.removeItem('kppdf.user');
    } catch {
      // ignore
    }
  }
}
