import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { SilentResult, silentGet, silentWrap } from '../../core/silent-http';

/** TZ-DICT-315 — mirrors BE DICT-314 allowlist (audit §4). */
export const FORM_PROFILE_ENTITIES = ['product', 'module'] as const;
export type FormProfileEntity = (typeof FORM_PROFILE_ENTITIES)[number];

export const FORM_PROFILE_SIZES = ['S', 'M', 'L'] as const;
export type FormProfileSize = (typeof FORM_PROFILE_SIZES)[number];

export const PRODUCT_FIELD_KEYS = [
  'name',
  'kind',
  'unit',
  'sku',
  'listPrice',
  'categoryId',
  'isActive',
  'status',
  'dimLength',
  'dimWidth',
  'dimHeight',
  'dimUnit',
  'weightKg',
  'description',
  'notes',
] as const;

export const MODULE_FIELD_KEYS = [
  'name',
  'article',
  'width',
  'height',
  'depth',
  'unit',
  'weight',
  'notes',
] as const;

export type FormFieldKey = (typeof PRODUCT_FIELD_KEYS)[number] | (typeof MODULE_FIELD_KEYS)[number];

export const LOCKED_REQUIRED: Record<FormProfileEntity, readonly string[]> = {
  product: ['name', 'kind', 'unit'],
  module: ['name'],
};

export const ALLOWED_FIELD_KEYS: Record<FormProfileEntity, readonly string[]> = {
  product: PRODUCT_FIELD_KEYS,
  module: MODULE_FIELD_KEYS,
};

/** RU labels for FieldKeys (audit §4). */
export const FIELD_KEY_LABEL_RU: Record<string, string> = {
  name: 'Название',
  kind: 'Вид',
  unit: 'Ед.',
  sku: 'Артикул',
  listPrice: 'Прайс',
  categoryId: 'Категория',
  isActive: 'Активен',
  status: 'Статус',
  dimLength: 'Длина',
  dimWidth: 'Ширина',
  dimHeight: 'Высота',
  dimUnit: 'Ед. габаритов',
  weightKg: 'Вес',
  description: 'Описание',
  notes: 'Заметки',
  article: 'Артикул',
  width: 'Ширина',
  height: 'Высота',
  depth: 'Глубина',
  weight: 'Вес',
};

export const ENTITY_LABEL_RU: Record<FormProfileEntity, string> = {
  product: 'Изделие',
  module: 'Модуль',
};

export const SIZE_HINT_RU: Record<FormProfileSize, string> = {
  S: 'Короткий диалог (sm)',
  M: 'Средний диалог (md)',
  L: 'Широкий диалог (lg)',
};

export interface FormProfile {
  _id: string;
  organizationId: string;
  entity: FormProfileEntity;
  size: FormProfileSize;
  visibleFieldKeys: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * TZ-DICT-315 — client for GET/PUT `/form-profiles` (DICT-314 API).
 * Settings UI only; QuickCreate wire → DICT-316.
 */
@Injectable({ providedIn: 'root' })
export class FormProfilesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(entity?: FormProfileEntity): Observable<SilentResult<FormProfile[]>> {
    let params = new HttpParams();
    if (entity) params = params.set('entity', entity);
    return silentGet<FormProfile[]>(this.http, `${this.baseUrl}/form-profiles`, {
      params,
    });
  }

  getOne(entity: FormProfileEntity, size: FormProfileSize): Observable<SilentResult<FormProfile>> {
    return silentGet<FormProfile>(this.http, `${this.baseUrl}/form-profiles/${entity}/${size}`);
  }

  upsert(
    entity: FormProfileEntity,
    size: FormProfileSize,
    visibleFieldKeys: string[],
  ): Observable<SilentResult<FormProfile>> {
    return silentWrap(
      this.http
        ? this.http.put<FormProfile>(`${this.baseUrl}/form-profiles/${entity}/${size}`, {
            visibleFieldKeys,
          })
        : throwError(() => new Error('HTTP client unavailable')),
    );
  }

  isLocked(entity: FormProfileEntity, fieldKey: string): boolean {
    return LOCKED_REQUIRED[entity].includes(fieldKey);
  }

  labelRu(fieldKey: string): string {
    return FIELD_KEY_LABEL_RU[fieldKey] ?? fieldKey;
  }
}
