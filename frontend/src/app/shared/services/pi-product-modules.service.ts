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
  createdAt?: string;
  updatedAt?: string;
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
 * Atomic product↔module endpoints (TZ-83 § D.3):
 *   POST   /products/:productId/modules  body={moduleId}                → Product (populated)
 *   DELETE /products/:productId/modules/:moduleId                       → void
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
   * Atomic attach: `$addToSet` on backend — race-safe, idempotent.
   * Returns the populated product so the UI can refresh the modules
   * section without a second GET.
   */
  attachToProduct(productId: string, moduleId: string): Observable<SilentResult<unknown>> {
    return silentPost<unknown>(this.http, `${this.baseUrl}/products/${productId}/modules`, {
      moduleId,
    });
  }

  detachFromProduct(productId: string, moduleId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(
      this.http,
      `${this.baseUrl}/products/${productId}/modules/${moduleId}`,
    );
  }
}
