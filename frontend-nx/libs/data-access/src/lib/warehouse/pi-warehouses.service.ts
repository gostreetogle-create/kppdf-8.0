import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';

export type WarehouseType = 'main' | 'branch' | 'transit' | 'production' | 'other';

export interface Warehouse {
  _id: string;
  name: string;
  type?: WarehouseType | string;
  description?: string;
  isActive: boolean;
  zoneNames?: string[];
}

export interface WarehouseWritePayload {
  name: string;
  type: 'main';
  zoneNames: [];
  description?: string;
  isActive: boolean;
}

/** Thin NX client for the existing warehouse CRUD API. */
@Injectable({ providedIn: 'root' })
export class PiWarehousesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Warehouse[]>> {
    return silentGet<Warehouse[]>(this.http, `${this.baseUrl}/warehouses`);
  }

  create(payload: WarehouseWritePayload): Observable<SilentResult<Warehouse>> {
    return silentPost<Warehouse>(this.http, `${this.baseUrl}/warehouses`, payload);
  }

  update(id: string, payload: WarehouseWritePayload): Observable<SilentResult<Warehouse>> {
    return silentPatch<Warehouse>(this.http, `${this.baseUrl}/warehouses/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/warehouses/${id}`);
  }
}
