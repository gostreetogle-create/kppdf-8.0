import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  normalizeError,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

export interface PhotoFrame {
  fit: 'contain' | 'cover';
  /** 0..100, CSS object-position % (горизонталь). */
  posX: number;
  /** 0..100, CSS object-position % (вертикаль). */
  posY: number;
}

export interface Photo {
  _id: string;
  storageUrl: string;
  originalFilename?: string;
  variant?: 'original' | 'full' | 'medium' | 'thumb';
  parentPhotoId?: string;
  linkedPhotoId?: string;
  mimeType?: string;
  sizeBytes?: number;
  widthPx?: number;
  heightPx?: number;
  alt?: string;
  /** Прямоугольный кадр показа (TZ-PHOTO-304); отсутствует = contain/center. */
  frame?: PhotoFrame;
  createdAt?: string;
}

export interface PhotoLike {
  _id?: string;
  storageUrl: string;
  variant?: Photo['variant'];
  parentPhotoId?: string;
  linkedPhotoId?: string;
}

/** Progress / terminal events for a single multipart upload. */
export type PhotoUploadEvent =
  | { type: 'progress'; percent: number | null }
  | { type: 'done'; photo: Photo }
  | { type: 'error'; error: HttpErrorResponse };

/** Select the cheapest suitable image for catalogue list/grid surfaces. */
export function photoListUrl(photo: PhotoLike, allPhotos: readonly PhotoLike[] = []): string {
  if (photo.variant === 'thumb') return photo.storageUrl;
  const linkedThumb = allPhotos.find(
    (candidate) =>
      candidate.variant === 'thumb' &&
      (candidate.parentPhotoId === photo._id || candidate.linkedPhotoId === photo._id),
  );
  return linkedThumb?.storageUrl ?? photo.storageUrl;
}

/**
 * Aggregate multi-file upload progress for form dialogs.
 * Emits `null` while the browser/proxy does not report totals (indeterminate UI).
 */
export function uploadPhotosWithProgress(
  service: PhotosService,
  files: File[],
  onProgress: (percent: number | null) => void,
): Observable<SilentResult<Photo>[]> {
  if (files.length === 0) return of([]);
  const progresses: Array<number | null> = files.map(() => null);
  const publish = (): void => {
    if (progresses.every((p) => p === null)) {
      onProgress(null);
      return;
    }
    const sum = progresses.reduce<number>((acc, p) => acc + (p ?? 0), 0);
    onProgress(Math.round(sum / files.length));
  };
  onProgress(null);
  return forkJoin(
    files.map((file, index) =>
      service.uploadWithProgress(file).pipe(
        tap((event) => {
          if (event.type === 'progress') {
            progresses[index] = event.percent;
            publish();
          }
        }),
        filter(
          (event): event is Extract<PhotoUploadEvent, { type: 'done' | 'error' }> =>
            event.type === 'done' || event.type === 'error',
        ),
        map((event): SilentResult<Photo> =>
          event.type === 'done'
            ? { ok: true, data: event.photo }
            : { ok: false, error: event.error },
        ),
      ),
    ),
  );
}

@Injectable({ providedIn: 'root' })
export class PhotosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Existing SilentResult upload — kept for callers that do not need progress. */
  upload(file: File): Observable<SilentResult<Photo>> {
    const form = new FormData();
    form.append('file', file, file.name);
    return silentPost<Photo>(this.http, `${this.baseUrl}/photos/upload`, form);
  }

  /**
   * Multipart upload with HttpClient progress events.
   * `percent` is null when `total` is unknown (indeterminate bar required).
   */
  uploadWithProgress(file: File): Observable<PhotoUploadEvent> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<Photo>(`${this.baseUrl}/photos/upload`, form, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: HttpEvent<Photo>): PhotoUploadEvent | null => {
          if (event.type === HttpEventType.UploadProgress) {
            const percent =
              event.total && event.total > 0
                ? Math.min(100, Math.round((100 * event.loaded) / event.total))
                : null;
            return { type: 'progress', percent };
          }
          if (event.type === HttpEventType.Response && event.body) {
            return { type: 'done', photo: event.body };
          }
          return null;
        }),
        filter((event): event is PhotoUploadEvent => event !== null),
        catchError((err: unknown) => of({ type: 'error' as const, error: normalizeError(err) })),
      );
  }

  list(): Observable<SilentResult<Photo[]>> {
    return silentGet<Photo[]>(this.http, `${this.baseUrl}/photos`);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/photos/${id}`);
  }

  /** Сохранить кадр показа без перезагрузки файла (TZ-PHOTO-304). Частичный merge. */
  updateFrame(id: string, frame: Partial<PhotoFrame>): Observable<SilentResult<Photo>> {
    return silentPatch<Photo>(this.http, `${this.baseUrl}/photos/${id}/frame`, { frame });
  }
}
