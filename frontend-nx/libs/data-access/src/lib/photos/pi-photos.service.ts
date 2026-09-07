import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type { Photo, PhotoFrame } from './photos.types';

/**
 * Photos API (WAVE-NX-CATALOG-PHOTOS P0): multipart upload + frame patch.
 * Field name `file` mirrors `PhotoController.upload`. Organization scope
 * comes from JWT via `authInterceptor`. Presentational consumers own write
 * state — the dropzone never calls this service directly (B-PHOTO).
 */
@Injectable({ providedIn: 'root' })
export class PiPhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  upload(file: File): Observable<SilentResult<Photo>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentPost<Photo>(this.http, `${this.baseUrl}/photos/upload`, form);
  }

  get(id: string): Observable<SilentResult<Photo>> {
    return silentGet<Photo>(this.http, `${this.baseUrl}/photos/${id}`);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/photos/${id}`);
  }

  /** Сохранить кадр показа без перезагрузки файла (TZ-PHOTO-304). Частичный merge. */
  updateFrame(id: string, frame: Partial<PhotoFrame>): Observable<SilentResult<Photo>> {
    return silentPatch<Photo>(this.http, `${this.baseUrl}/photos/${id}/frame`, { frame });
  }
}
