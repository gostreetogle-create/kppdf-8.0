/**
 * Строит URL `/v1/chat/completions` из `baseUrl` провайдера без дублирования
 * `/v1` (TZD-65). Пример бага: TokenRouter даёт `base_url` уже с `/v1`
 * (`https://api.tokenrouter.com/v1`) — слепая склейка `baseUrl + '/v1/chat/completions'`
 * даёт `…/v1/v1/chat/completions`.
 */
export function normalizeChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (/\/v1\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
}
