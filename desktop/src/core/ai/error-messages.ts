/**
 * TZD-67: friendly RU text for AI-tab fetch failures, shared by the chat
 * panel, the API-provider check, and the local-model download flow — before
 * this, raw `Failed to fetch` / other JS `Error.message` strings leaked to
 * the user unwrapped (only the API-provider path had RU text, see
 * `checkApiProvider()` in App.svelte, TZD-65).
 */
import { ChatApiError } from './client';

/** Chat-completion request failed (local runner or remote API-compatible endpoint). */
export function describeChatError(err: unknown): string {
  if (err instanceof ChatApiError) {
    if (err.status === 401) return 'Ключ не принят (401) — проверьте API-ключ.';
    if (err.status === 429) return 'Лимит запросов исчерпан (429) — попробуйте позже.';
    return `Сервер ответил ${err.status} — проверьте URL и id модели.`;
  }
  return 'Нет связи с моделью — раннер мог ещё не подняться или сменить порт. Нажмите «Перезапустить» и попробуйте снова.';
}

/** Raw browser fetch to the local runner's own endpoints (download/health) failed to connect at all. */
export function describeRunnerFetchError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/failed to fetch|networkerror|load failed|econnrefused/i.test(message)) {
    return 'Не удалось связаться с локальным AI-раннером — он мог ещё не подняться или сменить порт. Нажмите «Перезапустить» и попробуйте снова.';
  }
  return message;
}
