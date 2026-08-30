import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { RegistryDataSource } from './table-template.types';

@Injectable({ providedIn: 'root' })
export class PiRegistryDataSourcesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  list(): Observable<SilentResult<RegistryDataSource[]>> {
    return silentGet<RegistryDataSource[]>(this.http, `${this.baseUrl}/registry/data-sources`);
  }
}
