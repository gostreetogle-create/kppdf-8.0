import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

export type WarehouseType = 'main' | 'branch' | 'transit' | 'production' | 'other';

export interface Warehouse {
  _id: string;
  name: string;
  type: WarehouseType | string;
  address?: string;
  description?: string;
  zoneNames: string[];
  isActive: boolean;
}

export interface WarehouseWritePayload {
  name: string;
  type?: WarehouseType;
  address?: string;
  description?: string;
  zoneNames?: string[];
  isActive?: boolean;
}

/**
 * WarehousesService — CRUD for workshop warehouses registry.
 */
@Injectable({ providedIn: 'root' })
export class WarehousesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Warehouse[]>> {
    return silentGet<Warehouse[]>(this.http, `${this.baseUrl}/warehouses`);
  }

  create(payload: WarehouseWritePayload): Observable<SilentResult<Warehouse>> {
    return silentPost<Warehouse>(this.http, `${this.baseUrl}/warehouses`, payload);
  }

  update(id: string, payload: Partial<WarehouseWritePayload>): Observable<SilentResult<Warehouse>> {
    return silentPatch<Warehouse>(this.http, `${this.baseUrl}/warehouses/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/warehouses/${id}`);
  }
}
