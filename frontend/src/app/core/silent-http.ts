import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * silent-http — RxJS-error-log suppression for HttpClient.
 *
 * Wrap every `this.http.{get,post,patch,delete}(…)` call in one of these
 * helpers so the resulting Observable NEVER errors. Instead, the
 * observable emits a discriminated `SilentResult<T>` value:
 *
 *   type SilentResult<T> =
 *     | { ok: true;  data: T }
 *     | { ok: false; error: HttpErrorResponse };
 *
 * Why this exists: without `catchError`, an HTTP 4xx/5xx response errors
 * the observable. RxJS's global unhandled-error handler then logs the
 * error to `console.error` + emits a zone.js stack trace — pure noise
 * that the user sees in DevTools on every fresh page load. This was
 * originally the case for `/auth/me` and `/auth/refresh` at bootstrap
 * time; the pattern is now applied to all backend calls for
 * consistency and defense-in-depth.
 *
 * The browser-level network log (Chrome's "GET /api/materials 401")
 * is UNAVOIDABLE from app code — it comes from the network layer, not
 * from `console.error`. Filter it in DevTools with `-url:api/` or
 * "Hide network" in Console settings.
 *
 * Consumer pattern (replaces the old `subscribe({ next, error })`):
 *
 *   this.materials.list({ page: 1 }).subscribe((res) => {
 *     if (res.ok) {
 *       this.data.set(res.data.items);   // typed as MaterialsListResponse
 *     } else {
 *       this.error.set(res.error.message ?? '…');
 *     }
 *   });
 *
 * No `.subscribe({ error: … })` callback needed — the observable never
 * errors, so RxJS never logs.
 */

/** Discriminated union returned by every silent-* helper. */
export type SilentResult<T> = { ok: true; data: T } | { ok: false; error: HttpErrorResponse };

/** Normalize an unknown error to a proper HttpErrorResponse. */
export function normalizeError(err: unknown): HttpErrorResponse {
  if (err instanceof HttpErrorResponse) return err;
  // Wrap non-HTTP errors (e.g. TypeError from a broken interceptor) in
  // a synthetic HttpErrorResponse with status 0 — the conventional
  // sentinel for "non-HTTP error" in Angular's own HttpClient code.
  return new HttpErrorResponse({
    status: 0,
    statusText: 'Unknown',
    error: err,
  });
}

/**
 * Extract a human-readable error message from an HttpErrorResponse.
 *
 * Replaces the boilerplate `e?.error?.message ?? e?.message ?? '…'`
 * chain previously inlined in every consumer. Order of preference:
 *   1. `err.error?.message` (NestJS validation messages, our API contract)
 *   2. `err.message` (Angular's default HttpErrorResponse message)
 *   3. 'Неизвестная ошибка' (Russian fallback, matches UI language)
 */
export function extractErrorMessage(err: HttpErrorResponse): string {
  const fromBody = (err.error as { message?: unknown } | null)?.message;
  if (typeof fromBody === 'string' && fromBody.length > 0) return fromBody;
  if (err.message && err.message.length > 0) return err.message;
  return 'Неизвестная ошибка';
}

/**
 * Internal: wrap any `Observable<T>` in the silent-error pipe.
 * Exported for advanced cases (e.g. custom request context); most code
 * should use the `silentGet` / `silentPost` / `silentPatch` /
 * `silentDelete` helpers below.
 */
export function silentWrap<T>(source: Observable<T>): Observable<SilentResult<T>> {
  return source.pipe(
    map((data) => ({ ok: true as const, data })),
    catchError((err: unknown) => of({ ok: false as const, error: normalizeError(err) })),
  );
}

/** Options accepted by the silent-* helpers (subset of HttpClient options). */
export interface SilentOptions {
  params?: HttpParams | Record<string, string | number | boolean>;
  headers?: HttpHeaders | Record<string, string | string[]>;
}

export function silentGet<T>(
  http: HttpClient,
  url: string,
  options: SilentOptions = {},
): Observable<SilentResult<T>> {
  return silentWrap(http.get<T>(url, options));
}

export function silentPost<T>(
  http: HttpClient,
  url: string,
  body: unknown,
  options: SilentOptions = {},
): Observable<SilentResult<T>> {
  return silentWrap(http.post<T>(url, body, options));
}

export function silentPatch<T>(
  http: HttpClient,
  url: string,
  body: unknown,
  options: SilentOptions = {},
): Observable<SilentResult<T>> {
  return silentWrap(http.patch<T>(url, body, options));
}

export function silentDelete<T = void>(
  http: HttpClient,
  url: string,
  options: SilentOptions = {},
): Observable<SilentResult<T>> {
  return silentWrap(http.delete<T>(url, options));
}
