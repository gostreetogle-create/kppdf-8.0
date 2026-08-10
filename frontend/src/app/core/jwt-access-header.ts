/**
 * JWT transport header that coexists with HTTP Basic Auth on nginx.
 *
 * Prod (`kppdf-crm.ru`) uses nginx `auth_basic`, which consumes the
 * `Authorization` header. Angular must NOT overwrite that with
 * `Bearer <jwt>` — otherwise every logged-in API call gets nginx 401.
 *
 * Nest still accepts classic `Authorization: Bearer` (LAN / curl / tests).
 */
export const JWT_ACCESS_HEADER = 'X-Access-Token';
