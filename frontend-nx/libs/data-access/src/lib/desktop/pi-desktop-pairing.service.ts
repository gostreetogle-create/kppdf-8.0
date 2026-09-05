import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, silentPost, type SilentResult } from '@kppdf/util-http';
import type {
  DesktopCompatInfo,
  DesktopPairingIssueResult,
  DesktopPairingKeyMeta,
  DesktopPairingTtl,
} from './desktop-pairing.types';

/**
 * TZD-72 — NX port of `frontend/src/app/shared/services/pi-desktop-pairing.service.ts`.
 * TZD-21: self-service desktop pairing keys (opaque `kppd_…`, not session JWT).
 * `issue`/`list`/`revoke` require `desktop:admin` server-side; `compat` stays `@Public`.
 */
@Injectable({ providedIn: 'root' })
export class PiDesktopPairingService {
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

  compat(): Observable<SilentResult<DesktopCompatInfo>> {
    return silentGet<DesktopCompatInfo>(this.http, `${this.baseUrl}/desktop/compat`);
  }
}
