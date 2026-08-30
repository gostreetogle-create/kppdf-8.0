import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { RegistryDataSource } from './table-template.types';

interface RegistryDataSourcesEnvelope {
  readonly sources?: readonly RegistryDataSource[];
}

@Injectable({ providedIn: 'root' })
export class PiRegistryDataSourcesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<RegistryDataSource[]>> {
    return silentGet<RegistryDataSourcesEnvelope | RegistryDataSource[]>(
      this.http,
      `${this.baseUrl}/registry/data-sources`,
    ).pipe(
      map((result) => {
        if (!result.ok) return result;
        const payload = result.data;
        const sources = Array.isArray(payload) ? payload : (payload?.sources ?? []);
        return { ok: true as const, data: [...sources] };
      }),
    );
  }
}
