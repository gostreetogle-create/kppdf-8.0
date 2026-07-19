import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  silentWrap,
  SilentResult,
} from '../../core/silent-http';

/**
 * TZ-86 Phase B.3 — DocumentTemplate mirror of backend `DocumentTemplate`
 * schema (`backend/src/modules/document-template/document-template.schema.ts`)
 * + Phase A.4 `BuildDocumentDto` for the `:id/build` endpoint.
 *
 * DocumentTemplate represents a reusable document layout (KP/contract/akt),
 * parametrized by:
 *   - `organizationId`: our side (FK → Organization)
 *   - `docTypeId`: meta-classifier (FK → DocType — «КП» / «Договор» / «Акт»)
 *   - `pageSize`: A4 | A5 | Letter | Legal
 *   - `backgroundImage[]`: array of `/uploads/...` URLs (Phase A.6)
 *
 * Block composition (`TemplateBlock[]`) is NOT exposed on DocumentTemplate
 * — fetched separately via templateBlockService (Phase D, separate module).
 */

/**
 * Subdoc: identifies the OUR-side organisation on whose behalf the
 * document is issued. Backend populates this FK in `findAll`/`findById`
 * so consumers may receive either a string ID (unpopulated) OR the full
 * Organization object (populated). Use `PopulatedRef<T>` to express the
 * union in component templates.
 */
export interface DocumentTemplate {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  organizationId: string | { _id: string; name: string };
  docTypeId: string | { _id: string; name: string; code?: string };
  isDefault: boolean;
  isActive: boolean;
  pageSize: 'A4' | 'A5' | 'Letter' | 'Legal';
  /** Array of `/uploads/document-templates/{id}/{uuid}.{ext}` URLs (max 5 — Phase A.6). */
  backgroundImage: string[];
  defaultBackgroundIndex: number;
  backgroundOpacity: number;
  orientation: 'portrait' | 'landscape';
  version: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mirror of `BuildDocumentDto` (Phase A.4) — flat map of optional ObjectId
 * strings. Each is resolved server-side via parallel Mongoose findById into
 * a «bag» keyed by source label (`bag.organization`, `bag.counterparty`, …).
 * Empty/invalid IDs: silently skipped → block renders empty placeholder.
 */
export interface BuildDocumentRequest {
  organizationId?: string;
  counterpartyId?: string;
  productId?: string;
  materialId?: string;
  workTypeId?: string;
  orderId?: string;
  contractId?: string;
}

export interface DocumentTemplateListResponse {
  items: DocumentTemplate[];
  total: number;
}

export interface DocumentTemplateListParams {
  organizationId?: string;
  docTypeId?: string;
  isDefault?: boolean;
  search?: string;
}

export interface UploadBackgroundResponse {
  url: string;
  backgroundImage: string[];
}

/**
 * TZ-86 Phase B.3 — DocumentTemplatesService. Largest of the four TZ-86
 * services: 7 methods covering CRUD + build (HTML render) + upload-background
 * (multipart).
 *
 * Routes:
 *   GET    /document-templates                  → DocumentTemplate[]
 *   GET    /document-templates/:id              → DocumentTemplate
 *   POST   /document-templates                  → DocumentTemplate
 *   PATCH  /document-templates/:id              → DocumentTemplate
 *   DELETE /document-templates/:id              → void
 *   POST   /document-templates/:id/build        → text/html (server-rendered)
 *   POST   /document-templates/:id/upload-background (multipart, form field "file") → UploadBackgroundResponse
 */
@Injectable({ providedIn: 'root' })
export class DocumentTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    params: DocumentTemplateListParams = {},
  ): Observable<SilentResult<DocumentTemplateListResponse>> {
    let httpParams = new HttpParams();
    if (params.organizationId) httpParams = httpParams.set('organizationId', params.organizationId);
    if (params.docTypeId) httpParams = httpParams.set('docTypeId', params.docTypeId);
    if (params.isDefault !== undefined) httpParams = httpParams.set('isDefault', String(params.isDefault));
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<DocumentTemplate[]>(
      this.http,
      `${this.baseUrl}/document-templates`,
      { params: httpParams },
    ).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = (res.data ?? []) as DocumentTemplate[];
        return { ok: true as const, data: { items: arr, total: arr.length } };
      }),
    );
  }

  findById(id: string): Observable<SilentResult<DocumentTemplate>> {
    return silentGet<DocumentTemplate>(
      this.http,
      `${this.baseUrl}/document-templates/${id}`,
    );
  }

  create(
    payload: Partial<DocumentTemplate>,
  ): Observable<SilentResult<DocumentTemplate>> {
    return silentPost<DocumentTemplate>(
      this.http,
      `${this.baseUrl}/document-templates`,
      payload,
    );
  }

  update(
    id: string,
    payload: Partial<DocumentTemplate>,
  ): Observable<SilentResult<DocumentTemplate>> {
    return silentPatch<DocumentTemplate>(
      this.http,
      `${this.baseUrl}/document-templates/${id}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(
      this.http,
      `${this.baseUrl}/document-templates/${id}`,
    );
  }

  /**
   * TZ-86 §2.6 / Phase A.4 — server-side render of template using caller-supplied
   * sourceIds. Backend runs dataBinding-aware build() flow (parallel Mongoose
   * findById resolution → block content substitution → HTML assembly). Returns
   * raw text/html string. Wrapped via `silentWrap` directly (same convention
   * as TableTemplatesService.preview).
   */
  build(id: string, payload: BuildDocumentRequest): Observable<SilentResult<string>> {
    return silentWrap(
      this.http.post(`${this.baseUrl}/document-templates/${id}/build`, payload, {
        responseType: 'text',
      }),
    );
  }

  /**
   * TZ-86 Phase A.6 — multipart background image upload (≤ 5 MB, png|jpeg|webp).
   *
   * Uses raw `http.post(..., body, options)` (NOT `silentPost`) because the
   * request body is a FormData multipart, not a JSON payload — the
   * auth.interceptor must NOT rewrite the Content-Type (browser sets the
   * multipart boundary automatically). silentWrap converts HttpErrorResponse
   * into SilentResult; cookies/JWT flow through standard auth interceptor.
   *
   * Backend MulterExceptionFilter maps non-JSON errors to HTTP 413/400/500
   * shapes, all caught by silentWrap's catchError branch.
   */
  uploadBackground(
    templateId: string,
    file: File,
  ): Observable<SilentResult<UploadBackgroundResponse>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentWrap(
      this.http.post<UploadBackgroundResponse>(
        `${this.baseUrl}/document-templates/${templateId}/upload-background`,
        form,
      ),
    );
  }

  removeBackground(
    templateId: string,
    index: number,
  ): Observable<SilentResult<void>> {
    return silentWrap(
      this.http.delete<void>(
        `${this.baseUrl}/document-templates/${templateId}/backgrounds/${index}`,
      ),
    );
  }

  setDefaultBackground(
    templateId: string,
    index: number,
  ): Observable<SilentResult<void>> {
    return silentWrap(
      this.http.patch<void>(
        `${this.baseUrl}/document-templates/${templateId}/backgrounds/default`,
        { index },
      ),
    );
  }

  setOrientation(
    templateId: string,
    orientation: 'portrait' | 'landscape',
  ): Observable<SilentResult<void>> {
    return silentWrap(
      this.http.patch<void>(
        `${this.baseUrl}/document-templates/${templateId}/orientation`,
        { orientation },
      ),
    );
  }
}
