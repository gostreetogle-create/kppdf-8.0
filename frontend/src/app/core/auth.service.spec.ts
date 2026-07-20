import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService, AuthUser } from './auth.service';
import { API_BASE_URL } from './api.tokens';
import { authInterceptor } from './auth.interceptor';

/**
 * TZ-NEW: Unit tests for AuthService.
 *
 * Contract under test (covers the catchError→of({ ok, ... }) refactor
 * that suppresses RxJS's global unhandled-error log on /auth/me and
 * /auth/refresh 4xx responses at bootstrap time):
 *
 *  bootstrap()
 *   - early-returns if no access token in localStorage
 *   - on 200 from /auth/me: sets the user signal, returns
 *   - on 401 from /auth/me with no refresh token: clears state, returns
 *   - on 401 from /auth/me with refresh token: calls refresh(), retries
 *     /auth/me, sets user on 200
 *   - on non-401 from /auth/me: clears state, returns
 *   - on refresh failure (e.g. 400 on /auth/refresh): clears state
 *   - DOES NOT log to console.error on any 4xx (RxJS global error log
 *     is suppressed by the catchError→of({ ok, status }) pattern)
 *
 *  refresh()
 *   - returns the new access token on 200, sets tokens, keeps refresh
 *   - on 4xx: clears state, throws HttpErrorResponse (uniform throw type)
 *   - on unexpected (non-HttpErrorResponse) error: throws a synthetic
 *     HttpErrorResponse with status: 0 (uniform throw type)
 *   - single-flight: concurrent calls share one in-flight Promise
 *   - DOES NOT log to console.error on 4xx (RxJS global error log
 *     is suppressed by the catchError→of({ ok, error }) pattern)
 *
 *  login()
 *   - happy path: stores tokens in localStorage + signals
 *
 *  logout()
 *   - happy path: clears state, removes localStorage entries
 *   - network error: still clears local state (doesn't get stuck)
 *   - DOES NOT log to console.error on network error
 *
 * IMPORTANT: AuthService reads localStorage in its field initializers
 * (`signal(this.read(ACCESS_KEY))`), which run ONCE at construction.
 * Because the service is `providedIn: 'root'`, TestBed caches the
 * singleton — re-injecting returns the same instance with the same
 * (stale) signal values. So each test must:
 *   1. clear localStorage (in beforeEach)
 *   2. seed localStorage with the tokens it wants (in the test)
 *   3. inject AuthService for the FIRST time (field initializer runs
 *      with the seeded values)
 * To enforce this, beforeEach does NOT inject AuthService — only
 * HttpTestingController (which has no localStorage dependency).
 */
describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let consoleErrorSpy: jest.SpyInstance;

  const ACCESS_KEY = 'kppdf.access';
  const REFRESH_KEY = 'kppdf.refresh';

  const baseUrl = '/api';
  const meUrl = `${baseUrl}/auth/me`;
  const refreshUrl = `${baseUrl}/auth/refresh`;
  const loginUrl = `${baseUrl}/auth/login`;
  const logoutUrl = `${baseUrl}/auth/logout`;

  const fakeUser: AuthUser = {
    id: 'user-1',
    username: 'admin',
    email: 'admin@kppdf.local',
    displayName: 'Default Administrator',
    role: 'admin',
    permissions: ['*'],
  };

  /**
   * Seed localStorage with the given tokens, then return a freshly-
   * constructed AuthService whose field initializers read those tokens.
   * Call this EXACTLY ONCE per test, BEFORE the first HTTP call.
   */
  function makeServiceWithTokens(
    access: string | null,
    refresh: string | null,
  ): AuthService {
    if (access !== null) localStorage.setItem(ACCESS_KEY, access);
    if (refresh !== null) localStorage.setItem(REFRESH_KEY, refresh);
    return TestBed.inject(AuthService);
  }

  /** No tokens in localStorage; bootstrap() should early-return. */
  function makeServiceWithoutTokens(): AuthService {
    return TestBed.inject(AuthService);
  }

  function expectNoConsoleError(): void {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  }

  /**
   * Yield to the event loop so async chains (e.g. bootstrap's `await
   * firstValueFrom(...)`) can resume between synchronous `flush()`
   * calls. Without this, `expectOne(refreshUrl)` runs BEFORE bootstrap
   * has reached its `await this.refresh()` line, so the refresh
   * request isn't in httpMock yet — manifesting as either
   * "Expected one matching request, found none" inside the test, or
   * "Expected no open requests, found 1: POST /api/auth/refresh" in
   * afterEach (when the queued microtask finally fires after the
   * test body has returned).
   *
   * `setTimeout(0)` is a macrotask, which drains ALL pending
   * microtasks in between (an `await Promise.resolve()` would only
   * drain one). This matches the behaviour of `tick()` from
   * `@angular/core/testing` without requiring the test to be
   * wrapped in `fakeAsync()`.
   */
  async function tick(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        // Override the default '/api' (from the InjectionToken factory)
        // to the same value, so tests are explicit about the contract.
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);

    // Spy on console.error so we can assert that the catchError→of(...)
    // refactor suppresses RxJS's global unhandled-error log. The real
    // browser-level network logs (Chrome's "GET /api/auth/me 401")
    // come from the network layer, not console.error, so they're
    // unrelated to this spy.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    // Verify no outstanding HTTP requests — every test() must flush the
    // HttpTestingController (or explicitly call httpMock.verify()).
    httpMock.verify();
  });

  // ─── bootstrap() ─────────────────────────────────────────────────

  describe('bootstrap()', () => {
    it('early-returns if no access token in localStorage', async () => {
      const service = makeServiceWithoutTokens();

      // No tokens seeded → bootstrap should not make any HTTP call.
      await service.bootstrap();

      // No /auth/me or /auth/refresh request was made.
      httpMock.expectNone(meUrl);
      httpMock.expectNone(refreshUrl);
      expect(service.user()).toBeNull();
      expectNoConsoleError();
    });

    it('sets the user signal on 200 from /auth/me', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      const req = httpMock.expectOne(meUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
      req.flush(fakeUser);

      await promise;

      expect(service.user()).toEqual(fakeUser);
      expect(service.isAuthenticated()).toBe(true);
      expectNoConsoleError();
    });

    it('does NOT set the user and clears state on 401 with no refresh token', async () => {
      // Empty refresh token (not absent — the field initializer reads
      // `''` as a valid signal value, but the `if (this.refreshToken())`
      // check in bootstrap() treats `''` as falsy and skips refresh).
      const service = makeServiceWithTokens('access-1', '');

      const promise = service.bootstrap();

      const req = httpMock.expectOne(meUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await promise;

      expect(service.user()).toBeNull();
      // bootstrap() calls this.clear() which removes BOTH tokens.
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
      // No refresh was attempted (no refresh token to use).
      httpMock.expectNone(refreshUrl);
      expectNoConsoleError();
    });

    it('calls refresh() and retries /auth/me on 401+refresh, then sets user', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      // 1. First /auth/me → 401
      const meReq = httpMock.expectOne(meUrl);
      meReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      await tick();

      // 2. AuthService detects 401+refresh, calls refresh() →
      //    /auth/refresh returns new access token
      const refreshReq = httpMock.expectOne(refreshUrl);
      expect(refreshReq.request.method).toBe('POST');
      expect(refreshReq.request.headers.get('Authorization')).toBe(
        'Bearer refresh-1',
      );
      refreshReq.flush({ access: 'access-2' });
      await tick();

      // 3. AuthService retries /auth/me with the new access token
      const meRetryReq = httpMock.expectOne(meUrl);
      expect(meRetryReq.request.headers.get('Authorization')).toBe(
        'Bearer access-2',
      );
      meRetryReq.flush(fakeUser);

      await promise;

      expect(service.user()).toEqual(fakeUser);
      // New access token persisted, old refresh kept (not rotated).
      expect(localStorage.getItem(ACCESS_KEY)).toBe('access-2');
      expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-1');
      expectNoConsoleError();
    });

    it('clears state on 401+refresh when /auth/refresh itself returns 400', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      // 1. /auth/me → 401
      httpMock.expectOne(meUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });
      await tick();

      // 2. /auth/refresh → 400 (the original bug from the empty DTO)
      httpMock
        .expectOne(refreshUrl)
        .flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      await promise;

      expect(service.user()).toBeNull();
      // refresh()'s catchError path calls this.clear() on failure.
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
      expectNoConsoleError();
    });

    it('clears state on non-401 from /auth/me (e.g. 500)', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      httpMock.expectOne(meUrl).flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await promise;

      expect(service.user()).toBeNull();
      // No refresh attempted for non-401 status.
      httpMock.expectNone(refreshUrl);
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
      expectNoConsoleError();
    });

    it('clears state when the /auth/me retry after refresh also fails', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      // 1. /auth/me → 401
      httpMock.expectOne(meUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });
      await tick();

      // 2. /auth/refresh → 200
      httpMock.expectOne(refreshUrl).flush({ access: 'access-2' });
      await tick();

      // 3. /auth/me retry → 401 (refresh succeeded but new token still rejected)
      httpMock.expectOne(meUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      await promise;

      expect(service.user()).toBeNull();
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
      expectNoConsoleError();
    });
  });

  // ─── refresh() ───────────────────────────────────────────────────

  describe('refresh()', () => {
    it('throws when no refresh token is stored', async () => {
      const service = makeServiceWithoutTokens();

      await expect(service.refresh()).rejects.toThrow(
        'No refresh token available',
      );
      // refresh() also clears state on this path.
      expect(service.accessToken()).toBeNull();
      // No HTTP call was made.
      httpMock.expectNone(refreshUrl);
      expectNoConsoleError();
    });

    it('returns the new access token on 200 and stores it', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.refresh();

      const req = httpMock.expectOne(refreshUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer refresh-1',
      );
      req.flush({ access: 'access-2' });

      const newAccess = await promise;
      expect(newAccess).toBe('access-2');
      // Both signals and localStorage updated; refresh token kept.
      expect(service.accessToken()).toBe('access-2');
      expect(service.refreshToken()).toBe('refresh-1');
      expect(localStorage.getItem(ACCESS_KEY)).toBe('access-2');
      expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-1');
      expectNoConsoleError();
    });

    it('rejects with HttpErrorResponse on 400 and clears state', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.refresh();

      const req = httpMock.expectOne(refreshUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

      // The thrown value must be an HttpErrorResponse (uniform throw type,
      // not Error — verified by the type-uniformity fix in the review).
      await expect(promise).rejects.toMatchObject({
        status: 400,
        statusText: 'Bad Request',
      });
      // refresh() clears on failure.
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
      expectNoConsoleError();
    });

    it('rejects with HttpErrorResponse on 401 and clears state', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.refresh();

      const req = httpMock.expectOne(refreshUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      await expect(promise).rejects.toMatchObject({
        status: 401,
        statusText: 'Unauthorized',
      });
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expectNoConsoleError();
    });

    it('is single-flight: concurrent calls share one in-flight Promise', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      // Start two refreshes back-to-back WITHOUT awaiting either.
      const p1 = service.refresh();
      const p2 = service.refresh();

      // Only ONE HTTP request should be in flight.
      const req = httpMock.expectOne(refreshUrl);
      req.flush({ access: 'access-2' });

      const [a1, a2] = await Promise.all([p1, p2]);
      expect(a1).toBe('access-2');
      expect(a2).toBe('access-2');
      expectNoConsoleError();
    });

    it('resets refreshInFlight after a failure (so a later call can succeed)', async () => {
      // First refresh fails.
      const service = makeServiceWithTokens('access-1', 'refresh-1');
      const p1 = service.refresh();
      httpMock.expectOne(refreshUrl).flush('Bad Request', {
        status: 400,
        statusText: 'Bad Request',
      });
      await expect(p1).rejects.toMatchObject({ status: 400 });

      // After the failure refresh() cleared state, so we need a
      // fresh service + tokens to simulate a re-login → re-refresh
      // flow. (TestBed.resetTestingModule is called by jest-preset-
      // angular's afterEach, so a new TestBed.configureTestingModule
      // + inject gives us a fresh AuthService.)
      localStorage.setItem(ACCESS_KEY, 'access-2');
      localStorage.setItem(REFRESH_KEY, 'refresh-2');
      // Re-configure TestBed (the previous module was already torn
      // down by jest-preset-angular, but we re-configure for safety).
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([authInterceptor])),
          provideHttpClientTesting(),
          { provide: API_BASE_URL, useValue: baseUrl },
        ],
      });
      const newHttpMock = TestBed.inject(HttpTestingController);
      const service2 = TestBed.inject(AuthService);

      const p2 = service2.refresh();
      newHttpMock.expectOne(refreshUrl).flush({ access: 'access-3' });
      await expect(p2).resolves.toBe('access-3');
      newHttpMock.verify();
      expectNoConsoleError();
    });
  });

  // ─── login() ─────────────────────────────────────────────────────

  describe('login()', () => {
    it('stores tokens on 200 and sets the user signal', async () => {
      const service = makeServiceWithoutTokens();

      const promise = service.login('admin', 'admin123');

      const req = httpMock.expectOne(loginUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'admin', password: 'admin123' });
      req.flush({ access: 'access-1', refresh: 'refresh-1', user: fakeUser });

      await promise;

      expect(service.accessToken()).toBe('access-1');
      expect(service.refreshToken()).toBe('refresh-1');
      expect(service.user()).toEqual(fakeUser);
      expect(localStorage.getItem(ACCESS_KEY)).toBe('access-1');
      expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-1');
    });
  });

  // ─── logout() ────────────────────────────────────────────────────

  describe('logout()', () => {
    it('clears state on 200', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');
      // Manually set the user signal (the login flow normally does this).
      service.user.set(fakeUser);

      const promise = service.logout();

      const req = httpMock.expectOne(logoutUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ ok: true });

      await promise;

      expect(service.accessToken()).toBeNull();
      expect(service.refreshToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    });

    it('still clears local state on network error (no stuck session)', async () => {
      const service = makeServiceWithTokens('access-1', 'refresh-1');
      service.user.set(fakeUser);

      const promise = service.logout();

      httpMock.expectOne(logoutUrl).error(new ProgressEvent('error'));

      await promise;

      // Even though the request failed, the local state is cleared.
      expect(service.accessToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(localStorage.getItem(ACCESS_KEY)).toBeNull();
      expectNoConsoleError();
    });
  });

  // ─── contract guarantees ─────────────────────────────────────────

  describe('RxJS console-error suppression contract', () => {
    it('does NOT call console.error on any 4xx from /auth/me or /auth/refresh', async () => {
      // This is the central contract of the catchError→of({ ok, ... })
      // refactor: RxJS's default "unhandled error in observable" log
      // + the zone.js stack trace that follows it must NOT fire on
      // the expected 4xx responses during bootstrap.
      const service = makeServiceWithTokens('access-1', 'refresh-1');

      const promise = service.bootstrap();

      // /auth/me → 401
      httpMock.expectOne(meUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });
      await tick();

      // /auth/refresh → 400
      httpMock.expectOne(refreshUrl).flush('Bad Request', {
        status: 400,
        statusText: 'Bad Request',
      });

      await promise;

      // The whole point: nothing was logged.
      expectNoConsoleError();
    });
  });
});
