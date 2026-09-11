import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  TextBlockCategoriesListParams,
  TextBlockCategory,
  TextBlockCategoryPayload,
} from './text-block.types';

@Injectable({ providedIn: 'root' })
export class PiTextBlockCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: TextBlockCategoriesListParams = {}): Observable<SilentResult<TextBlockCategory[]>> {
    let query = new HttpParams();
    if (params.activeOnly) query = query.set('activeOnly', 'true');
    if (params.search) query = query.set('search', params.search);
    if (params.parentId) query = query.set('parentId', params.parentId);
    if (params.rootsOnly) query = query.set('rootsOnly', 'true');
    return silentGet<TextBlockCategory[]>(this.http, `${this.baseUrl}/text-block-categories`, { params: query });
  }

  getById(id: string): Observable<SilentResult<TextBlockCategory>> {
    return silentGet(this.http, `${this.baseUrl}/text-block-categories/${id}`);
  }

  create(payload: TextBlockCategoryPayload): Observable<SilentResult<TextBlockCategory>> {
    return silentPost(this.http, `${this.baseUrl}/text-block-categories`, payload);
  }

  update(id: string, payload: Partial<TextBlockCategoryPayload>): Observable<SilentResult<TextBlockCategory>> {
    return silentPatch(this.http, `${this.baseUrl}/text-block-categories/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete(this.http, `${this.baseUrl}/text-block-categories/${id}`);
  }
}
