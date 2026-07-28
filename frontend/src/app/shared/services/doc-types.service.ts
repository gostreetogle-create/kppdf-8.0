import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
 * TZ-232.F — typed wrapper around `/api/doc-types` (`doc-type.controller.ts`).
 *
 * Schema: name (required), slug (required, unique), description?, isActive.
 * Source of truth: `backend/src/modules/doc-type/doc-type.schema.ts`.
 */
export interface DocType {
  _id: string;
  name: string;
  /** Required unique slug (e.g. 'kp', 'contract', 'act'). */
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocTypesListResponse {
  items: DocType[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Backend `DocTypeService.findAll` returns a flat `DocTypeDocument[]` (no
 * pagination). `list()` synthesizes the canonical `{items, total, page, limit}`
 * envelope from that flat array so the response shape matches `toEntityService`
 * expectations and the service is drop-in replaceable if the backend ever
 * adds server-side pagination.
 */
@Injectable({ providedIn: 'root' })
export class DocTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<DocTypesListResponse>> {
    return silentGet<DocType[]>(this.http, `${this.baseUrl}/doc-types`).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = res.data ?? [];
        return {
          ok: true as const,
          data: {
            items: arr,
            total: arr.length,
            page: 1,
            limit: Math.max(arr.length, 1),
          },
        };
      }),
    );
  }

  findById(id: string): Observable<SilentResult<DocType>> {
    return silentGet<DocType>(this.http, `${this.baseUrl}/doc-types/${id}`);
  }

  /**
   * Note: backend `CreateDocTypeDto` REQUIRES `name` and `slug`. The unique
   * index on `slug` means the caller must ensure the slug is unique system-wide
   * (use findBySlug first on real UIs; the templates page guard-falls-back to
   * auto-creating a "kp" slug only when the lookup returned an empty list).
   */
  create(payload: Partial<DocType>): Observable<SilentResult<DocType>> {
    return silentPost<DocType>(this.http, `${this.baseUrl}/doc-types`, payload);
  }

  update(
    id: string,
    payload: Partial<DocType>,
  ): Observable<SilentResult<DocType>> {
    return silentPatch<DocType>(this.http, `${this.baseUrl}/doc-types/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/doc-types/${id}`);
  }
}
