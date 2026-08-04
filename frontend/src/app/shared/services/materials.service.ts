import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';
import { Photo } from './photos.service';

export type MaterialDimensionType =
  'length' | 'width' | 'height' | 'thickness' | 'diameter' | 'depth';

export interface MaterialDimension {
  type: MaterialDimensionType;
  value: number;
  isImmutable?: boolean;
}

/**
 * Catalog leaf classification (TZ-CATALOG-301 backend contract).
 *
 * - `raw` — Сырьё (sheet/bar before any cutting).
 * - `part` — Деталь (manufactured cut/formed piece with assortment + dims).
 * - `fastener` — Метиз (bolts, nuts, washers, etc.).
 * - `purchased` — Покупное изделие (bought finished item, not manufactured).
 * - `other` — Default for legacy rows upgraded by the 301 migration; new
 *   rows should pick an explicit kind when possible so the UI badge is real.
 */
export const MATERIAL_KINDS = ['raw', 'part', 'fastener', 'purchased', 'other'] as const;
export type MaterialKind = (typeof MATERIAL_KINDS)[number];

/** Short Russian label per MaterialKind — used in UI lists / sort headers. */
export const MATERIAL_KIND_LABELS: Record<MaterialKind, string> = {
  raw: 'сырьё',
  part: 'деталь',
  fastener: 'метиз',
  purchased: 'покупное',
  other: 'другое',
};

export interface Material {
  _id: string;
  name: string;
  article?: string;
  sku?: string;
  unit: string;
  categoryId?: string;
  description?: string;
  pricePerUnit?: number;
  stockQty?: number;
  dimensions?: MaterialDimension[];
  photoIds?: string[];
  mainPhotoId?: string | Photo;
  supplierId?: string;
  notes?: string;
  /**
   * TZ-CATALOG-301 / 316: catalog leaf classification. Optional in FE —
   * legacy rows without kind are valid (server backfills to `other`);
   * FE displays "— не указан —" in edit dialog when missing.
   */
  materialKind?: MaterialKind | null;
  /** Assortment / профиль (труба, лист, уголок…). Free-text, optional. */
  assortment?: string;
  /** Стандарт / regulatory reference (ГОСТ, ASTM…). Free-text, optional. */
  standardRef?: string;
  /** Марка материала (Ст3, AISI 304…). Free-text, optional. */
  materialGrade?: string;
  /** Масса в килограммах. Server validates `min: 0`. */
  weightKg?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialsListResponse {
  items: Material[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialsListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  /** TZ-CATALOG-301: server-side filter `?materialKind=`. */
  materialKind?: MaterialKind;
}

@Injectable({ providedIn: 'root' })
export class MaterialsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: MaterialsListParams = {}): Observable<SilentResult<MaterialsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 50));
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.materialKind) httpParams = httpParams.set('materialKind', params.materialKind);
    return silentGet<MaterialsListResponse>(this.http, `${this.baseUrl}/materials`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<Material>> {
    return silentGet<Material>(this.http, `${this.baseUrl}/materials/${id}`);
  }

  create(payload: Partial<Material>): Observable<SilentResult<Material>> {
    return silentPost<Material>(this.http, `${this.baseUrl}/materials`, payload);
  }

  update(id: string, payload: Partial<Material>): Observable<SilentResult<Material>> {
    return silentPatch<Material>(this.http, `${this.baseUrl}/materials/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/materials/${id}`);
  }

  /**
   * TZ-MATERIALS-310: server-side clone of a material. The response is
   * the freshly-created `Material` document (the clone), and the page
   * opens the edit dialog on it so the user can amend photo selection,
   * tweak dimensions, etc., without losing the original.
   *
   * Backend POST /api/materials/:id/duplicate is role-gated
   * (admin/manager), so a 403 here surfaces as a `res.ok=false` and
   * the page shows the message via the toast. No silent fallback.
   */
  duplicate(id: string): Observable<SilentResult<Material>> {
    return silentPost<Material>(this.http, `${this.baseUrl}/materials/${id}/duplicate`, {});
  }
}
