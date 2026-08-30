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
import type {
  CreateStudioDocumentPayload,
  StudioDocument,
  UpdateStudioDocumentPayload,
} from './studio-document.types';

@Injectable({ providedIn: 'root' })
export class PiStudioDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<StudioDocument[]>> {
    return silentGet<StudioDocument[]>(this.http, `${this.baseUrl}/studio-documents`);
  }

  getById(id: string): Observable<SilentResult<StudioDocument>> {
    return silentGet<StudioDocument>(this.http, `${this.baseUrl}/studio-documents/${id}`);
  }

  create(payload: CreateStudioDocumentPayload): Observable<SilentResult<StudioDocument>> {
    return silentPost<StudioDocument>(this.http, `${this.baseUrl}/studio-documents`, payload);
  }

  update(id: string, payload: UpdateStudioDocumentPayload): Observable<SilentResult<StudioDocument>> {
    return silentPatch<StudioDocument>(this.http, `${this.baseUrl}/studio-documents/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/studio-documents/${id}`);
  }

  preview(id: string): Observable<SilentResult<{ html: string; revision: number }>> {
    return silentPost<{ html: string; revision: number }>(
      this.http,
      `${this.baseUrl}/studio-documents/${id}/preview`,
      {},
    );
  }

  saveAsTemplate(
    id: string,
    payload: { name: string; keepDataBindings?: boolean },
  ): Observable<SilentResult<{ _id: string; name: string }>> {
    return silentPost<{ _id: string; name: string }>(
      this.http,
      `${this.baseUrl}/studio-documents/${id}/save-as-template`,
      payload,
    );
  }

  duplicate(id: string): Observable<SilentResult<StudioDocument>> {
    return silentPost<StudioDocument>(this.http, `${this.baseUrl}/studio-documents/${id}/duplicate`, {});
  }

  finalize(
    id: string,
  ): Observable<SilentResult<{ generatedDocument: Record<string, unknown>; studioDocument: StudioDocument }>> {
    return silentPost<{ generatedDocument: Record<string, unknown>; studioDocument: StudioDocument }>(
      this.http,
      `${this.baseUrl}/studio-documents/${id}/finalize`,
      {},
    );
  }

  /** Raw blob, not the SilentResult<T> convention -- a PDF binary doesn't fit it. Caller handles errors. */
  downloadPdf(id: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/studio-documents/${id}/pdf`, {}, { responseType: 'blob' });
  }
}
