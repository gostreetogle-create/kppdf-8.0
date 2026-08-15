import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentPatch, type SilentResult } from '../../core/silent-http';

export interface ImportTodo {
  id: string;
  title: string;
  body?: string | null;
  href?: string | null;
  importTaskId?: string | null;
  templateId?: string | null;
  organizationId?: string | null;
  createdByUserId?: string | null;
  status: 'open' | 'done';
  createdAt?: string | null;
  updatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ImportTodosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  markDone(id: string): Observable<SilentResult<ImportTodo>> {
    return silentPatch<ImportTodo>(this.http, `${this.baseUrl}/import-todos/${id}`, {
      status: 'done',
    });
  }
}
