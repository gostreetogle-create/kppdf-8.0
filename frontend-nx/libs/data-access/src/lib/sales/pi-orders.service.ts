import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_BASE_URL,
  silentGet,
  silentPatch,
  silentPost,
  type SilentResult,
} from '@kppdf/util-http';
import type {
  CreateOrderPayload,
  Order,
  UpdateOrderPayload,
} from './order.types';

@Injectable({ providedIn: 'root' })
export class PiOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Order[]>> {
    return silentGet<Order[]>(this.http, `${this.baseUrl}/orders`);
  }

  getById(id: string): Observable<SilentResult<Order>> {
    return silentGet<Order>(this.http, `${this.baseUrl}/orders/${id}`);
  }

  create(payload: CreateOrderPayload): Observable<SilentResult<Order>> {
    return silentPost<Order>(this.http, `${this.baseUrl}/orders`, payload);
  }

  update(id: string, payload: UpdateOrderPayload): Observable<SilentResult<Order>> {
    return silentPatch<Order>(this.http, `${this.baseUrl}/orders/${id}`, payload);
  }
}