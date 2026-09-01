import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentDelete, silentGet, type SilentResult } from '@kppdf/util-http';
import type { DocumentTemplate } from './document-template.types';

@Injectable({ providedIn: 'root' })
export class PiDocumentTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<DocumentTemplate[]>> {
    return silentGet<DocumentTemplate[]>(this.http, `${this.baseUrl}/document-templates`);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/document-templates/${id}`);
  }
}
