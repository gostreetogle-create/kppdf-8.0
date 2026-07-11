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
 * TZ-86 Phase B.1 — TextBlock mirror of backend `TextBlock` schema
 * (`backend/src/modules/text-block/text-block.schema.ts`).
 *
 * Reusable free-text chunks composable into document templates via the
 * constructor canvas. Stored as CommonMark markdown; frontend parser
 * (markdown-it or marked) renders content at consumption time in
 * `/doc-constructor/texts/:id` preview (Phase C).
 *
 * Backend enforces slug uniqueness via Mongo unique index; duplicate-key
 * throws HttpException 409 → consumers should map `error.status === 409`
 * to a friendly inline-slug-exists message.
 */
export type TextBlockCategory = 'legal' | 'intro' | 'outro' | 'custom';

export interface TextBlock {
  _id: string;
  name: string;
  /** Unique kebab-case slug. Auto-generated if caller omits at create time. */
  slug: string;
  category: TextBlockCategory;
  tags: string[];
  /** CommonMark markdown (max 10000 chars per backend). */
  content: string;
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
