/**
 * Тонкий HTTP-клиент к backend kppdf.
 *
 * Auth transport (после Basic Auth на nginx / «подъезд»):
 * - pairing key → `X-Access-Token` (не Authorization — иначе nginx 401)
 * - опционально HTTP Basic → `Authorization: Basic …` для публичного URL
 *
 * LAN без подъезда: достаточно X-Access-Token (Nest принимает).
 */

export interface HttpBasicAuth {
  username: string;
  password: string;
}

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  /** Подъездный пароль nginx (prod). Не путать с admin login. */
  basicAuth?: HttpBasicAuth;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Уникальный ключ идемпотентности для одной строки данных (RFC 4122 v4). */
export function idempotencyKey(): string {
  return crypto.randomUUID();
}

function baseUrlOf(options: ApiClientOptions): string {
  return options.baseUrl.replace(/\/+$/, '');
}

/** Shared header name with SPA / Nest (`jwt-access-header.ts`). */
export const JWT_ACCESS_HEADER = 'X-Access-Token';

function encodeBasic(basic: HttpBasicAuth): string {
  const raw = `${basic.username}:${basic.password ?? ''}`;
  // ASCII-safe for htpasswd logins; btoa available in Tauri WebView.
  return btoa(raw);
}

export function headersOf(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.apiKey) {
    headers[JWT_ACCESS_HEADER] = options.apiKey;
  }
  if (options.basicAuth?.username) {
    headers['Authorization'] = `Basic ${encodeBasic(options.basicAuth)}`;
  }
  return headers;
}

/** TODO(паринг): GET-запрос, обработка 401/403 с русскими сообщениями. */
export async function apiGet<T>(
  options: ApiClientOptions,
  path: string,
): Promise<T> {
  const res = await fetch(`${baseUrlOf(options)}${path}`, {
    headers: headersOf(options),
  });
  if (!res.ok) {
    throw new ApiError(`GET ${path} → ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

/** POST-запрос с опциональным Idempotency-Key. */
export async function apiPost<T>(
  options: ApiClientOptions,
  path: string,
  body: unknown,
  key?: string,
): Promise<T> {
  return requestJson<T>(options, 'POST', path, body, key);
}

export async function apiPatch<T>(
  options: ApiClientOptions,
  path: string,
  body: unknown,
): Promise<T> {
  return requestJson<T>(options, 'PATCH', path, body);
}

export async function apiDelete<T>(options: ApiClientOptions, path: string): Promise<T> {
  return requestJson<T>(options, 'DELETE', path);
}

async function requestJson<T>(
  options: ApiClientOptions,
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  key?: string,
): Promise<T> {
  const headers = headersOf(options);
  if (key) headers['Idempotency-Key'] = key;
  const res = await fetch(`${baseUrlOf(options)}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new ApiError(`${method} ${path} → ${res.status}`, res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
