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

export type ContractStatus =
  'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled' | 'expired';

export interface ContractItem {
  productId: string;
  productName?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total?: number;
}

export interface Contract {
  _id: string;
  number: string;
  title?: string;
  /** Mongoose-ref to Quotation. Backend may auto-populate as object. */
  proposalId?: string | { _id: string };
  /**
   * Required, auto-populated Organization (the "us" side party).
   * Dual-shaped: string ID OR populated Organization object.
   */
  organizationId?: string | { _id: string; name?: string };
  /**
   * Required, auto-populated Counterparty (the customer side).
   * Dual-shaped: string ID OR Counterparty object.
   */
  customerId?: string | { _id: string; name?: string };
  status: ContractStatus;
  items?: ContractItem[];
  notes?: string;
  totalAmount?: number;
  signedAt?: string;
  expiresAt?: string;
  packageTag?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * TZ-NEW ContractsService — connects to
 * `backend/src/modules/contract/contract.controller.ts`.
 *
 * Same response-shape caveat as OrdersService: GET /contracts
 * returns a flat array. Sort/filter are page-side for v1.
 *
 * Business actions (sign, activate) NOT exposed in v1 — only CRUD.
 * sign mutates status to 'signed' + sets signedAt; activate requires
 * signed first AND auto-creates an Order (backend contract.service.activate).
 * Both are scheduled for state-machine iteration.
 */
@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<SilentResult<Contract[]>> {
    return silentGet<Contract[]>(this.http, `${this.baseUrl}/contracts`);
  }

  findById(id: string): Observable<SilentResult<Contract>> {
    return silentGet<Contract>(this.http, `${this.baseUrl}/contracts/${id}`);
  }

  create(payload: Partial<Contract>): Observable<SilentResult<Contract>> {
    return silentPost<Contract>(this.http, `${this.baseUrl}/contracts`, payload);
  }

  update(id: string, payload: Partial<Contract>): Observable<SilentResult<Contract>> {
    return silentPatch<Contract>(this.http, `${this.baseUrl}/contracts/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/contracts/${id}`);
  }
}
