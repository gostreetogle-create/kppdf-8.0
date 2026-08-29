import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const STUDIO_DOCUMENT_REVISION_CONFLICT = 'STUDIO_DOCUMENT_REVISION_CONFLICT';

export type StudioDocumentStatus = 'draft' | 'frozen' | 'final';

export interface StudioDocument {
  _id: string;
  name: string;
  organizationId: string;
  docTypeId?: string;
  sourceTemplateId?: string;
  status: StudioDocumentStatus;
  revision: number;
  pageSize: 'A3' | 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
  manualPageCount?: number;
  pageNumbering?: boolean;
  backgroundImage?: string[];
  defaultBackgroundIndex?: number;
  backgroundOpacity?: number;
  context?: Record<string, unknown>;
  dataAnchors?: Record<string, unknown>[];
  dataSets?: Record<string, unknown>[];
  updatedAt?: string;
}

export interface PutStudioDataSetPayload {
  expectedRevision: number;
  dataSet: Record<string, unknown>;
}

export interface CreateStudioDocumentPayload {
  name: string;
  docTypeId?: string;
  pageSize?: 'A3' | 'A4' | 'A5';
  orientation?: 'portrait' | 'landscape';
}

export interface UpdateStudioDocumentPayload {
  expectedRevision: number;
  name?: string;
  status?: StudioDocumentStatus;
  docTypeId?: string;
  sourceTemplateId?: string;
  context?: Record<string, unknown>;
  manualPageCount?: number;
  pageNumbering?: boolean;
  defaultBackgroundIndex?: number;
}

export interface SaveAsTemplatePayload {
  name: string;
  keepDataBindings?: boolean;
}

export interface SaveAsTemplateResult {
  _id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PiStudioDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/studio-documents';

  list(): Observable<StudioDocument[]> {
    return this.http.get<StudioDocument[]>(this.base);
  }

  get(id: string): Observable<StudioDocument> {
    return this.http.get<StudioDocument>(`${this.base}/${id}`);
  }

  create(payload: CreateStudioDocumentPayload): Observable<StudioDocument> {
    return this.http.post<StudioDocument>(this.base, payload);
  }

  createFromTemplate(templateId: string, name?: string): Observable<StudioDocument> {
    return this.http.post<StudioDocument>(`${this.base}/from-template`, {
      templateId,
      ...(name ? { name } : {}),
    });
  }

  duplicate(id: string): Observable<StudioDocument> {
    return this.http.post<StudioDocument>(`${this.base}/${id}/duplicate`, {});
  }

  saveAsTemplate(id: string, payload: SaveAsTemplatePayload): Observable<SaveAsTemplateResult> {
    return this.http.post<SaveAsTemplateResult>(`${this.base}/${id}/save-as-template`, payload);
  }

  patch(id: string, payload: UpdateStudioDocumentPayload): Observable<StudioDocument> {
    return this.http.patch<StudioDocument>(`${this.base}/${id}`, payload);
  }

  putDataSet(
    id: string,
    key: string,
    payload: PutStudioDataSetPayload,
  ): Observable<StudioDocument> {
    return this.http.put<StudioDocument>(
      `${this.base}/${id}/data-sets/${encodeURIComponent(key)}`,
      payload,
    );
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  preview(id: string): Observable<{ html: string; revision: number }> {
    return this.http.post<{ html: string; revision: number }>(`${this.base}/${id}/preview`, {});
  }

  finalize(id: string): Observable<{
    generatedDocument: Record<string, unknown>;
    studioDocument: StudioDocument;
  }> {
    return this.http.post<{
      generatedDocument: Record<string, unknown>;
      studioDocument: StudioDocument;
    }>(`${this.base}/${id}/finalize`, {});
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.post(`${this.base}/${id}/pdf`, {}, { responseType: 'blob' });
  }

  pdfUrl(id: string): string {
    return `${this.base}/${id}/pdf`;
  }
}
