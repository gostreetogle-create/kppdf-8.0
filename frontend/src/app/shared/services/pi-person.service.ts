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

export interface Person {
  _id: string;
  lastName: string;
  firstName: string;
  patronymic?: string;
  phone?: string;
  email?: string;
  position?: string;
  notes?: string;
}

export interface PersonsListResponse {
  items: Person[];
  total: number;
  page: number;
  limit: number;
}

export interface PersonsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(params: PersonsListParams = {}): Observable<SilentResult<PersonsListResponse>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('limit', String(params.limit ?? 20));
    if (params.search) httpParams = httpParams.set('search', params.search);
    return silentGet<PersonsListResponse>(this.http, `${this.baseUrl}/persons`, {
      params: httpParams,
    });
  }

  findById(id: string): Observable<SilentResult<Person>> {
    return silentGet<Person>(this.http, `${this.baseUrl}/persons/${id}`);
  }

  create(payload: Partial<Person>): Observable<SilentResult<Person>> {
    return silentPost<Person>(this.http, `${this.baseUrl}/persons`, payload);
  }

  update(id: string, payload: Partial<Person>): Observable<SilentResult<Person>> {
    return silentPatch<Person>(this.http, `${this.baseUrl}/persons/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/persons/${id}`);
  }
}
