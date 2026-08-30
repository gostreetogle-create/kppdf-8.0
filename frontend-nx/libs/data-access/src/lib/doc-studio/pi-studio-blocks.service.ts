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
  CreateStudioBlockPayload,
  StudioBlock,
  UpdateStudioBlockLayoutsPayload,
  UpdateStudioBlockPayload,
} from './studio-block.types';

@Injectable({ providedIn: 'root' })
export class PiStudioBlocksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(documentId: string): Observable<SilentResult<StudioBlock[]>> {
    return silentGet<StudioBlock[]>(this.http, `${this.baseUrl}/studio-documents/${documentId}/blocks`);
  }

  create(documentId: string, payload: CreateStudioBlockPayload): Observable<SilentResult<StudioBlock>> {
    return silentPost<StudioBlock>(this.http, `${this.baseUrl}/studio-documents/${documentId}/blocks`, payload);
  }

  update(blockId: string, payload: UpdateStudioBlockPayload): Observable<SilentResult<StudioBlock>> {
    return silentPatch<StudioBlock>(this.http, `${this.baseUrl}/template-blocks/${blockId}`, payload);
  }

  remove(blockId: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/template-blocks/${blockId}`);
  }

  updateLayouts(documentId: string, payload: UpdateStudioBlockLayoutsPayload): Observable<SilentResult<StudioBlock[]>> {
    return silentPatch<StudioBlock[]>(this.http, `${this.baseUrl}/studio-documents/${documentId}/blocks/layouts`, payload);
  }

  uploadImage(blockId: string, file: File): Observable<SilentResult<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return silentPost<{ url: string }>(
      this.http,
      `${this.baseUrl}/template-blocks/${blockId}/image`,
      formData,
    );
  }
}
