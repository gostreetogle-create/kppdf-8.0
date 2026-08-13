import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPatch, silentPost, type SilentResult } from '../../core/silent-http';

/**
 * TZ-AUTH-304 — frontend client for the device-enrollment backend
 * (TZ-AUTH-303). Thin typed wrapper; all errors are converted to
 * `SilentResult` via the silent-* helpers.
 */

export interface EnrollResponse {
  access: string;
  deviceName: string;
  role: string;
  expiresAt: string;
  isOwner: boolean;
}

export interface SessionResponse {
  access: string;
}

export interface DeviceStatus {
  status: 'active' | 'revoked' | 'expired';
  deviceName?: string;
}

export interface IssuedInvite {
  inviteId: string;
  url: string;
  secret: string;
  expiresAt: string;
  kind: 'regular' | 'owner-device';
  role?: string;
}

export interface AdminDevice {
  id: string;
  deviceName: string;
  status: 'active' | 'revoked';
  inviteKind: 'regular' | 'owner-device';
  role: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  activatedAt: string | null;
  revokedAt: string | null;
  userId: string;
}

export interface AdminInvite {
  id: string;
  kind: 'regular' | 'owner-device';
  role: string | null;
  secretPrefix: string;
  status: 'active' | 'revoked' | 'consumed' | 'expired';
  expiresAt: string | null;
  consumedAt: string | null;
  createdAt: string | null;
}

/** Role option for the invite / device-role pickers (`GET /api/roles`). */
export interface ActiveRole {
  name: string;
  label: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PiDeviceEnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Public: consume a one-time invite with just the device name. */
  enroll(secret: string, deviceName: string): Observable<SilentResult<EnrollResponse>> {
    return silentPost<EnrollResponse>(this.http, `${this.baseUrl}/device/enroll`, {
      secret,
      deviceName,
    });
  }

  /** Cookie-only: exchange the device cookie for a short access JWT. */
  session(): Observable<SilentResult<SessionResponse>> {
    return silentGet<SessionResponse>(this.http, `${this.baseUrl}/device/session`);
  }

  /** Cookie-only status probe. */
  status(): Observable<SilentResult<DeviceStatus>> {
    return silentGet<DeviceStatus>(this.http, `${this.baseUrl}/device/status`);
  }

  /**
   * Active roles for the invite / device-role pickers. Uses the
   * admin/manager-readable `GET /api/roles` (NOT owner-only /admin/roles).
   */
  listRoles(): Observable<SilentResult<ActiveRole[]>> {
    return silentGet<ActiveRole[]>(this.http, `${this.baseUrl}/roles`);
  }

  // ------------------------------------------------------------ admin

  listDevices(): Observable<SilentResult<AdminDevice[]>> {
    return silentGet<AdminDevice[]>(this.http, `${this.baseUrl}/admin/devices`);
  }

  listInvites(): Observable<SilentResult<AdminInvite[]>> {
    return silentGet<AdminInvite[]>(this.http, `${this.baseUrl}/admin/devices/invites`);
  }

  createInvite(
    role: string,
    ttlDays?: number,
    deviceTtlDays?: number,
  ): Observable<SilentResult<IssuedInvite>> {
    const body: Record<string, unknown> = { role };
    if (ttlDays) body['ttlDays'] = ttlDays;
    if (deviceTtlDays) body['deviceTtlDays'] = deviceTtlDays;
    return silentPost<IssuedInvite>(this.http, `${this.baseUrl}/admin/devices/invites`, body);
  }

  createOwnerInvite(password: string): Observable<SilentResult<IssuedInvite>> {
    return silentPost<IssuedInvite>(this.http, `${this.baseUrl}/admin/devices/owner-invite`, {
      password,
    });
  }

  revokeInvite(id: string): Observable<SilentResult<AdminInvite>> {
    return silentPost<AdminInvite>(
      this.http,
      `${this.baseUrl}/admin/devices/invites/${id}/revoke`,
      {},
    );
  }

  updateDevice(
    id: string,
    body: { role?: string; deviceName?: string; expiresInDays?: number },
  ): Observable<SilentResult<AdminDevice>> {
    return silentPatch<AdminDevice>(this.http, `${this.baseUrl}/admin/devices/${id}`, body);
  }

  revokeDevice(id: string): Observable<SilentResult<AdminDevice>> {
    return silentPost<AdminDevice>(this.http, `${this.baseUrl}/admin/devices/${id}/revoke`, {});
  }
}
