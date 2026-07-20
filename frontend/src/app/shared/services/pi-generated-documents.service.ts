import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentDelete, silentGet, silentPost, SilentResult } from '../../core/silent-http';
import type { BuildDocumentRequest } from './pi-document-templates.service';

export type GeneratedDocumentSourceType = 'order' | 'contract' | 'manual';
export type GeneratedDocumentStatus = 'draft' | 'final';

export interface GeneratedDocument {
  _id: string;
  number: string;
  name: string;
  templateId: string;
  templateName?: string;
  sourceType: GeneratedDocumentSourceType;
  sourceId?: string;
  organizationId?: string;
  html: string;
  buildPayload?: BuildDocumentRequest;
  status: GeneratedDocumentStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateDocumentRequest extends BuildDocumentRequest {
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class GeneratedDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params?: {
    templateId?: string;
    sourceType?: string;
    sourceId?: string;
  }): Observable<SilentResult<GeneratedDocument[]>> {
    let httpParams = new HttpParams();
    if (params?.templateId) httpParams = httpParams.set('templateId', params.templateId);
    if (params?.sourceType) httpParams = httpParams.set('sourceType', params.sourceType);
    if (params?.sourceId) httpParams = httpParams.set('sourceId', params.sourceId);
    return silentGet<GeneratedDocument[]>(this.http, `${this.baseUrl}/generated-documents`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<GeneratedDocument>> {
    return silentGet<GeneratedDocument>(this.http, `${this.baseUrl}/generated-documents/${id}`);
  }

  generate(
    templateId: string,
    payload: GenerateDocumentRequest,
  ): Observable<SilentResult<GeneratedDocument>> {
    return silentPost<GeneratedDocument>(
      this.http,
      `${this.baseUrl}/generated-documents/from-template/${templateId}`,
      payload,
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/generated-documents/${id}`);
  }

  /** Fetch HTML with auth interceptor and open in a new tab. */
  openHtml(id: string): Observable<void> {
    return this.http
      .get(`${this.baseUrl}/generated-documents/${id}/html`, { responseType: 'text' })
      .pipe(
        tap((html) => {
          const w = window.open('', '_blank');
          if (w) {
            w.document.write(html);
            w.document.close();
          }
        }),
        map(() => undefined),
      );
  }
}
