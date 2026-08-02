import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { finalize, share, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentGet,
  silentPost,
  silentPatch,
  silentDelete,
  SilentResult,
} from '../../core/silent-http';

export interface TextBlockCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isSystem: boolean;
  isDefault: boolean;
  sortOrder: number;
  description?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TextBlockCategoryListParams {
  /** Only active categories (for the text-block picker). */
  activeOnly?: boolean;
  /** Free-text search across name (server-side, regex-escaped). */
  search?: string;
}

type CategoryListResult = SilentResult<TextBlockCategory[]>;
type PendingListRequest = {
  generation: number;
  request: Observable<CategoryListResult>;
};

/**
 * TZ-DOC-316 — client for GET/POST/PATCH/DELETE `/text-block-categories`
 * (backend contract fixed by TZ-DOC-315).
 *
 * Mirrors the DocumentTemplateCategoriesService pattern (TZ-DOC-308/309):
 *   - `list({ activeOnly: true })` caches the small, stable ACTIVE catalog
 *     used by the texts registry filter and the block-editor picker.
 *   - Dictionary/search requests stay fresh (administrative views where
 *     stale results are undesirable).
 *   - Successful create/update/remove invalidate the cached active catalog;
 *     failed mutations leave the last known-good catalog available.
 *
 * In-flight dedup uses `share()` (not `shareReplay`) so concurrent callers
 * share one GET, while the session cache (a plain Map of results) serves
 * later calls synchronously. This keeps cross-tab / external changes
 * visible on the next invalidation instead of hiding them behind a
 * replayed observable.
 *
 * Error contract (backend TZ-DOC-315):
 *   - 409 on duplicate slug (scoped by organization) and on system
 *     category update/delete, and on delete of an in-use category;
 *   - 403 IDOR (category owned by another organization);
 *   - 404 missing id; 400 invalid slug / inactive category assignment.
 */
@Injectable({ providedIn: 'root' })
export class TextBlockCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly listCache = new Map<string, CategoryListResult>();
  private readonly listRequests = new Map<string, PendingListRequest>();
  private cacheGeneration = 0;

  list(params: TextBlockCategoryListParams = {}): Observable<CategoryListResult> {
    // Only the small, stable active catalog used by pickers is cached.
    // Dictionary/search consumers intentionally receive fresh responses.
    const shouldCache = params.activeOnly === true && !params.search;
    if (!shouldCache) {
      return silentGet<TextBlockCategory[]>(
        this.http,
        `${this.baseUrl}/text-block-categories`,
        { params: this.toHttpParams(params) },
      );
    }

    const key = this.listCacheKey(params);
    const cached = this.listCache.get(key);
    if (cached) return of(cached);

    const generation = this.cacheGeneration;
    const pending = this.listRequests.get(key);
    if (pending?.generation === generation) return pending.request;
    if (pending) this.listRequests.delete(key);

    const request$: Observable<CategoryListResult> = silentGet<TextBlockCategory[]>(
      this.http,
      `${this.baseUrl}/text-block-categories`,
      { params: this.toHttpParams(params) },
    ).pipe(
      tap((res) => {
        // Never cache an error or a response from a pre-invalidation request.
        if (res.ok && generation === this.cacheGeneration) {
          this.listCache.set(key, res);
        }
      }),
      finalize(() => {
        // A stale request must not remove a newer request created after
        // invalidation, even when the old HTTP response finishes later.
        if (this.listRequests.get(key)?.request === request$) {
          this.listRequests.delete(key);
        }
      }),
      // Multicast concurrent subscribers; NO replay — the Map cache handles
      // repeat reads, and replayed values would hide cross-tab changes.
      share(),
    );
    this.listRequests.set(key, { generation, request: request$ });
    return request$;
  }

  findById(id: string): Observable<SilentResult<TextBlockCategory>> {
    return silentGet<TextBlockCategory>(
      this.http,
      `${this.baseUrl}/text-block-categories/${id}`,
    );
  }

  create(payload: {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
  }): Observable<SilentResult<TextBlockCategory>> {
    return silentPost<TextBlockCategory>(
      this.http,
      `${this.baseUrl}/text-block-categories`,
      payload,
    ).pipe(tap((res) => this.invalidateAfterMutation(res)));
  }

  update(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
      sortOrder?: number;
    },
  ): Observable<SilentResult<TextBlockCategory>> {
    return silentPatch<TextBlockCategory>(
      this.http,
      `${this.baseUrl}/text-block-categories/${id}`,
      payload,
    ).pipe(tap((res) => this.invalidateAfterMutation(res)));
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/text-block-categories/${id}`).pipe(
      tap((res) => this.invalidateAfterMutation(res)),
    );
  }

  private toHttpParams(params: TextBlockCategoryListParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return httpParams;
  }

  private listCacheKey(params: TextBlockCategoryListParams): string {
    return JSON.stringify({
      activeOnly: params.activeOnly === true,
      search: params.search ?? '',
    });
  }

  private invalidateAfterMutation<T>(res: SilentResult<T>): void {
    if (res.ok) this.invalidateListCache();
  }

  private invalidateListCache(): void {
    this.cacheGeneration += 1;
    this.listCache.clear();
    // Do not abort old HTTP requests, but make subsequent list() calls start
    // fresh requests. The generation/equality guards handle old completions.
    this.listRequests.clear();
  }
}
