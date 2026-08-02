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

export interface DocumentTemplateCategory {
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

export interface DocumentTemplateCategoryListParams {
  activeOnly?: boolean;
  search?: string;
}

type CategoryListResult = SilentResult<DocumentTemplateCategory[]>;
type PendingListRequest = {
  generation: number;
  request: Observable<CategoryListResult>;
};

/**
 * TZ-DOC-308/309 — client for GET/POST/PATCH/DELETE
 * `/document-template-categories`.
 *
 * The active catalog used by template setup is cached for the lifetime of the
 * Angular application. Dictionary and search requests remain fresh because
 * they are administrative views where stale results are undesirable.
 * Successful mutations invalidate every cached active-catalog request; failed
 * mutations leave the last known-good catalog available.
 */
@Injectable({ providedIn: 'root' })
export class DocumentTemplateCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly listCache = new Map<string, CategoryListResult>();
  private readonly listRequests = new Map<string, PendingListRequest>();
  private cacheGeneration = 0;

  list(params: DocumentTemplateCategoryListParams = {}): Observable<CategoryListResult> {
    // Only the small, stable active catalog used by template setup is cached.
    // Dictionary/search consumers intentionally receive fresh responses.
    const shouldCache = params.activeOnly === true && !params.search;
    if (!shouldCache) {
      return silentGet<DocumentTemplateCategory[]>(
        this.http,
        `${this.baseUrl}/document-template-categories`,
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

    const request$: Observable<CategoryListResult> = silentGet<DocumentTemplateCategory[]>(
      this.http,
      `${this.baseUrl}/document-template-categories`,
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

  findById(id: string): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentGet<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories/${id}`,
    );
  }

  create(payload: {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
  }): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentPost<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories`,
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
  ): Observable<SilentResult<DocumentTemplateCategory>> {
    return silentPatch<DocumentTemplateCategory>(
      this.http,
      `${this.baseUrl}/document-template-categories/${id}`,
      payload,
    ).pipe(tap((res) => this.invalidateAfterMutation(res)));
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/document-template-categories/${id}`).pipe(
      tap((res) => this.invalidateAfterMutation(res)),
    );
  }

  private toHttpParams(params: DocumentTemplateCategoryListParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return httpParams;
  }

  private listCacheKey(params: DocumentTemplateCategoryListParams): string {
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
