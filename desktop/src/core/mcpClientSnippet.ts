/**
 * TZD-20: готовый фрагмент / полный mcp.json для Cursor и LM Studio.
 * Только clipboard — не пишет в чужие mcp.json на диске.
 */

export type McpClientSnippetMode = 'full' | 'fragment';

export interface BuildMcpClientSnippetOpts {
  port: number;
  apiKey: string;
  /** Ключ сервера в mcpServers. Default: kppdf */
  serverKey?: string;
  /** full = standalone mcp.json; fragment = только запись "kppdf": {...} */
  mode?: McpClientSnippetMode;
}

function mcpUrl(port: number): string {
  return `http://127.0.0.1:${port}/mcp`;
}

function serverEntry(port: number, apiKey: string): Record<string, unknown> {
  return {
    url: mcpUrl(port),
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };
}

/**
 * Возвращает JSON-текст для вставки в Cursor / LM Studio.
 * Fragment — без обёртки mcpServers и без ведущей/хвостовой запятой.
 */
export function buildMcpClientSnippet(opts: BuildMcpClientSnippetOpts): string {
  const serverKey = opts.serverKey ?? 'kppdf';
  const mode = opts.mode ?? 'full';
  const entry = serverEntry(opts.port, opts.apiKey);

  if (mode === 'fragment') {
    // `"kppdf": { ... }` — содержимое после mcpServers, как в LM Studio docs.
    return `${JSON.stringify(serverKey)}: ${JSON.stringify(entry, null, 2)}`;
  }

  return JSON.stringify(
    {
      mcpServers: {
        [serverKey]: entry,
      },
    },
    null,
    2,
  );
}
