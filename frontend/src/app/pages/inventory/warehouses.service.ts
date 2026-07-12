import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, SilentResult } from '../../core/silent-http';

export interface Warehouse {
  _id: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
  zoneNames: string[];
  isActive: boolean;
}

/**
 * WarehousesService — read-only service for warehouse dropdowns.
 */
@Injectable({ providedIn: 'root' })
export class WarehousesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Warehouse[]>> {
    return silentGet<Warehouse[]>(this.http, `${this.baseUrl}/warehouses`);
  }
}
