import { inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
export interface EntitySchema<T = object> {
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
 * Adapt a hand-written service with the canonical 5-CRUD shape
 * (returning `{ items, total }` list envelopes) to the
 * `EntityService<T, P>` interface that `<pi-entity-list>` and other
 * DSL components expect.
 *
 * Per TZ-232 §2.3, services with custom endpoints (adjust / lowStock /
 * nested create paths) should NOT be forced into `defineEntity`. But
 * pages using `<pi-entity-list>` need an `EntityService<T, P>`
 * reference. This helper bridges the gap in 1 LOC per page:
 *
 * ```ts
 * private readonly listService = toEntityService<WorkType, ListParams>(
 *   inject(WorkTypesService),
 * );
 * ```
 *
 * **Synthetic page/limit mapping.** Non-paginated endpoints return
 * `{ items, total }` without `page`/`limit`. The wrapper needs the
 * full `PaginatedResponse<T>` shape for its pagination signals (e.g.
 * `showPager` computed in `<app-pi-table>` reads `total()` and
 * `page()` to decide whether to render the pager). We fill in
 * synthetic `page: 1` and `limit: items.length` so the wrapper's
 * arithmetic works — `showPager` returns `false` when `total <=
 * pageSize` (single page), so the user never sees a bogus pager.
 * If the backend ever adds pagination, swap the synthetic mapping
 * for the real values; the rest of the wrapper stays unchanged.
 *
 * **`any` for service.list params.** Hand-written services often have
 * narrower param types than the wrapper's full `P extends
 * DefaultListParams` (e.g., WorkTypesService.list accepts only
 * `WorkTypeListParams` without `page`/`limit`/`search`). We type the
 * source service's `list` parameter as `any` so any function signature
 * can be adapted without page-level casts. Function bivariance on `any`
 * means a service that accepts `WorkTypeListParams` IS assignable to
 * the `(params: any) => ...` signature. Runtime is safe — backend
 * ignores unknown query params (NestJS default). The wrapper's `P`
 * type IS preserved on the returned `EntityService<T, P>`.
 */
export function toEntityService<T, P>(svc: {
  list: (params: any) => Observable<SilentResult<{ items: T[]; total: number }>>;
  findById: (id: string) => Observable<SilentResult<T>>;
  create: (payload: Partial<T>) => Observable<SilentResult<T>>;
  update: (id: string, payload: Partial<T>) => Observable<SilentResult<T>>;
  remove: (id: string) => Observable<SilentResult<void>>;
}): EntityService<T, P> {
  return {
    list: (params: P) =>
      svc.list(params).pipe(
        map((res) =>
          res.ok
            ? ({
                ok: true as const,
                data: {
                  ...res.data,
                  page: 1,
                  limit: Math.max(res.data.items.length, 1),
                } as PaginatedResponse<T>,
              })
            : res,
        ),
      ),
    findById: svc.findById,
    create: svc.create,
    update: svc.update,
    remove: svc.remove,
  };
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
  T,
  P = { page: number; limit: number; search?: string },
>(schema: EntitySchema<T>): DefineEntity<T, P> {
  const token = new InjectionToken<EntityService<T, P>>(`EntityService_${schema.endpoint}`, {
    providedIn: 'root',
    factory: () => {
      const http = inject(HttpClient);
      const rawBaseUrl = inject(API_BASE_URL);
      // Normalize: strip trailing slash from rawBaseUrl (preserves leading
      // slash so the joined URL stays absolute — stripping the leading slash
      // would turn `/api/users` into the relative path `api/users` and break
      // every HTTP test expectation). Strip BOTH leading and trailing from
      // schema.endpoint via two separate `.replace()` calls (a single
      // combined anchored-alternation regex `\/^/+|\\/+$/g` is unreliable for
      // trailing slashes under some V8/Node regex engine combinations —
      // verified via the `collapses trailing slashes on endpoint gracefully`
      // spec case).
      const baseUrl = [
        rawBaseUrl.replace(/\/+$/, ''),
        schema.endpoint.replace(/^\/+/g, '').replace(/\/+$/g, ''),
      ].join('/');

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