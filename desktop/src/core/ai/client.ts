/**
 * Клиент OpenAI-совместимого чат-API.
 * POST {baseUrl}/v1/chat/completions — единый формат для Ollama и remote.
 */

import type { ChatRequest, ChatResponse } from './types';

export interface ChatClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

/** TODO(ai-import): обработка не-200 (401/404/429) с русскими сообщениями. */
export async function chatCompletion(
  options: ChatClientOptions,
  request: ChatRequest,
): Promise<ChatResponse> {
  const url = `${options.baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.apiKey) {
    headers['Authorization'] = `Bearer ${options.apiKey}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
  });

  if (!res.ok) {
    throw new Error(`Chat API вернул ${res.status} (${url})`);
  }
  return (await res.json()) as ChatResponse;
}
