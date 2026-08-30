import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, silentPatch, silentPost, type SilentResult } from '@kppdf/util-http';
import type { TableTemplate, TableTemplatePayload } from './table-template.types';

@Injectable({ providedIn: 'root' })
export class PiTableTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  list(): Observable<SilentResult<TableTemplate[]>> { return silentGet(this.http, `${this.baseUrl}/table-templates`); }
  getById(id: string): Observable<SilentResult<TableTemplate>> { return silentGet(this.http, `${this.baseUrl}/table-templates/${id}`); }
  create(payload: TableTemplatePayload): Observable<SilentResult<TableTemplate>> { return silentPost(this.http, `${this.baseUrl}/table-templates`, payload); }
  update(id: string, payload: TableTemplatePayload): Observable<SilentResult<TableTemplate>> { return silentPatch(this.http, `${this.baseUrl}/table-templates/${id}`, payload); }
  remove(id: string): Observable<SilentResult<void>> { return silentDelete(this.http, `${this.baseUrl}/table-templates/${id}`); }
}
