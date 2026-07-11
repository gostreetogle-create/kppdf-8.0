import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, SilentResult } from '../../core/silent-http';

/**
 * TZ-86 Phase B.4 — Registry mirror of backend `RegistryService`
 * (`backend/src/modules/registry/registry.service.ts`).
 *
 * The Document Constructor tool-pane «Данные» tab calls `getDataSources()`
 * to populate the dropdown without hardcoding entity types in the frontend.
 * Adding a new source on the backend (Phase F.4 future extensions) surfaces
 * automatically — no frontend redeploy required.
 *
 * Stable contracted shape — the registry envelope `{ sources: [...] }` is
 * the canonical DTO. Field-type enum mirrors Phase A.2 `ColumnType` for
 * renderer consistency.
 */
export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'bool';

export interface FieldDescriptor {
  /** camelCase schema field name — used as `dataBinding.field`. */
  key: string;
  /** Russian human-readable label for the inspector dropdown. */
  label: string;
  type: FieldType;
}

export interface DataSourceDescriptor {
  /** Stable identifier — matches `BuildDocumentDto` suffix (without «Id»). */
  key: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type';
  /** Russian human-readable label for the tool-pane tab. */
  label: string;
  /** Frontend grouping for collapsible tool-pane tab: contacts (orgs/people) | catalog (products/materials) | work (work-types). */
  group: 'contacts' | 'catalog' | 'work';
  fields: FieldDescriptor[];
}

export interface DataSourcesResponse {
  sources: DataSourceDescriptor[];
}

/**
 * TZ-86 Phase B.4 — RegistryService.
 *
 * Routes:
 *   GET /registry/data-sources → DataSourcesResponse
 *
 * No `list/findById/create/update/remove` — registry is a static catalogue
 * served from in-memory constants on the backend (no DB roundtrip, no auth
 * beyond the global JwtAuthGuard).
 */
@Injectable({ providedIn: 'root' })
export class RegistryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getDataSources(): Observable<SilentResult<DataSourcesResponse>> {
    return silentGet<DataSourcesResponse>(
      this.http,
      `${this.baseUrl}/registry/data-sources`,
    );
  }
}
