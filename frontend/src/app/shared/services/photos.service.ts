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

@Injectable({ providedIn: 'root' })
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  upload(file: File): Observable<SilentResult<Photo>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentPost<Photo>(this.http, `${this.baseUrl}/photos/upload`, form);
  }

  list(): Observable<SilentResult<Photo[]>> {
    return silentGet<Photo[]>(this.http, `${this.baseUrl}/photos`);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/photos/${id}`);
  }
}
