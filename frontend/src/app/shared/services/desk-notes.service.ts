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

export type DeskNoteKind = 'note' | 'checklist' | 'reminder';

export interface DeskNote {
  _id: string;
  text: string;
  kind: DeskNoteKind;
  anchorOrderId: string;
  anchorLineId?: string;
  anchorModuleId?: string;
  authorId: string;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeskNotePayload {
  text: string;
  kind?: DeskNoteKind;
  anchorOrderId: string;
  anchorLineId?: string;
  anchorModuleId?: string;
}

export interface UpdateDeskNotePayload {
  text?: string;
  kind?: DeskNoteKind;
  isDone?: boolean;
}

/**
 * TZ-DESK-408 — заметки стола (anchor order/line/module).
 * Один write-path CRUD; silent-* helpers (см. core/silent-http.ts).
 */
@Injectable({ providedIn: 'root' })
export class DeskNotesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(
    filters: { orderId?: string; lineId?: string; moduleId?: string } = {},
  ): Observable<SilentResult<DeskNote[]>> {
    return silentGet<DeskNote[]>(this.http, `${this.baseUrl}/desk-notes`, {
      params: {
        ...(filters.orderId ? { orderId: filters.orderId } : {}),
        ...(filters.lineId ? { lineId: filters.lineId } : {}),
        ...(filters.moduleId ? { moduleId: filters.moduleId } : {}),
      },
    });
  }

  create(payload: CreateDeskNotePayload): Observable<SilentResult<DeskNote>> {
    return silentPost<DeskNote>(this.http, `${this.baseUrl}/desk-notes`, payload);
  }

  update(id: string, payload: UpdateDeskNotePayload): Observable<SilentResult<DeskNote>> {
    return silentPatch<DeskNote>(this.http, `${this.baseUrl}/desk-notes/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/desk-notes/${id}`);
  }
}
