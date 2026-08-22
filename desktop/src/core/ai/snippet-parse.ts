/**
 * Разбирает вставленный пример подключения (Python SDK / JSON / curl) на три
 * поля карточки «Модель по API» (TZD-65) — `base_url`, `api_key`, `model`.
 * Только регэкспы, никакого `eval`/`Function` — текст может прийти откуда
 * угодно (сайт провайдера).
 */

export interface ParsedApiSnippet {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

// Optional `["']?` after the key name covers JSON's closing quote (`"base_url": "…"`),
// on top of plain Python/curl kwargs (`base_url="…"`).
const BASE_URL_KV_RE = /\bbase[_-]?url["']?\s*[:=]\s*["']([^"']+)["']/i;
const API_KEY_KV_RE = /\bapi[_-]?key["']?\s*[:=]\s*["']([^"']+)["']/i;
const MODEL_KV_RE = /\bmodel["']?\s*[:=]\s*["']([^"']+)["']/i;
const BEARER_RE = /Authorization["']?\s*[:=]\s*["']?Bearer\s+([^\s"'\\]+)/i;
const ANY_URL_RE = /https?:\/\/[^\s"'<>)]+/i;

/** Обрезает хвостовую пунктуацию и суффикс `/chat/completions`, если URL взят из curl. */
function cleanupUrl(raw: string): string {
  let url = raw.replace(/[),.;]+$/, '');
  url = url.replace(/\/chat\/completions\/?$/i, '');
  return url.replace(/\/+$/, '');
}

/**
 * Возвращает то, что удалось найти; пустой объект (все поля undefined),
 * если в тексте нет ни одного узнаваемого поля — вызывающий код должен
 * показать RU-подсказку «впиши три поля вручную».
 */
export function parseApiSnippet(text: string): ParsedApiSnippet {
  const result: ParsedApiSnippet = {};

  const baseUrlMatch = BASE_URL_KV_RE.exec(text);
  if (baseUrlMatch) {
    result.baseUrl = cleanupUrl(baseUrlMatch[1].trim());
  } else {
    const urlMatch = ANY_URL_RE.exec(text);
    if (urlMatch) result.baseUrl = cleanupUrl(urlMatch[0]);
  }

  const apiKeyMatch = API_KEY_KV_RE.exec(text) ?? BEARER_RE.exec(text);
  if (apiKeyMatch) result.apiKey = apiKeyMatch[1].trim();

  const modelMatch = MODEL_KV_RE.exec(text);
  if (modelMatch) result.model = modelMatch[1].trim();

  return result;
}

/** true, если разбор не нашёл вообще ничего полезного. */
export function isEmptySnippetResult(parsed: ParsedApiSnippet): boolean {
  return !parsed.baseUrl && !parsed.apiKey && !parsed.model;
}
