/**
 * Backend calls using pairing JWT.
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

export async function backendGetJson(
  apiBaseUrl: string,
  apiKey: string,
  path: string,
): Promise<unknown> {
  const url = `${apiBaseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new BackendError(
      `Backend ${path} → ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`,
      res.status,
    );
  }
  if (res.status === 204) return null;
  return res.json();
}
