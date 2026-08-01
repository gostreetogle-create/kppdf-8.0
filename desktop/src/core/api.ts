/**
 * Тонкий HTTP-клиент к backend kppdf.
 *
 * Только инфраструктура: baseUrl + Authorization Bearer + GET/POST с
 * опциональным Idempotency-Key. Методы — стабы (TODO: реальные вызовы
 * появятся вместе с парингом и импортом).
 */

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
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

function headersOf(options: ApiClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.apiKey) {
    headers['Authorization'] = `Bearer ${options.apiKey}`;
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

/**
 * POST-запрос. Передача key — через заголовок Idempotency-Key.
 * TODO(import): добавить retry/таймаут, формирование ошибок от сервера.
 */
export async function apiPost<T>(
  options: ApiClientOptions,
  path: string,
  body: unknown,
  key?: string,
): Promise<T> {
  const headers = headersOf(options);
  if (key) {
    headers['Idempotency-Key'] = key;
  }
  const res = await fetch(`${baseUrlOf(options)}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(`POST ${path} → ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}
