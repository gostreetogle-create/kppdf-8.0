import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.tokens';
import { AuthService } from '../../../core/auth.service';
import { SilentResult, silentGet, silentWrap } from '../../../core/silent-http';
import {
  CATALOG_KIND_DEFAULT_HUES,
  CatalogKindPalette,
  setCatalogKindPalette,
} from './catalog-kind-oklch';

export const CATALOG_APPEARANCE_SETTING_KEY = 'catalog.appearance';

export interface CatalogAppearanceValue {
  productHue: number | null;
  moduleHue: number | null;
  materialHue: number | null;
  materialRawHue: number | null;
}

interface SettingResponse {
  key: string;
  value?: Partial<CatalogAppearanceValue> | null;
}

/**
 * Organization-scoped catalog kind palette with code defaults as fallback.
 * A failed or missing setting never removes the readable default palette.
 */
@Injectable({ providedIn: 'root' })
export class CatalogAppearanceService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly auth = inject(AuthService, { optional: true });
  private loadedForOrganization: string | null | undefined;

  private readonly _palette = signal<CatalogKindPalette>({
    ...CATALOG_KIND_DEFAULT_HUES,
  });
  readonly palette = this._palette.asReadonly();

  load(): Observable<SilentResult<SettingResponse>> | null {
    if (!this.http) return null;
    const organizationId = this.auth?.user()?.organizationId ?? null;
    if (this.loadedForOrganization === organizationId) return null;
    this.loadedForOrganization = organizationId;
    return silentGet<SettingResponse>(
      this.http,
      `${this.baseUrl}/settings/catalog-appearance`,
    ).pipe(
      tap((result) => {
        if (result.ok) this.applyValue(result.data.value ?? null);
        else this.loadedForOrganization = undefined;
      }),
    );
  }

  save(value: CatalogAppearanceValue): Observable<SilentResult<SettingResponse>> {
    return silentWrap(
      this.http
        ? this.http.put<SettingResponse>(`${this.baseUrl}/settings/catalog-appearance`, { value })
        : throwError(() => new Error('HTTP client unavailable')),
    ).pipe(
      tap((result) => {
        if (result.ok) {
          this.applyValue(result.data.value ?? value);
          this.loadedForOrganization = this.auth?.user()?.organizationId ?? null;
        }
      }),
    );
  }

  applyValue(value: Partial<CatalogAppearanceValue> | null): void {
    const next: CatalogKindPalette = {
      product: validHue(value?.productHue) ?? CATALOG_KIND_DEFAULT_HUES.product,
      module: validHue(value?.moduleHue) ?? CATALOG_KIND_DEFAULT_HUES.module,
      material: validHue(value?.materialHue) ?? CATALOG_KIND_DEFAULT_HUES.material,
      materialRaw: validHue(value?.materialRawHue) ?? CATALOG_KIND_DEFAULT_HUES.materialRaw,
    };
    this._palette.set(next);
    setCatalogKindPalette(next);
  }

  resetToDefaults(): void {
    this.applyValue(null);
  }
}

function validHue(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? ((Math.round(value) % 360) + 360) % 360
    : null;
}
