import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentGet,
  silentPost,
  silentPatch,
  silentDelete,
  SilentResult,
} from '../../core/silent-http';

export interface ColorReference {
  _id: string;
  name: string;
  slug: string;
  hex?: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  isDefault: boolean;
  organizationId?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorReferenceListParams {
  activeOnly?: boolean;
  search?: string;
}

type ColorReferenceListResult = SilentResult<ColorReference[]>;
type PendingListRequest = {
  generation: number;
  request: Observable<ColorReferenceListResult>;
};

/**
 * TZ-PRODUCTS-301 — client for GET/POST/PATCH/DELETE
 * `/color-references` (RAL dictionary).
 *
 * Mirrors the DocumentTemplateCategoriesService cache contract (TZ-DOC-309):
 * the small, stable active catalog used by the product form RAL dropdown is
 * cached for the lifetime of the Angular application. Dictionary and search
 * requests remain fresh because they are administrative views where stale
 * results are undesirable. Successful mutations invalidate every cached
 * active-catalog request; failed mutations leave the last known-good catalog
 * available.
 */
@Injectable({ providedIn: 'root' })
export class PiColorReferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly listCache = new Map<string, ColorReferenceListResult>();
  private readonly listRequests = new Map<string, PendingListRequest>();
  private cacheGeneration = 0;

  list(params: ColorReferenceListParams = {}): Observable<ColorReferenceListResult> {
    // Only the small, stable active catalog used by the product RAL dropdown
    // is cached. Dictionary/search consumers intentionally receive fresh responses.
    const shouldCache = params.activeOnly === true && !params.search;
    if (!shouldCache) {
      return silentGet<ColorReference[]>(
        this.http,
        `${this.baseUrl}/color-references`,
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

    const request$: Observable<ColorReferenceListResult> = silentGet<ColorReference[]>(
      this.http,
      `${this.baseUrl}/color-references`,
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
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.listRequests.set(key, { generation, request: request$ });
    return request$;
  }

  findById(id: string): Observable<SilentResult<ColorReference>> {
    return silentGet<ColorReference>(
      this.http,
      `${this.baseUrl}/color-references/${id}`,
    );
  }

  create(payload: {
    name: string;
    slug?: string;
    hex?: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Observable<SilentResult<ColorReference>> {
    return silentPost<ColorReference>(
      this.http,
      `${this.baseUrl}/color-references`,
      payload,
    ).pipe(tap((res) => this.invalidateAfterMutation(res)));
  }

  update(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      hex?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ): Observable<SilentResult<ColorReference>> {
    return silentPatch<ColorReference>(
      this.http,
      `${this.baseUrl}/color-references/${id}`,
      payload,
    ).pipe(tap((res) => this.invalidateAfterMutation(res)));
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/color-references/${id}`).pipe(
      tap((res) => this.invalidateAfterMutation(res)),
    );
  }

  private toHttpParams(params: ColorReferenceListParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return httpParams;
  }

  private listCacheKey(params: ColorReferenceListParams): string {
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
