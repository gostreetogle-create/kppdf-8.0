import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, SilentResult } from '../../core/silent-http';

export interface Person {
  _id: string;
  lastName: string;
  firstName: string;
  patronymic?: string;
  position?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<{ items: Person[] }>> {
    const params = new HttpParams().set('page', '1').set('limit', '200');
    return silentGet<{ items: Person[] }>(this.http, `${this.baseUrl}/persons`, { params });
  }
}
