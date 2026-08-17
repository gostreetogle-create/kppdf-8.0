/**
 * Backend HTTP helpers using pairing key + optional nginx Basic Auth.
 *
 * Prod (`kppdf-crm.ru`): nginx owns `Authorization` for «подъезд».
 * Pairing key must go in `X-Access-Token` (same as SPA JWT hotfix).
 */

export class BackendError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

/** Shared with SPA / Desktop (`jwt-access-header.ts` / `api.ts`). */
export const JWT_ACCESS_HEADER = 'X-Access-Token';

export interface BackendAuth {
  apiKey: string;
  basicUser?: string;
  basicPass?: string;
}

function authFromEnvOrKey(apiKey: string): BackendAuth {
  return {
    apiKey,
    basicUser: (process.env.KPPDF_HTTP_BASIC_USER ?? '').trim() || undefined,
    basicPass: process.env.KPPDF_HTTP_BASIC_PASS ?? undefined,
  };
}

function buildHeaders(auth: BackendAuth, withJsonBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    [JWT_ACCESS_HEADER]: auth.apiKey,
  };
  if (withJsonBody) headers['Content-Type'] = 'application/json';
  if (auth.basicUser) {
    const raw = `${auth.basicUser}:${auth.basicPass ?? ''}`;
    headers['Authorization'] = `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
  }
  return headers;
}

async function parseJson(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function backendRequest(
  apiBaseUrl: string,
  apiKey: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const url = `${apiBaseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const auth = authFromEnvOrKey(apiKey);
  const res = await fetch(url, {
    method,
    headers: buildHeaders(auth, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new BackendError(
      `Backend ${method} ${path} → ${res.status}${errBody ? `: ${errBody.slice(0, 200)}` : ''}`,
      res.status,
    );
  }
  return parseJson(res);
}

export async function backendGetJson(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
): Promise<unknown> {
  return backendRequest(apiBaseUrl, apiKey, 'GET', path);
}

export async function backendPostJson(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
  body: unknown,
): Promise<unknown> {
  return backendRequest(apiBaseUrl, apiKey, 'POST', path, body);
}

/**
 * Multipart POST. Do not set Content-Type — fetch adds the boundary.
 * Used by TZD-47 photo upload (`POST /api/photos/upload`, field `file`).
 */
export async function backendPostMultipart(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
  form: FormData,
): Promise<unknown> {
  const url = `${apiBaseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const auth = authFromEnvOrKey(apiKey);
  const res = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(auth, false),
    body: form,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new BackendError(
      `Backend POST ${path} → ${res.status}${errBody ? `: ${errBody.slice(0, 200)}` : ''}`,
      res.status,
    );
  }
  return parseJson(res);
}

export async function backendPatchJson(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
  body: unknown,
): Promise<unknown> {
  return backendRequest(apiBaseUrl, apiKey, 'PATCH', path, body);
}

export async function backendDeleteJson(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
): Promise<unknown> {
  return backendRequest(apiBaseUrl, apiKey, 'DELETE', path);
}
