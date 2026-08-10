import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPatch, SilentResult } from '../../core/silent-http';
import { PiToastService } from '../ui/toast';

export type DictionaryLabelScope = 'productKind' | 'materialKind';

export interface DictionaryLabel {
  _id: string;
  scope: DictionaryLabelScope;
  key: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  organizationId?: string | null;
}

export interface DictionaryLabelPatch {
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
}

const FALLBACK_LABELS: Record<DictionaryLabelScope, readonly DictionaryLabel[]> = {
  productKind: [
    {
      _id: 'fallback-product-good',
      scope: 'productKind',
      key: 'good',
      label: 'Изделие',
      sortOrder: 0,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-product-service',
      scope: 'productKind',
      key: 'service',
      label: 'Услуга',
      sortOrder: 1,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-product-work',
      scope: 'productKind',
      key: 'work',
      label: 'Работа',
      sortOrder: 2,
      isActive: true,
      isSystem: true,
    },
  ],
  materialKind: [
    {
      _id: 'fallback-material-raw',
      scope: 'materialKind',
      key: 'raw',
      label: 'сырьё',
      sortOrder: 0,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-material-part',
      scope: 'materialKind',
      key: 'part',
      label: 'деталь',
      sortOrder: 1,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-material-fastener',
      scope: 'materialKind',
      key: 'fastener',
      label: 'метиз',
      sortOrder: 2,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-material-purchased',
      scope: 'materialKind',
      key: 'purchased',
      label: 'покупное',
      sortOrder: 3,
      isActive: true,
      isSystem: true,
    },
    {
      _id: 'fallback-material-other',
      scope: 'materialKind',
      key: 'other',
      label: 'другое',
      sortOrder: 4,
      isActive: true,
      isSystem: true,
    },
  ],
};

export function dictionaryLabelOptions(scope: DictionaryLabelScope): readonly DictionaryLabel[] {
  return FALLBACK_LABELS[scope];
}

/** TZ-DICT-320 — one FE client/cache for all kind labels and fallback states. */
@Injectable({ providedIn: 'root' })
export class PiDictionaryLabelsService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly baseUrl = inject(API_BASE_URL, { optional: true }) ?? '';
  private readonly toast = inject(PiToastService, { optional: true });
  private readonly cache = new Map<DictionaryLabelScope, readonly DictionaryLabel[]>();
  private readonly requests = new Map<DictionaryLabelScope, Observable<DictionaryLabel[]>>();
  private readonly fallbackWarned = new Set<DictionaryLabelScope>();

  list(scope?: DictionaryLabelScope): Observable<SilentResult<DictionaryLabel[]>> {
    let params = new HttpParams();
    if (scope) params = params.set('scope', scope);
    if (!this.http) return of(this.unavailable<DictionaryLabel[]>());
    return silentGet<DictionaryLabel[]>(this.http, `${this.baseUrl}/dictionary-labels`, { params });
  }

  /** Active labels for selectors; errors intentionally fall back to seed defaults. */
  active(scope: DictionaryLabelScope): Observable<DictionaryLabel[]> {
    const cached = this.cache.get(scope);
    if (cached) return of([...cached]);
    const pending = this.requests.get(scope);
    if (pending) return pending;

    const request = this.list(scope).pipe(
      map((result) => {
        if (result.ok) return result.data.filter((item) => item.isActive);
        this.warnFallbackOnce(scope);
        return [...FALLBACK_LABELS[scope]];
      }),
      tap((items) => {
        // A fallback remains retryable; only server data becomes cached.
        if (!items.every((item) => item._id.startsWith('fallback-'))) this.cache.set(scope, items);
      }),
      tap(() => this.requests.delete(scope)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.requests.set(scope, request);
    return request;
  }

  update(id: string, patch: DictionaryLabelPatch): Observable<SilentResult<DictionaryLabel>> {
    if (!this.http) return of(this.unavailable<DictionaryLabel>());
    return silentPatch<DictionaryLabel>(
      this.http,
      `${this.baseUrl}/dictionary-labels/${id}`,
      patch,
    ).pipe(
      tap((result) => {
        if (result.ok) this.cache.delete(result.data.scope);
      }),
    );
  }

  fallback(scope: DictionaryLabelScope): readonly DictionaryLabel[] {
    return FALLBACK_LABELS[scope];
  }

  label(scope: DictionaryLabelScope, key: string | null | undefined): string {
    if (!key) return '—';
    return (
      this.cache.get(scope)?.find((item) => item.key === key)?.label ??
      FALLBACK_LABELS[scope].find((item) => item.key === key)?.label ??
      key
    );
  }

  private warnFallbackOnce(scope: DictionaryLabelScope): void {
    if (this.fallbackWarned.has(scope)) return;
    this.fallbackWarned.add(scope);
    this.toast?.warning(
      `Справочник «${scope === 'productKind' ? 'Виды изделий' : 'Виды материалов'}» недоступен. Показаны базовые подписи.`,
    );
  }

  private unavailable<T>(): SilentResult<T> {
    return {
      ok: false,
      error: new HttpErrorResponse({ status: 0, statusText: 'Unavailable' }),
    };
  }
}
