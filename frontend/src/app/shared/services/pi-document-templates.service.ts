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
 *   - `pageSize`: A3 | A4 | A5 (TZ-DOC-337 canon)
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
  categoryId?: string | { _id: string; name: string; slug: string };
  isDefault: boolean;
  isActive: boolean;
  pageSize: 'A3' | 'A4' | 'A5';
  /** Array of `/uploads/document-templates/{id}/{uuid}.{ext}` URLs (max 5 — Phase A.6). */
  backgroundImage: string[];
  defaultBackgroundIndex: number;
  backgroundOpacity: number;
  orientation: 'portrait' | 'landscape';
  /** Show page numbers in the generated document. */
  pageNumbering?: boolean;
  /**
   * TZ-DOC-311: LEGACY — not used by the builder UI anymore.
   * Kept in the type (and DB schema) for backward compatibility with
   * templates created before TZ-DOC-311; the builder no longer renders
   * or sends these fields.
   */
  tableOfContents?: boolean;
  headerText?: string;
  footerText?: string;
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
export interface BuildPreviewLine {
  lineKind?: 'catalog' | 'custom' | 'module' | 'material';
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productSku?: string;
  photoUrl?: string;
  unit?: string;
  discountPercent?: number;
  isOptional?: boolean;
  rowPresentation?: {
    density?: 'auto' | 'compact' | 'large';
    emphasis?: 'normal' | 'accent';
    separatorBefore?: boolean;
    pageBreakBefore?: boolean;
    showDescription?: boolean;
    photoFit?: 'inherit' | 'contain' | 'cover';
  };
}

export interface BuildTableLayoutColumn {
  key: string;
  visible?: boolean;
  widthPercent?: number;
}

export interface BuildTableChrome {
  borderWeight?: 'thin' | 'normal' | 'thick';
  headerWeight?: 'normal' | 'bold';
}

export interface BuildSheetLayout {
  rowsFirstPage?: number;
  rowsNextPage?: number;
  photoScalePercent?: number;
  photoCropYPercent?: number;
  showPhotoColumn?: boolean;
}

export interface BuildTerm {
  text: string;
  sortOrder: number;
}

export interface BuildDealTotals {
  vatPercent: number;
  discountType?: 'none' | 'percent' | 'amount';
  discountPercent?: number;
  discountAmount?: number;
  prepaymentPercent?: number;
  productionDays?: number;
  deliveryDays?: number;
}

export interface BuildDocumentRequest {
  previewLines?: BuildPreviewLine[];
  tableLayout?: BuildTableLayoutColumn[];
  tableChrome?: BuildTableChrome;
  sheetLayout?: BuildSheetLayout;
  terms?: BuildTerm[];
  /** Request-only selected live table-template target for multi-table documents. */
  tableTargetId?: string;
  dealTotals?: BuildDealTotals;
  organizationId?: string;
  counterpartyId?: string;
  contactPersonId?: string;
  siteId?: string;
  productId?: string;
  materialId?: string;
  workTypeId?: string;
  orderId?: string;
  quotationId?: string;
  invoiceId?: string;
  contractId?: string;
  proposalNumber?: string;
  proposalDate?: string;
  validUntil?: string;
  totalPrice?: number;
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
  /** Present when API returns it; FE heals to 0 on first upload if omitted. */
  defaultBackgroundIndex?: number;
}

export interface DocumentTypeOption {
  _id: string;
  name: string;
}

export interface OrganizationOption {
  _id: string;
  name: string;
}

export interface OrganizationsSetupResponse {
  items: OrganizationOption[];
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
    if (params.isDefault !== undefined)
      httpParams = httpParams.set('isDefault', String(params.isDefault));
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<DocumentTemplate[]>(this.http, `${this.baseUrl}/document-templates`, {
      params: httpParams,
    }).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = (res.data ?? []) as DocumentTemplate[];
        return { ok: true as const, data: { items: arr, total: arr.length } };
      }),
    );
  }

  findById(id: string): Observable<SilentResult<DocumentTemplate>> {
    return silentGet<DocumentTemplate>(this.http, `${this.baseUrl}/document-templates/${id}`);
  }

  create(payload: Partial<DocumentTemplate>): Observable<SilentResult<DocumentTemplate>> {
    return silentPost<DocumentTemplate>(this.http, `${this.baseUrl}/document-templates`, payload);
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
    return silentDelete<void>(this.http, `${this.baseUrl}/document-templates/${id}`);
  }

  setDefault(id: string): Observable<SilentResult<void>> {
    return silentPost<void>(this.http, `${this.baseUrl}/document-templates/${id}/set-default`, {});
  }

  duplicate(id: string): Observable<SilentResult<DocumentTemplate>> {
    return silentPost<DocumentTemplate>(
      this.http,
      `${this.baseUrl}/document-templates/${id}/duplicate`,
      {},
    );
  }

  listOrganizations(): Observable<SilentResult<OrganizationsSetupResponse>> {
    return silentGet<OrganizationsSetupResponse>(
      this.http,
      `${this.baseUrl}/organizations?limit=1`,
    );
  }

  createOrganization(payload: {
    name: string;
    shortName: string;
    inn: string;
    isActive: boolean;
  }): Observable<SilentResult<OrganizationOption>> {
    return silentPost<OrganizationOption>(this.http, `${this.baseUrl}/organizations`, payload);
  }

  listDocTypes(): Observable<SilentResult<DocumentTypeOption[]>> {
    return silentGet<DocumentTypeOption[]>(this.http, `${this.baseUrl}/doc-types`);
  }

  createDocType(payload: {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
  }): Observable<SilentResult<DocumentTypeOption>> {
    return silentPost<DocumentTypeOption>(this.http, `${this.baseUrl}/doc-types`, payload);
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

  removeBackground(templateId: string, index: number): Observable<SilentResult<void>> {
    return silentWrap(
      this.http.delete<void>(
        `${this.baseUrl}/document-templates/${templateId}/backgrounds/${index}`,
      ),
    );
  }

  setDefaultBackground(templateId: string, index: number): Observable<SilentResult<void>> {
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
      this.http.patch<void>(`${this.baseUrl}/document-templates/${templateId}/orientation`, {
        orientation,
      }),
    );
  }
}
