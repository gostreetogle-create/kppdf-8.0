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

// ─── Types ────────────────────────────────────────────────────────────────

export interface CostMaterial {
  materialId: string;
  materialName?: string;
  quantity: number;
  unit?: string;
  pricePerUnit: number;
  total: number;
}

export interface CostLabor {
  workTypeId: string;
  workTypeName?: string;
  hours: number;
  hourlyRate: number;
  total: number;
}

export interface CostCalculation {
  _id: string;
  productId: string;
  isActive: boolean;
  materials: CostMaterial[];
  totalMaterialCost: number;
  labor: CostLabor[];
  totalLaborCost: number;
  overheadPercent: number;
  overheadCost: number;
  totalCost: number;
  calculatedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────

/**
 * TZ-85 Phase B — CRUD for CostCalculation snapshots.
 *
 * API surface:
 *   GET    /api/products/:productId/cost-calculations      → list
 *   POST   /api/products/:productId/cost-calculations      → create (recalculate)
 *   GET    /api/cost-calculations/:id                       → findById
 *   PATCH  /api/cost-calculations/:id                       → update (notes, overheadPercent)
 *   POST   /api/cost-calculations/:id/activate              → activate
 *   DELETE /api/cost-calculations/:id                       → remove
 */
@Injectable({ providedIn: 'root' })
export class CostCalculationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(productId: string): Observable<SilentResult<CostCalculation[]>> {
    return silentGet<CostCalculation[]>(
      this.http,
      `${this.baseUrl}/products/${productId}/cost-calculations`,
    );
  }

  findById(id: string): Observable<SilentResult<CostCalculation>> {
    return silentGet<CostCalculation>(this.http, `${this.baseUrl}/cost-calculations/${id}`);
  }

  create(
    productId: string,
    body: { overheadPercent?: number; notes?: string } = {},
  ): Observable<SilentResult<CostCalculation>> {
    return silentPost<CostCalculation>(
      this.http,
      `${this.baseUrl}/products/${productId}/cost-calculations`,
      body,
    );
  }

  update(
    id: string,
    body: { notes?: string; overheadPercent?: number },
  ): Observable<SilentResult<CostCalculation>> {
    return silentPatch<CostCalculation>(this.http, `${this.baseUrl}/cost-calculations/${id}`, body);
  }

  activate(id: string): Observable<SilentResult<CostCalculation>> {
    return silentPost<CostCalculation>(
      this.http,
      `${this.baseUrl}/cost-calculations/${id}/activate`,
      {},
    );
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/cost-calculations/${id}`);
  }
}
