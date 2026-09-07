/** Mirrors `backend/src/modules/photo/photo.schema.ts` + legacy `frontend/src/app/shared/services/photos.service.ts`. */

/** Прямоугольный кадр показа (TZ-PHOTO-304); отсутствует = contain/center. */
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
  frame?: PhotoFrame;
  createdAt?: string;
}

/** Populated photo refs on catalog entities accept id or object (list populate). */
export type PhotoRef = string | Record<string, unknown>;
