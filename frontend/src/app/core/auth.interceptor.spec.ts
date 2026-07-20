import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

/**
 * TZ-NEW: Unit tests for authInterceptor.
 *
 * Contract under test (locks in the `skipToken` / `skipRefresh` split
 * that fixed a production bug where /auth/me was not receiving the
 * Authorization header, AND prevents a regression where 401 on
 * /auth/me would trigger an infinite auto-refresh loop):
 *
 *  skipToken (Authorization header attachment)
 *   - GET  /auth/me          WITH access token → header IS attached (the fix)
 *   - GET  /auth/me          WITHOUT access token → header NOT attached
 *   - GET  /api/materials    WITH access token → header IS attached
 *   - POST /auth/login       → header NOT attached
 *   - POST /auth/register    → header NOT attached
 *   - POST /auth/refresh     → header NOT overwritten (AuthService.refresh()
 *                              sets the refresh-token header manually; the
 *                              interceptor must not replace it with the
 *                              access token — that would break the
 *                              jwt-refresh guard on the backend)
 *
 *  skipRefresh (401 auto-refresh trigger)
 *   - 401 on /auth/me                       → auth.refresh() NOT called
 *   - 401 on /api/materials WITH refresh    → auth.refresh() IS called and
 *                                              the original request is
 *                                              retried with the new token
 *   - 401 on /api/materials WITHOUT refresh → auth.refresh() NOT called
 *   - Non-401 (e.g. 500) on /api/materials   → auth.refresh() NOT called
 *
 * Mock strategy: AuthService is mocked with jest.fn() to isolate the
 * interceptor (the real AuthService is tested in auth.service.spec.ts).
 * Router is provided via `provideRouter([])` — the interceptor checks
 * `router.url.startsWith('/login')` on refresh failure, but that path
 * is not exercised in these tests.
 */
describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuth: {
    accessToken: jest.Mock;
    refreshToken: jest.Mock;
    refresh: jest.Mock;
  };

  const meUrl = '/api/auth/me';
  const loginUrl = '/api/auth/login';
  const registerUrl = '/api/auth/register';
  const refreshUrl = '/api/auth/refresh';
  const materialsUrl = '/api/materials';

  /**
   * Yield to the event loop so async chains (e.g. the interceptor's
   * `from(auth.refresh())` Observable) can resume. `setTimeout(0)` is
   * a macrotask that drains ALL pending microtasks in between — this
   * matches the behaviour of `tick()` from `@angular/core/testing`
   * without requiring the test to be wrapped in `fakeAsync()`.
   * Mirrors the helper in auth.service.spec.ts.
   */
  async function tick(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    mockAuth = {
      accessToken: jest.fn(),
      refreshToken: jest.fn(),
      refresh: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        // The interceptor calls `auth.accessToken()`, `auth.refreshToken()`,
        // and `auth.refresh()`. The real AuthService is a `providedIn: 'root'`
        // singleton with Signal-based state — mocking it lets us test the
        // interceptor in isolation, without the localStorage seeding dance
        // required by auth.service.spec.ts.
        { provide: AuthService, useValue: mockAuth as unknown as AuthService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Every test must flush every request it issued (or explicitly call
    // httpMock.expectNone for the cases that should NOT fire).
    httpMock.verify();
  });

  // ─── skipToken: attaches Authorization header ─────────────────────

  describe('skipToken: attaches Authorization header', () => {
    it('attaches Authorization: Bearer <access> to /auth/me (the production bug fix)', () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      httpClient.get(meUrl).subscribe();
      const req = httpMock.expectOne(meUrl);
      // THIS is the regression guard: before the skipToken/skipRefresh
      // split, /auth/me was treated as "public auth" and the header was
      // NEVER attached, so the backend's jwt guard always 401'd the
      // session-validation call.
      expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
      req.flush({ id: '1' });
    });

    it('attaches Authorization: Bearer <access> to non-auth endpoints like /api/materials', () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      httpClient.get(materialsUrl).subscribe();
      const req = httpMock.expectOne(materialsUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
      req.flush([]);
    });

    it('does NOT attach Authorization when no access token is present', () => {
      mockAuth.accessToken.mockReturnValue(null);
      httpClient.get(meUrl).subscribe();
      const req = httpMock.expectOne(meUrl);
      // No token → no header (the `access && !skipToken` guard).
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({ id: '1' });
    });
  });

  // ─── skipToken: does NOT attach Authorization header ──────────────

  describe('skipToken: does NOT attach Authorization header', () => {
    it('does NOT attach Authorization to /auth/login', () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      httpClient.post(loginUrl, {}).subscribe();
      const req = httpMock.expectOne(loginUrl);
      // /auth/login has no token yet — sending one would be wrong.
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('does NOT attach Authorization to /auth/register', () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      httpClient.post(registerUrl, {}).subscribe();
      const req = httpMock.expectOne(registerUrl);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('does NOT overwrite the manual refresh-token header on /auth/refresh', () => {
      // Simulate AuthService.refresh() which sets the refresh-token
      // header manually via the per-request `headers` option. The
      // interceptor must NOT replace it with the access token — the
      // backend uses `AuthGuard('jwt-refresh')`, not `AuthGuard('jwt')`,
      // so an access token here would be rejected.
      mockAuth.accessToken.mockReturnValue('access-1');
      httpClient
        .post(refreshUrl, {}, { headers: { Authorization: 'Bearer refresh-1' } })
        .subscribe();
      const req = httpMock.expectOne(refreshUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer refresh-1');
      req.flush({ access: 'access-2' });
    });
  });

  // ─── skipRefresh: 401 on /auth/me does NOT trigger auto-refresh ───

  describe('skipRefresh: 401 on /auth/me does NOT trigger auto-refresh', () => {
    it('does NOT call auth.refresh() on 401 from /auth/me (prevents infinite loop)', async () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      mockAuth.refreshToken.mockReturnValue('refresh-1');
      mockAuth.refresh.mockResolvedValue('access-2');

      let error: HttpErrorResponse | undefined;
      httpClient.get(meUrl).subscribe({
        error: (e) => {
          error = e;
        },
      });
      httpMock.expectOne(meUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      // Drain microtasks so any async refresh call would have fired.
      await tick();

      // The interceptor must NOT have called auth.refresh() — bootstrap()
      // handles /auth/me's 401+refresh flow itself. If the interceptor
      // ALSO tried to refresh, we'd enter an infinite loop (refresh
      // 401s → refresh → 401 → ...).
      expect(mockAuth.refresh).not.toHaveBeenCalled();
      // No /auth/refresh request should have been made.
      httpMock.expectNone(refreshUrl);
      // The original 401 should propagate to the caller.
      expect(error?.status).toBe(401);
    });
  });

  // ─── auto-refresh: 401 on non-auth endpoint triggers refresh ──────

  describe('auto-refresh: 401 on non-auth endpoint triggers refresh + retry', () => {
    it('calls auth.refresh() on 401 from /api/materials and retries with the new token', async () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      mockAuth.refreshToken.mockReturnValue('refresh-1');
      mockAuth.refresh.mockResolvedValue('access-2');

      let response: unknown;
      httpClient.get(materialsUrl).subscribe({
        next: (r) => {
          response = r;
        },
      });

      // 1. First /api/materials → 401
      httpMock.expectOne(materialsUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      // 2. The interceptor's catchError runs synchronously and calls
      //    auth.refresh() — verify the spy was invoked.
      expect(mockAuth.refresh).toHaveBeenCalledTimes(1);

      // Drain microtasks so the refresh Promise resolves, the
      // `from(auth.refresh())` Observable emits, and the interceptor's
      // switchMap can re-issue the original request.
      await tick();

      // 3. The retry request arrives with the NEW access token in the
      //    Authorization header (set by the interceptor from
      //    auth.refresh()'s resolved value).
      const retryReq = httpMock.expectOne(materialsUrl);
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer access-2');
      retryReq.flush([{ id: '1' }]);

      // Drain microtasks so the retry response can be delivered to
      // the original subscriber.
      await tick();

      expect(response).toEqual([{ id: '1' }]);
    });

    it('does NOT trigger refresh on 401 when no refresh token is present', async () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      mockAuth.refreshToken.mockReturnValue(null);
      mockAuth.refresh.mockResolvedValue('access-2');

      let error: HttpErrorResponse | undefined;
      httpClient.get(materialsUrl).subscribe({
        error: (e) => {
          error = e;
        },
      });
      httpMock.expectOne(materialsUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      await tick();

      // No refresh token → nothing to do, propagate 401.
      expect(mockAuth.refresh).not.toHaveBeenCalled();
      expect(error?.status).toBe(401);
    });

    it('does NOT trigger refresh on non-401 errors (e.g. 500)', async () => {
      mockAuth.accessToken.mockReturnValue('access-1');
      mockAuth.refreshToken.mockReturnValue('refresh-1');
      mockAuth.refresh.mockResolvedValue('access-2');

      let error: HttpErrorResponse | undefined;
      httpClient.get(materialsUrl).subscribe({
        error: (e) => {
          error = e;
        },
      });
      httpMock.expectOne(materialsUrl).flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await tick();

      // Only 401s trigger the auto-refresh flow — 500/403/etc. propagate
      // as-is. Calling refresh() on a 500 would just spam the refresh
      // endpoint for no reason.
      expect(mockAuth.refresh).not.toHaveBeenCalled();
      expect(error?.status).toBe(500);
    });

    it('does NOT trigger a second refresh if the retry ALSO returns 401 (IS_RETRY loop guard)', async () => {
      // This locks in the IS_RETRY HttpContextToken contract: after a
      // successful refresh + retry, the retry request carries the
      // IS_RETRY=true flag. If the retry also returns 401, the
      // interceptor must NOT call auth.refresh() again — otherwise we
      // get an infinite loop (refresh 401s → refresh → 401 → ...).
      mockAuth.accessToken.mockReturnValue('access-1');
      mockAuth.refreshToken.mockReturnValue('refresh-1');
      mockAuth.refresh.mockResolvedValue('access-2');

      let error: HttpErrorResponse | undefined;
      httpClient.get(materialsUrl).subscribe({
        error: (e) => {
          error = e;
        },
      });

      // 1. First /api/materials → 401 → triggers refresh
      httpMock.expectOne(materialsUrl).flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });
      expect(mockAuth.refresh).toHaveBeenCalledTimes(1);

      await tick();

      // 2. Retry /api/materials → 401 (new token still rejected)
      //    First assert the retry was actually issued with the NEW
      //    access token (the prerequisite for the IS_RETRY guard to be
      //    meaningful — without this, a hypothetical bug where the
      //    interceptor re-issues with the stale token would still pass).
      const retryReq = httpMock.expectOne(materialsUrl);
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer access-2');
      retryReq.flush('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      await tick();

      // The retry should NOT have triggered a second refresh — the
      // IS_RETRY flag on the retry request blocks the loop.
      expect(mockAuth.refresh).toHaveBeenCalledTimes(1);
      // The original 401 propagates to the caller.
      expect(error?.status).toBe(401);
    });
  });
});
