/**
 * Backend HTTP helpers using pairing JWT.
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
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
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
