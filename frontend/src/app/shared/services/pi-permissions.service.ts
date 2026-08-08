import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, SilentResult } from '../../core/silent-http';

/**
 * TZ-257.B — PermissionsCatalogService.
 *
 * Mirrors `RegistryService` (pi-registry.service.ts): a static catalogue
 * served from in-memory constants on the backend — no DB round-trip.
 *
 * The admin role-form dialog uses `getCatalog()` to render a checkbox
 * catalogue grouped by section, so editors pick from the REAL permission
 * keys (single source of truth: `backend/src/common/seed/permissions.constants.ts`)
 * instead of free-typing.
 *
 * Routes:
 *   GET /admin/permissions → { sections: [{ section, permissions: [{ key, action, description }] }] }
 *
 * Gated by global JwtAuthGuard + @Permissions('role:read') + @Roles('admin').
 */
export type PermissionAction = 'read' | 'write' | 'admin';

export interface PermissionCatalogEntry {
  key: string;
  action: PermissionAction;
  description: string;
}

export interface PermissionSection {
  section: string;
  permissions: PermissionCatalogEntry[];
}

export interface PermissionCatalogResponse {
  sections: PermissionSection[];
  /** TZ-ADMIN-301: canonical PAGE_KEYS for nav ACL picker. */
  pages?: string[];
}

@Injectable({ providedIn: 'root' })
export class PermissionsCatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getCatalog(): Observable<SilentResult<PermissionCatalogResponse>> {
    return silentGet<PermissionCatalogResponse>(this.http, `${this.baseUrl}/admin/permissions`);
  }
}
