/**
 * Shared env/config for KPPDF MCP host (TZD-11).
 * Pairing JWT = same token desktop stores as apiKey.
 */

export interface McpRuntimeConfig {
  apiBaseUrl: string;
  apiKey: string;
  host: string;
  port: number;
  allowLan: boolean;
}

function env(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim();
}

export function loadRuntimeConfig(): McpRuntimeConfig {
  const allowLan = ['1', 'true', 'yes'].includes(env('KPPDF_MCP_ALLOW_LAN').toLowerCase());
  const hostRaw = env('KPPDF_MCP_HOST', allowLan ? '0.0.0.0' : '127.0.0.1');
  const host = allowLan ? hostRaw || '0.0.0.0' : '127.0.0.1';
  const port = Number(env('KPPDF_MCP_PORT', '9743')) || 9743;
  return {
    apiBaseUrl: env('KPPDF_API_BASE_URL').replace(/\/+$/, ''),
    apiKey: env('KPPDF_API_KEY'),
    host,
    port,
    allowLan,
  };
}

export function assertAuthConfigured(cfg: McpRuntimeConfig): void {
  if (!cfg.apiBaseUrl) {
    throw new Error('KPPDF_API_BASE_URL is required (pairing apiBaseUrl)');
  }
  if (!cfg.apiKey) {
    throw new Error('KPPDF_API_KEY is required (pairing JWT)');
  }
}

/** Bearer from MCP HTTP client must match pairing key (fail closed). */
export function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return m?.[1]?.trim() || null;
}

export function isAuthorized(cfg: McpRuntimeConfig, authHeader: string | undefined): boolean {
  const token = extractBearer(authHeader);
  return !!token && token === cfg.apiKey;
}
