import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  SilentResult,
} from '../../core/silent-http';

/** TZ-SUPPLY-301 — задача снабжения (канон D9/D18). */
export type SupplyTaskStatus = 'draft' | 'confirmed' | 'ordered' | 'received';

export interface SupplyTask {
  _id: string;
  orderId: string;
  orderLineId?: string;
  materialId?: string;
  moduleId?: string;
  qty: number;
  status: SupplyTaskStatus;
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplyTaskDto {
  orderId: string;
  orderLineId?: string;
  materialId?: string;
  moduleId?: string;
  qty: number;
  notes?: string;
  title?: string;
}

export interface ExplodeSupplyTasksResult {
  created: SupplyTask[];
  skipped: number;
}

@Injectable({ providedIn: 'root' })
export class SupplyTaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(filters?: {
    orderId?: string;
    status?: SupplyTaskStatus | '';
  }): Observable<SilentResult<SupplyTask[]>> {
    let params = new HttpParams();
    if (filters?.orderId) params = params.set('orderId', filters.orderId);
    if (filters?.status) params = params.set('status', filters.status);
    return silentGet<SupplyTask[]>(this.http, `${this.baseUrl}/supply-tasks`, {
      params,
    });
  }

  create(payload: CreateSupplyTaskDto): Observable<SilentResult<SupplyTask>> {
    return silentPost<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks`, payload);
  }

  explode(orderId: string, moduleId?: string): Observable<SilentResult<ExplodeSupplyTasksResult>> {
    return silentPost<ExplodeSupplyTasksResult>(
      this.http,
      `${this.baseUrl}/supply-tasks/explode`,
      moduleId ? { orderId, moduleId } : { orderId },
    );
  }

  update(
    id: string,
    payload: Partial<Pick<SupplyTask, 'qty' | 'notes' | 'title'>>,
  ): Observable<SilentResult<SupplyTask>> {
    return silentPatch<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks/${id}`, payload);
  }

  confirm(id: string): Observable<SilentResult<SupplyTask>> {
    return silentPost<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks/${id}/confirm`, {});
  }

  markOrdered(id: string): Observable<SilentResult<SupplyTask>> {
    return silentPost<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks/${id}/ordered`, {});
  }

  markReceived(id: string): Observable<SilentResult<SupplyTask>> {
    return silentPost<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks/${id}/received`, {});
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/supply-tasks/${id}`);
  }
}
