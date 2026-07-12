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

export interface ProductModulePhoto {
  _id: string;
  productModuleId: string;
  /** backend populates `photoId` as full Photo object. */
  photoId?: string | Photo;
  /** alternative to photoId — direct URL (CDN, external). */
  url?: string;
  caption?: string;
  isMain: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface ProductModulePhotoUpsertDto {
  productModuleId: string;
  photoId?: string;
  url?: string;
  caption?: string;
  isMain?: boolean;
  sortOrder?: number;
}

/**
 * TZ-83 Phase B: ProductModulePhotoService.
 *
 * Routes:
 *   GET   /product-module-photos?productModuleId=X        → ProductModulePhoto[] (populated photoId)
 *   POST  /product-module-photos                          → ProductModulePhoto (auto-demotes others if isMain)
 *   POST  /product-module-photos/:id/main                 → { ok: true } (atomic setMain)
 *   PATCH /product-module-photos/:id                      → ProductModulePhoto (IS MAIN strip — use /:id/main instead)
 *   DELETE/product-module-photos/:id                      → void
 *
 * Atomicity contract:
 *   `setMain(id)` demotes all other `isMain=true` photos for the same
 *   moduleId BEFORE marking this one. Not transactional in a strict
 *   MongoDB sense (no session.withTransaction), but for single-doc
 *   updates the race window is microseconds and acceptable per TZ-83 §5.
 *
 * Schema validation:
 *   pre-save hook on `ProductModulePhotoSchema` REJECTS docs without
 *   either photoId or url. Server returns 400 on attempt.
 */
@Injectable({ providedIn: 'root' })
export class ProductModulePhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(productModuleId: string): Observable<SilentResult<ProductModulePhoto[]>> {
    const params = new HttpParams().set('productModuleId', productModuleId);
    return silentGet<ProductModulePhoto[]>(this.http, `${this.baseUrl}/product-module-photos`, { params });
  }

  attach(dto: ProductModulePhotoUpsertDto): Observable<SilentResult<ProductModulePhoto>> {
    return silentPost<ProductModulePhoto>(this.http, `${this.baseUrl}/product-module-photos`, dto);
  }

  /**
   * Atomic setMain. Returns `{ ok: true }` (not the doc — rechecks list separately
   * to avoid re-fetching all photos). Use `list()` after to refresh.
   */
  setMain(id: string): Observable<SilentResult<{ ok: true }>> {
    return silentPost<{ ok: true }>(this.http, `${this.baseUrl}/product-module-photos/${id}/main`, {});
  }

  /**
   * PATCH for caption/sortOrder/url ONLY. Strips `isMain` on the server side
   * (preventing accidental demotion — see product-module-photo.service.ts update()
   * comment for rationale). To change main, use `setMain()` on the desired photo.
   */
  update(
    id: string,
    dto: Partial<Omit<ProductModulePhotoUpsertDto, 'productModuleId' | 'isMain'>>,
  ): Observable<SilentResult<ProductModulePhoto>> {
    return silentPatch<ProductModulePhoto>(this.http, `${this.baseUrl}/product-module-photos/${id}`, dto);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/product-module-photos/${id}`);
  }
}
