import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';

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
 */
@Injectable({ providedIn: 'root' })
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Multipart upload. Returns the persisted Photo with _id + storageUrl. */
  upload(file: File): Observable<Photo> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<Photo>(`${this.baseUrl}/photos/upload`, form);
  }

  /** List all photos (admin/manager). Used to resolve photoIds → URLs. */
  list(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/photos`);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/photos/${id}`);
  }
}
