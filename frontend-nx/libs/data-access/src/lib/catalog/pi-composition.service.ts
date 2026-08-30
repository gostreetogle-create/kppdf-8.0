import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  CompositionLine,
  CompositionLineUpdateDto,
  CompositionLineUpsertDto,
  CompositionTreeNode,
} from './composition.types';

/**
 * Composition read/write for ProductModule and Product (TZ-NX-REGISTRIES-COMPOSITION-DIALOG).
 * Canonical write path: `composition[]` endpoints only.
 */
@Injectable({ providedIn: 'root' })
export class PiCompositionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getModuleTree(moduleId: string, maxDepth?: number): Observable<SilentResult<CompositionTreeNode>> {
    return silentGet<CompositionTreeNode>(this.http, `${this.baseUrl}/modules/${moduleId}/tree`, {
      params: maxDepth == null ? undefined : new HttpParams().set('maxDepth', String(maxDepth)),
    });
  }

  getProductTree(productId: string, maxDepth?: number): Observable<SilentResult<CompositionTreeNode>> {
    return silentGet<CompositionTreeNode>(this.http, `${this.baseUrl}/products/${productId}/tree`, {
      params: maxDepth == null ? undefined : new HttpParams().set('maxDepth', String(maxDepth)),
    });
  }

  getModuleComposition(moduleId: string): Observable<SilentResult<CompositionLine[]>> {
    return silentGet<CompositionLine[]>(this.http, `${this.baseUrl}/modules/${moduleId}/composition`);
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
    return silentDelete<void>(this.http, `${this.baseUrl}/modules/${moduleId}/composition/${lineId}`);
  }

  getProductComposition(productId: string): Observable<SilentResult<CompositionLine[]>> {
    return silentGet<CompositionLine[]>(this.http, `${this.baseUrl}/products/${productId}/composition`);
  }

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

  removeProductCompositionLine(productId: string, lineId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/products/${productId}/composition/${lineId}`);
  }

  /** Деталь (Material kind=part) BOM of raw materials — TZ-NX-DETAIL-MATERIAL-BOM. */
  getMaterialTree(materialId: string, maxDepth?: number): Observable<SilentResult<CompositionTreeNode>> {
    return silentGet<CompositionTreeNode>(this.http, `${this.baseUrl}/materials/${materialId}/tree`, {
      params: maxDepth == null ? undefined : new HttpParams().set('maxDepth', String(maxDepth)),
    });
  }

  getMaterialComposition(materialId: string): Observable<SilentResult<CompositionLine[]>> {
    return silentGet<CompositionLine[]>(this.http, `${this.baseUrl}/materials/${materialId}/composition`);
  }

  addMaterialCompositionLine(
    materialId: string,
    dto: CompositionLineUpsertDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPost<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/materials/${materialId}/composition`,
      dto,
    );
  }

  updateMaterialCompositionLine(
    materialId: string,
    lineId: string,
    dto: CompositionLineUpdateDto,
  ): Observable<SilentResult<CompositionLine[]>> {
    return silentPatch<CompositionLine[]>(
      this.http,
      `${this.baseUrl}/materials/${materialId}/composition/${lineId}`,
      dto,
    );
  }

  removeMaterialCompositionLine(materialId: string, lineId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/materials/${materialId}/composition/${lineId}`);
  }
}
