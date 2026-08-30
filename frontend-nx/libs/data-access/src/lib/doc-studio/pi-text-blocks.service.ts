import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type { TextBlock, TextBlockPayload, TextBlocksListParams } from './text-block.types';

@Injectable({ providedIn: 'root' })
export class PiTextBlocksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  list(params: TextBlocksListParams = {}): Observable<SilentResult<TextBlock[]>> {
    let query = new HttpParams();
    if (params.categoryId) query = query.set('categoryId', params.categoryId);
    if (params.isActive !== undefined) query = query.set('isActive', String(params.isActive));
    return silentGet<TextBlock[]>(this.http, `${this.baseUrl}/text-blocks`, { params: query });
  }
  getById(id: string): Observable<SilentResult<TextBlock>> { return silentGet(this.http, `${this.baseUrl}/text-blocks/${id}`); }
  create(payload: TextBlockPayload): Observable<SilentResult<TextBlock>> { return silentPost(this.http, `${this.baseUrl}/text-blocks`, payload); }
  update(id: string, payload: TextBlockPayload): Observable<SilentResult<TextBlock>> { return silentPatch(this.http, `${this.baseUrl}/text-blocks/${id}`, payload); }
  remove(id: string): Observable<SilentResult<void>> { return silentDelete(this.http, `${this.baseUrl}/text-blocks/${id}`); }
}
