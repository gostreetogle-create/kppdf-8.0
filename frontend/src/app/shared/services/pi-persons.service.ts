import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPatch, silentPost, SilentResult } from '../../core/silent-http';

export interface Person {
  _id: string;
  /** TZ-PARTY-305: фамилия необязательна. */
  lastName?: string;
  firstName: string;
  patronymic?: string;
  position?: string;
  phone?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(search?: string): Observable<SilentResult<{ items: Person[] }>> {
    let params = new HttpParams().set('page', '1').set('limit', '200');
    if (search) params = params.set('search', search);
    return silentGet<{ items: Person[] }>(this.http, `${this.baseUrl}/persons`, { params });
  }

  /** TZ-SUPPLY-311 — создание контактного лица менеджера поставщика. */
  create(payload: Partial<Person>): Observable<SilentResult<Person>> {
    return silentPost<Person>(this.http, `${this.baseUrl}/persons`, payload);
  }

  /** TZ-SUPPLY-312 — persist phone/email edits from the supplier contact strip. */
  update(id: string, payload: Partial<Person>): Observable<SilentResult<Person>> {
    return silentPatch<Person>(this.http, `${this.baseUrl}/persons/${id}`, payload);
  }
}
