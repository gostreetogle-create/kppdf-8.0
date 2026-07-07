import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentDelete, silentGet, silentPost, SilentResult } from '../../core/silent-http';

export interface Photo {
  _id: string;
  storageUrl: string;
  originalFilename?: string;
  variant?: 'original' | 'full' | 'medium' | 'thumb';
  mimeType?: string;
  sizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
  alt?: string;
  createdAt?: string;
}

/**
 * PhotosService — wraps backend `PhotosController` for material form
 * multi-upload + main photo selection.
 *
 * Upload uses multipart FormData (field name: `file`). The backend
 * (NestJS + Multer) stores files in `./uploads/{uuid}.{ext}` and
 * returns a Photo record with `storageUrl: '/uploads/{filename}'`.
 *
 * All methods return `Observable<SilentResult<Photo>>` (see
 * `frontend/src/app/core/silent-http.ts`) so the observable never
 * errors — RxJS's global unhandled-error log is suppressed, and
 * consumers use a single `.subscribe((res) => res.ok ? … : …)`
 * callback. Per-file upload errors are surfaced as `res.ok === false`
 * in the consumer's `forkJoin` (see `material-form-dialog.component.ts`).
 */
@Injectable({ providedIn: 'root' })
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Multipart upload. Returns the persisted Photo with _id + storageUrl. */
  upload(file: File): Observable<SilentResult<Photo>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentPost<Photo>(this.http, `${this.baseUrl}/photos/upload`, form);
  }

  /** List all photos (admin/manager). Used to resolve photoIds → URLs. */
  list(): Observable<SilentResult<Photo[]>> {
    return silentGet<Photo[]>(this.http, `${this.baseUrl}/photos`);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/photos/${id}`);
  }
}
