import { inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../../core/silent-http';

/**
 * Convert a flat params object to Angular `HttpParams`, applying the project's
 * filter conventions for list endpoints:
 *
 * - **Skip** `null`, `undefined`, and empty-string values (typo-safe filtering,
 *   pages don't carry `?search=` to the server when the input is empty).
 * - **Skip** empty arrays.
 * - **Serialize** scalar values through `String(value)` — covers `number`,
 *   `boolean`, `bigint`, and `string` uniformly.
 * - **Serialize arrays as multiple keys** (`?role=admin&role=manager`) —
 *   NestJS `@Query()` reads this natively into `string[]`.
 *
 * Designed to compose with `silentGet(http, url, { params })` — the returned
 * `HttpParams` is a complete instance, so callers can chain `.set(...)` on
 * top if they need to merge extra params.
 */
export function paramsToHttpParams(params: Record<string, unknown>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const v of value) {
        httpParams = httpParams.append(key, String(v));
      }
      continue;
    }
    httpParams = httpParams.set(key, String(value));
  }
  return httpParams;
}

/**
 * Canonical paginated envelope returned by list endpoints. Matches the
 * shape already used by ~11 of 16 existing services
 * (MaterialsService / ProductsService / OrganizationsService /
 * CounterpartyService) — see `docs/DEVELOPMENT-PATTERNS.md` §2.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Per-entity configuration consumed by `defineEntity`.
 *
 * - `endpoint`: bare URL path WITHOUT leading slash (e.g. `'users'`,
 *   `'materials'`). The factory normalizes both this value and the injected
 *   `API_BASE_URL` to compose `${base}/<endpoint>` correctly, so a leading
 *   slash or triple-slash on the endpoint is gracefully tolerated.
 * - `idKey`: name of the ID-like field on `T` (default `'_id'`). This is
 *   a **type-level hint** only — the URL builder appends the string `id`
 *   argument verbatim, regardless of which Mongo property is the
 *   identifier. Kept on the schema so TypeScript can enforce that `T`
 *   exposes the named field.
 */
export interface EntitySchema<T extends object = object> {
  readonly endpoint: string;
  readonly idKey?: keyof T & string;
}

/**
 * The 5 canonical Angular service methods, freshly built per `EntitySchema`.
 *
 * Each method uses `silentGet/Post/Patch/Delete` from `core/silent-http`:
 * observables never fail; instead they emit a discriminated
 * `SilentResult<T>` union. Use `if (res.ok)` for the happy path,
 * `extractErrorMessage(res.error)` for the unhappy path.
 */
export interface EntityService<T, P> {
  list(params: P): Observable<SilentResult<PaginatedResponse<T>>>;
  findById(id: string): Observable<SilentResult<T>>;
  create(payload: Partial<T>): Observable<SilentResult<T>>;
  update(id: string, payload: Partial<T>): Observable<SilentResult<T>>;
  remove(id: string): Observable<SilentResult<void>>;
}

/**
 * The shape returned by `defineEntity`. Provides the schema (for reflection /
 * logging / tooling) and an `inject()` function for Angular DI lookup.
 */
export interface DefineEntity<T, P> {
  readonly schema: EntitySchema<T>;
  inject(): EntityService<T, P>;
}

/**
 * Build a fully-typed 5-CRUD service for a canonical entity, ready to
 * inject via Angular DI.
 *
 * Usage:
 * ```ts
 * export interface User { _id: string; name: string; email: string; }
 * export const Users = defineEntity<User>({ endpoint: 'users' });
 *
 * @Component({ ... })
 * export class UsersPage {
 *   private readonly users = Users.inject();   // EntityService<User, …>
 * }
 * ```
 *
 * **DI model:** each call to `defineEntity` creates an `InjectionToken` keyed
 * by endpoint name with `providedIn: 'root'`. Calling `.inject()` inside an
 * injection context returns the singleton, lazy-constructed with `HttpClient`
 * + `API_BASE_URL` injected via the factory function.
 *
 * **Scope:** strictly canonical 5-method entities only. Services that expose
 * custom endpoints (e.g. `cost-calculations` nested `/products/:id/...` REST,
 * `work-types` non-paginated server response, `photos` upload `FormData`,
 * `registry` static catalog of `getDataSources()`) should remain hand-written
 * classes — not forced into this factory. Future extension surface can be
 * added in a separate TZ if real demand arises.
 */
export function defineEntity<
  T extends object,
  P = { page: number; limit: number; search?: string },
>(schema: EntitySchema<T>): DefineEntity<T, P> {
  const token = new InjectionToken<EntityService<T, P>>(`EntityService_${schema.endpoint}`, {
    providedIn: 'root',
    factory: () => {
      const http = inject(HttpClient);
      const rawBaseUrl = inject(API_BASE_URL);
      // Normalize: strip trailing slashes on baseUrl, leading slashes on
      // endpoint, then join — produces `${baseUrl}/${endpoint}` regardless
      // of how schema.endpoint was supplied (`'users'`, `'/users'`,
      // `'///users'` all collapse to `/api/users`).
      const baseUrl = [rawBaseUrl.replace(/\/+$/, ''), schema.endpoint.replace(/^\/+/, '')].join(
        '/',
      );

      return {
        list(params: P): Observable<SilentResult<PaginatedResponse<T>>> {
          return silentGet<PaginatedResponse<T>>(http, baseUrl, {
            params: paramsToHttpParams(params as Record<string, unknown>),
          });
        },
        findById(id: string): Observable<SilentResult<T>> {
          return silentGet<T>(http, `${baseUrl}/${id}`);
        },
        create(payload: Partial<T>): Observable<SilentResult<T>> {
          return silentPost<T>(http, baseUrl, payload);
        },
        update(id: string, payload: Partial<T>): Observable<SilentResult<T>> {
          return silentPatch<T>(http, `${baseUrl}/${id}`, payload);
        },
        remove(id: string): Observable<SilentResult<void>> {
          return silentDelete<void>(http, `${baseUrl}/${id}`);
        },
      };
    },
  });

  return {
    schema,
    inject: () => inject(token),
  };
}
