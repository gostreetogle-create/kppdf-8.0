/**
 * AuthUserPayload — the canonical "safe" projection of a user record.
 * Returned by `register`, `login`, and `getMe` (TZ-92 §1). Strips the
 * sensitive `passwordHash`, `refreshTokenVersion`, `isActive`, and
 * soft-delete fields that should NEVER reach the client.
 *
 * TZ-92.1 expansion: `phone` and `fullName` added as optional fields so
 * a frontend profile page on `/me` can render the contact info the user
 * provided at register time. Pre-TZ-92.1, these were stripped which
 * meant /me response was missing data the user already had.
 *
 * Why optional? Existing users (pre-TZ-92.1 register path) may have
 * null/missing phone/fullName. Optional shape keeps backward compat.
 *
 * Why not deprecated? Cross-cutting auth flow (login/register response)
 * still benefits from the canonical minimal projection. /me can opt in
 * to richer fields via TypeScript overloads in a future cleanup.
 */
export interface AuthUserPayload {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  phone?: string | null;
  fullName?: string | null;
}

export interface AuthResponse {
  access: string;
  user: AuthUserPayload;
}

export interface AccessTokenResponse {
  access: string;
}
