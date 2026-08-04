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
import { Material } from './materials.service';
import { WorkType } from './pi-work-types.service';

// ─── Types ────────────────────────────────────────────────────────────────

/** Габариты самого модуля (мм/см/м — единицы измерения через `unit`). */
export interface ProductModuleDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: string;
}

/**
 * Один материал в составе модуля. TZ-83 §2.3 — ref + override subdoc:
 * базовые свойства тянутся через `materialId` ref, override — локальные.
 */
export interface MaterialInModule {
  /** `materialId` может быть строкой (unpopulated) или полным Material (populated backend). */
  materialId: string | Material;
  quantity: number;
  unit?: string;
  isPurchased: boolean;
  /** Override локальный для этого модуля. Если undefined — UI fallback на material.dimensions. */
  overrideDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  sortOrder: number;
}

/**
 * Вид работы в составе модуля. Backend populate `workTypeId`.
 * `estimatedHours` — норматив часов на единицу продукции.
 */
export interface WorkTypeInModule {
  workTypeId: string | WorkType;
  estimatedHours: number;
  sortOrder: number;
}

export interface ProductModule {
  _id: string;
  name: string;
  article?: string;
  dimensions?: ProductModuleDimensions;
  weight?: number;
  sortOrder?: number;
  workTypes: WorkTypeInModule[];
  materials: MaterialInModule[];
  /**
   * Канонический состав модуля (TZ-CATALOG-302/317). Dual-read: непустой
   * `composition` имеет приоритет над legacy `materials[]` (зеркало backend).
   */
  composition?: CompositionLine[];
  createdAt?: string;
  updatedAt?: string;
}

/** Composition override-габариты (локальные для линии, не material.dimensions). */
export interface CompositionOverrideDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

/** Одна строка состава (TZ-CATALOG-302): lineType=module | material. `_id` — id линии для CRUD. */
export interface CompositionLine {
  _id: string;
  lineType: 'module' | 'material';
  /** Id ссылки: ProductModule (module) или Material (material). Backend НЕ populate — строка ObjectId. */
  refId: string;
  quantity: number;
  sortOrder: number;
  unit?: string;
  overrideDimensions?: CompositionOverrideDimensions;
  isPurchased?: boolean;
  sourcePosition?: string;
  sourceCode?: string;
  notes?: string;
}

/** Body для POST /products/:id/composition и /modules/:id/composition. */
export interface CompositionLineUpsertDto {
  lineType: 'module' | 'material';
  refId: string;
  quantity: number;
  sortOrder?: number;
  unit?: string;
  overrideDimensions?: CompositionOverrideDimensions;
  isPurchased?: boolean;
  sourcePosition?: string;
  sourceCode?: string;
  notes?: string;
}

/** Body для PATCH .../composition/:lineId — все поля optional. */
export interface CompositionLineUpdateDto {
  lineType?: 'module' | 'material';
  refId?: string;
  quantity?: number;
  sortOrder?: number;
  unit?: string;
  overrideDimensions?: CompositionOverrideDimensions;
  isPurchased?: boolean;
  sourcePosition?: string;
  sourceCode?: string;
  notes?: string;
}

export interface ProductModuleUpsertDto {
  name: string;
  article?: string;
  dimensions?: ProductModuleDimensions;
  weight?: number;
  sortOrder?: number;
  workTypes?: WorkTypeInModule[];
  materials?: MaterialInModule[];
}

// ─── Service ──────────────────────────────────────────────────────────────

/**
 * TZ-83 Phase B + Phase D: ProductModulesService.
 *
 * Routes:
 *   GET    /modules?productId=X                → ProductModule[]
 *   GET    /modules/:id                        → ProductModule (populated)
 *   POST   /modules                            → ProductModule
 *   PATCH  /modules/:id                        → ProductModule
 *   DELETE /modules/:id                        → void
 *
 * Composition CRUD (TZ-CATALOG-302/317) — canonical composition writes:
 *   GET    /products/:id/composition          → CompositionLine[] (dual-read)
 *   POST   /products/:id/composition          → CompositionLine[]
 *   PATCH  /products/:id/composition/:lineId  → CompositionLine[]
 *   DELETE /products/:id/composition/:lineId  → void
 *   (идентично для /modules/:id/composition)
 *
 * Legacy atomic attach/detach (`/products/:id/modules`) is DEPRECATED and
 * throws (TZ-CATALOG-317) — UI must use composition endpoints.
 *
 * Modules populate `materials.materialId` for UI direct-render (no second GET).
 * Backend also populates `workTypes.workTypeId` per service.findAll/findById.
 */
@Injectable({ providedIn: 'root' })
export class ProductModulesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(productId?: string): Observable<SilentResult<ProductModule[]>> {
    let httpParams = new HttpParams();
    if (productId) httpParams = httpParams.set('productId', productId);
    return silentGet<ProductModule[]>(this.http, `${this.baseUrl}/modules`, { params: httpParams });
  }

  findById(id: string): Observable<SilentResult<ProductModule>> {
    return silentGet<ProductModule>(this.http, `${this.baseUrl}/modules/${id}`);
  }

  create(payload: ProductModuleUpsertDto): Observable<SilentResult<ProductModule>> {
    return silentPost<ProductModule>(this.http, `${this.baseUrl}/modules`, payload);
  }

  update(
    id: string,
    payload: Partial<ProductModuleUpsertDto>,
  ): Observable<SilentResult<ProductModule>> {
    return silentPatch<ProductModule>(this.http, `${this.baseUrl}/modules/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/modules/${id}`);
  }

  /**
   * @deprecated TZ-CATALOG-317 — use `getProductComposition` / `addProductCompositionLine`.
   * Legacy atomic attach endpoint `/products/:id/modules` is being phased out
   * (TZ-CATALOG-304 will reject legacy writes). Kept as a throwing stub so any
   * leftover call site fails loudly instead of silently writing legacy data.
   */
  attachToProduct(_productId: string, _moduleId: string): Observable<SilentResult<unknown>> {
    throw new Error(
      'attachToProduct is deprecated (TZ-CATALOG-317): use addProductCompositionLine() instead',
    );
  }

  /**
   * @deprecated TZ-CATALOG-317 — use `removeProductCompositionLine`.
   * Legacy atomic detach endpoint is being phased out (TZ-CATALOG-304).
   */
  detachFromProduct(_productId: string, _moduleId: string): Observable<SilentResult<void>> {
    throw new Error(
      'detachFromProduct is deprecated (TZ-CATALOG-317): use removeProductCompositionLine() instead',
    );
  }

  // ─── Composition CRUD (TZ-CATALOG-302/317) ──────────────────────────

  /**
   * Dual-read GET: returns `composition[]` if non-empty, otherwise the legacy
   * mapping (productModuleIds / module.materials) mirrored as lines — so the UI
   * can render pre- and post-migration data identically.
   */
  getProductComposition(productId: string): Observable<SilentResult<CompositionLine[]>> {
    return silentGet<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/products/${productId}/composition`,
    );
  }

  /** POST /products/:id/composition — adds/upserts a line; returns full composition. */
  addProductCompositionLine(
    productId: string,
    dto: CompositionLineUpsertDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPost<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/products/${productId}/composition`,
      dto,
    );
  }

  /** PATCH /products/:id/composition/:lineId — updates a line (e.g. quantity). */
  updateProductCompositionLine(
    productId: string,
    lineId: string,
    dto: CompositionLineUpdateDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPatch<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/products/${productId}/composition/${lineId}`,
      dto,
    );
  }

  /** DELETE /products/:id/composition/:lineId — removes a line. */
  removeProductCompositionLine(productId: string, lineId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(
      this.http,
      `${this.baseUrl}/products/${productId}/composition/${lineId}`,
    );
  }

  getModuleComposition(moduleId: string): Observable<SilentResult<CompositionLine[]>> {
    return silentGet<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/modules/${moduleId}/composition`,
    );
  }

  addModuleCompositionLine(
    moduleId: string,
    dto: CompositionLineUpsertDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPost<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/modules/${moduleId}/composition`,
      dto,
    );
  }

  updateModuleCompositionLine(
    moduleId: string,
    lineId: string,
    dto: CompositionLineUpdateDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPatch<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/modules/${moduleId}/composition/${lineId}`,
      dto,
    );
  }

  removeModuleCompositionLine(moduleId: string, lineId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(
      this.http,
      `${this.baseUrl}/modules/${moduleId}/composition/${lineId}`,
    );
  }
}
