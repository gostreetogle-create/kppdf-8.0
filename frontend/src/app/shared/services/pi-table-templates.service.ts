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
 * TZ-86 Phase B.2 — TableTemplate mirror of backend `TableTemplate` schema
 * (`backend/src/modules/table-template/table-template.schema.ts`).
 *
 * User-saved column presets composable into document templates via the
 * constructor canvas («Таблицы» tab). Distinct from `DocumentTableType`
 * (meta-classifier — branch-level shape taxonomy, no FK link here).
 *
 * Each `column.type` drives cell rendering in preview:
 *   - 'text'     → plain string
 *   - 'number'   → Intl.NumberFormat('ru-RU')
 *   - 'currency' → Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
 *   - 'date'     → toLocaleDateString('ru-RU')
 *   - 'bool'     → 'Да' / 'Нет'
 */
export type ColumnType = 'text' | 'number' | 'date' | 'currency' | 'bool';

export type TableTemplateCategory =
  'product-spec' | 'cost-calc' | 'order-summary' | 'price-list' | 'custom';

export interface TableColumn {
  /** Stable camelCase identifier — used as dataBinding.field cache. */
  key: string;
  /** Russian human-readable column header. */
  label: string;
  type: ColumnType;
  /** CSS-safe width hint in % (frontend applies via inline style). */
  width: number;
  align: 'left' | 'center' | 'right';
  /** Optional formatter override (e.g. '#,##0.00' for numbers). */
  format?: string;
}

export interface TableTemplate {
  _id: string;
  name: string;
  description?: string;
  category?: TableTemplateCategory;
  sortOrder: number;
  columns: TableColumn[];
  sampleRows?: unknown[][];
  isActive: boolean;
  /** Foreign key string pinned to RegistryController.getDataSources() key. */
  dataSource?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableTemplateListResponse {
  items: TableTemplate[];
  total: number;
}

export interface TableTemplateListParams {
  category?: TableTemplateCategory;
  dataSource?: string;
  activeOnly?: boolean;
  search?: string;
}

/**
 * TZ-86 Phase B.2 — TableTemplatesService.
 *
 * Routes:
 *   GET    /table-templates              → TableTemplate[]
 *   GET    /table-templates/:id          → TableTemplate
 *   GET    /table-templates/:id/preview  → text/html (inline-rendered sample-table)
 *   POST   /table-templates              → TableTemplate
 *   PATCH  /table-templates/:id          → TableTemplate
 *   DELETE /table-templates/:id          → void
 *
 * Preview route returns raw `text/html` (NOT SilentResult-wrapped envelope)
 * because the response shape is fundamentally different (HTML string vs JSON
 * DTO). Wrapped via `silentWrap` directly so the caller can `.subscribe((r)
 * => r.ok ? setHtml(r.data) : …)` exactly as other services — one consumer
 * pattern, two response shapes via silentWrap's generic `T`.
 */
@Injectable({ providedIn: 'root' })
export class TableTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: TableTemplateListParams = {}): Observable<SilentResult<TableTemplateListResponse>> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.dataSource) httpParams = httpParams.set('dataSource', params.dataSource);
    if (params.activeOnly) httpParams = httpParams.set('activeOnly', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<TableTemplate[]>(this.http, `${this.baseUrl}/table-templates`, {
      params: httpParams,
    }).pipe(
      map((res) => {
        if (!res.ok) return res;
        const arr = (res.data ?? []) as TableTemplate[];
        const items = params.activeOnly ? arr.filter((t) => t.isActive) : arr;
        return { ok: true as const, data: { items, total: items.length } };
      }),
    );
  }

  findById(id: string): Observable<SilentResult<TableTemplate>> {
    return silentGet<TableTemplate>(this.http, `${this.baseUrl}/table-templates/${id}`);
  }

  /**
   * TZ-86 §2.6 — preview endpoint returns inline HTML table (sample-data rendered).
   * Used by Phase C.2 dialog «Sample data preview» pane to give the user immediate
   * feedback on how their column-type/format choices render.
   */
  preview(id: string): Observable<SilentResult<string>> {
    return silentWrap(
      this.http.get(`${this.baseUrl}/table-templates/${id}/preview`, { responseType: 'text' }),
    );
  }

  create(payload: Partial<TableTemplate>): Observable<SilentResult<TableTemplate>> {
    return silentPost<TableTemplate>(this.http, `${this.baseUrl}/table-templates`, payload);
  }

  update(id: string, payload: Partial<TableTemplate>): Observable<SilentResult<TableTemplate>> {
    return silentPatch<TableTemplate>(this.http, `${this.baseUrl}/table-templates/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/table-templates/${id}`);
  }
}
