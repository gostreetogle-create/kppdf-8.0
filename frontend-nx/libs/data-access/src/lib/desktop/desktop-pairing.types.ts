/** TZD-72 — NX port of `frontend/src/app/shared/services/pi-desktop-pairing.service.ts` types. */
export type DesktopPairingTtl = '1d' | '7d' | '30d' | '90d' | 'never';

export interface DesktopPairingPacket {
  readonly apiBaseUrl: string;
  readonly apiKey: string;
  readonly username: string;
  readonly expiresAt: string | null;
}

export interface DesktopPairingIssueResult {
  readonly id: string;
  readonly apiKey: string;
  readonly expiresAt: string | null;
  readonly label: string;
  readonly tokenPrefix: string;
  readonly pairing: DesktopPairingPacket;
}

export interface DesktopPairingKeyMeta {
  readonly id: string;
  readonly label: string;
  readonly tokenPrefix: string;
  readonly expiresAt: string | null;
  readonly revokedAt: string | null;
  readonly createdAt: string | null;
  readonly lastUsedAt: string | null;
}

/** TZD-40: contract for `GET /api/desktop/compat` (env-driven, public). */
export interface DesktopCompatInfo {
  readonly minDesktopVersion: string;
  readonly recommendedDesktopVersion: string;
  readonly downloadUrl: string;
  readonly serverBuildId: string;
}
