import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

/**
 * TZ-86 Phase C — TextBlock (extended for visual constructor).
 *
 * Supports both simple HTML content and multi-column layouts.
 * `slug`, `category`, `tags`, `sortOrder` are optional (UI no longer exposes them).
 */
export type TextBlockCategory = 'legal' | 'intro' | 'outro' | 'custom';

export interface TextBlockColumn {
  id: string;
  content: string;
  width: number;
}

export interface TextBlock {
  _id: string;
  name: string;
  slug: string;
  category: TextBlockCategory;
  tags: string[];
  /** Simple content (HTML) — used for single-column blocks. */
  content?: string;
  /** Multi-column layout — when set, render columns instead of content. */
  columns?: TextBlockColumn[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TextBlockListResponse {
  items: TextBlock[];
  total: number;
}

export interface TextBlockListParams {
  /** Optional filter: only return blocks from this category (used by canvas tab). */
  category?: TextBlockCategory;
  /** If true, server-side: only return isActive=true. */
  activeOnly?: boolean;
  /** Free-text search across name + slug + content (backend route param if implemented). */
  search?: string;
}

/**
 * TZ-86 Phase B.1 — TextBlocksService.
 *
 * Routes:
 *   GET    /text-blocks              → TextBlock[] (raw, server-side paginated)
 *   GET    /text-blocks/:id          → TextBlock
 *   POST   /text-blocks              → TextBlock (slug auto-generated if absent)
 *   PATCH  /text-blocks/:id          → TextBlock
 *   DELETE /text-blocks/:id          → void
 *
 * Backend `findAll` returns raw array; we wrap as { items, total } envelope
 * for parity with WorkTypesService / CounterpartyService listShape.
 */
@Injectable({ providedIn: 'root' })
export class TextBlocksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: TextBlockListParams = {},
  ): Observable<SilentResult<TextBlockListResponse>> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<TextBlock[]>(this.http, `${this.baseUrl}/text-blocks`, { params: httpParams }).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = (res.data ?? []) as TextBlock[];
        const items = params.activeOnly ? arr.filter((b) => b.isActive) : arr;
        return { ok: true as const, data: { items, total: items.length } };
      }),
    );
  }

  findById(id: string): Observable<SilentResult<TextBlock>> {
    return silentGet<TextBlock>(this.http, `${this.baseUrl}/text-blocks/${id}`);
  }

  create(payload: Partial<TextBlock>): Observable<SilentResult<TextBlock>> {
    return silentPost<TextBlock>(this.http, `${this.baseUrl}/text-blocks`, payload);
  }

  update(id: string, payload: Partial<TextBlock>): Observable<SilentResult<TextBlock>> {
    return silentPatch<TextBlock>(
      this.http,
      `${this.baseUrl}/text-blocks/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/text-blocks/${id}`);
  }
}
