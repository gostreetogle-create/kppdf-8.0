import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentDelete,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  CreateSupplyTaskPayload,
  ExplodeSupplyTasksPayload,
  ExplodeSupplyTasksResult,
  SupplyTask,
  SupplyTasksListParams,
  UpdateSupplyTaskPayload,
} from './supply-task.types';

/**
 * TZ-NX-SUPPLY-S1 — thin client for the existing atomic SupplyTask API
 * (canon registry: draft → confirmed → ordered → received). Reuses the
 * legacy `SupplyTaskService` shape 1:1; no second write path.
 */
@Injectable({ providedIn: 'root' })
export class PiSupplyTasksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: SupplyTasksListParams = {}): Observable<SilentResult<SupplyTask[]>> {
    let httpParams = new HttpParams();
    if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return silentGet<SupplyTask[]>(this.http, `${this.baseUrl}/supply-tasks`, {
      params: httpParams,
    });
  }

  create(payload: CreateSupplyTaskPayload): Observable<SilentResult<SupplyTask>> {
    return silentPost<SupplyTask>(this.http, `${this.baseUrl}/supply-tasks`, payload);
  }

  explode(payload: ExplodeSupplyTasksPayload): Observable<SilentResult<ExplodeSupplyTasksResult>> {
    return silentPost<ExplodeSupplyTasksResult>(
      this.http,
      `${this.baseUrl}/supply-tasks/explode`,
      payload,
    );
  }

  update(id: string, payload: UpdateSupplyTaskPayload): Observable<SilentResult<SupplyTask>> {
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
