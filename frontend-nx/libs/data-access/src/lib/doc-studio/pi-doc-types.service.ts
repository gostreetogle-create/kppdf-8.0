import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { DocType } from './doc-type.types';

@Injectable({ providedIn: 'root' })
export class PiDocTypesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<DocType[]>> {
    return silentGet<DocType[]>(this.http, `${this.baseUrl}/doc-types`);
  }
}
