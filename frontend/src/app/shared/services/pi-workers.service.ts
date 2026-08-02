import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';

export interface Person {
  _id: string;
  name: string;
  email?: string;
  position?: string;
  supplierId?: string;
  workTypeIds?: string[];
  organizationId?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonPayload {
  name: string;
  email?: string;
  position?: string;
  supplierId?: string;
  workTypeIds?: string[];
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class PiWorkersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(opts?: { activeOnly?: boolean; supplierId?: string; q?: string }): Observable<Person[]> {
    let params = new HttpParams();
    if (opts?.activeOnly) params = params.set('activeOnly', 'true');
    if (opts?.supplierId) params = params.set('supplierId', opts.supplierId);
    if (opts?.q) params = params.set('q', opts.q);
    return this.http.get<Person[]>(`${this.baseUrl}/api/workers`, { params });
  }

  get(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/api/workers/${id}`);
  }

  create(payload: CreatePersonPayload): Observable<Person> {
    return this.http.post<Person>(`${this.baseUrl}/api/workers`, payload);
  }

  update(id: string, patch: Partial<CreatePersonPayload> & { isActive?: boolean }): Observable<Person> {
    return this.http.patch<Person>(`${this.baseUrl}/api/workers/${id}`, patch);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/workers/${id}`);
  }
}
