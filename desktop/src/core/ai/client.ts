/**
 * Клиент OpenAI-совместимого чат-API.
 * POST {baseUrl}/v1/chat/completions — единый формат для Ollama и remote.
 */

import type { ChatRequest, ChatResponse } from './types';
import { normalizeChatCompletionsUrl } from './chat-url';

export interface ChatClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

/** Ошибка не-200 от чат-API — несёт `status`, чтобы вызывающий код мог дать RU-текст (401/429/…). */
export class ChatApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

export async function chatCompletion(
  options: ChatClientOptions,
  request: ChatRequest,
): Promise<ChatResponse> {
  const url = normalizeChatCompletionsUrl(options.baseUrl);
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
    throw new ChatApiError(res.status, `Chat API вернул ${res.status} (${url})`);
  }
  return (await res.json()) as ChatResponse;
}
