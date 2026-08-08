import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPost, type SilentResult } from '../../core/silent-http';

export type DesktopPairingTtl = '1d' | '7d' | '30d' | '90d' | 'never';

export interface DesktopPairingPacket {
  apiBaseUrl: string;
  apiKey: string;
  username: string;
  expiresAt: string | null;
}

export interface DesktopPairingIssueResult {
  id: string;
  apiKey: string;
  expiresAt: string | null;
  label: string;
  tokenPrefix: string;
  pairing: DesktopPairingPacket;
}

export interface DesktopPairingKeyMeta {
  id: string;
  label: string;
  tokenPrefix: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string | null;
  lastUsedAt: string | null;
}

/** TZD-21: self-service desktop pairing keys (not session JWT). */
@Injectable({ providedIn: 'root' })
export class DesktopPairingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  issue(body: {
    ttl: DesktopPairingTtl;
    label?: string;
    apiBaseUrl: string;
  }): Observable<SilentResult<DesktopPairingIssueResult>> {
    return silentPost<DesktopPairingIssueResult>(
      this.http,
      `${this.baseUrl}/desktop/pairing-keys`,
      body,
    );
  }

  list(): Observable<SilentResult<DesktopPairingKeyMeta[]>> {
    return silentGet<DesktopPairingKeyMeta[]>(this.http, `${this.baseUrl}/desktop/pairing-keys`);
  }

  revoke(id: string): Observable<SilentResult<{ ok: boolean }>> {
    return silentPost<{ ok: boolean }>(
      this.http,
      `${this.baseUrl}/desktop/pairing-keys/${id}/revoke`,
      {},
    );
  }
}
