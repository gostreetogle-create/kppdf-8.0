import { IMPORT_TARGETS, type ImportTargetKey } from '../import-targets';

/**
 * Промпт для локальной модели: сопоставить заголовки колонок файла с полями
 * целевой таблицы. Модель ничего не записывает — только предлагает карту,
 * которую человек подтверждает в студии импорта.
 */
export function buildMappingPrompt(
  headers: readonly string[],
  targetKey: ImportTargetKey,
): { system: string; user: string } {
  const target = IMPORT_TARGETS[targetKey];
  const fields = target.columns
    .map((column) => `${column.key} — «${column.label}»`)
    .join('\n');
  const system =
    'Ты — помощник импорта данных в систему kppdf. Ты НЕ записываешь данные: ' +
    'только предлагаешь соответствие колонок файла полям таблицы. ' +
    'Отвечай СТРОГО одним JSON-объектом без пояснений и без markdown-кода.';
  const user =
    `Целевая таблица: ${target.label}.\n` +
    `Доступные поля (ключ — «название»):\n${fields}\n\n` +
    `Заголовки колонок файла:\n${headers.map((header, index) => `${index + 1}. ${header}`).join('\n')}\n\n` +
    'Верни JSON вида {"<заголовок из файла>": "<ключ поля>"} только для колонок, ' +
    'которые однозначно соответствуют полю. Для неопределённых колонок поставь null или пропусти. ' +
    'Используй только ключи из списка полей.';
  return { system, user };
}

/**
 * Достаёт JSON из ответа модели и отбрасывает ключи, которых нет в целевой
 * таблице (модель может выдумать поле — такой маппинг игнорируется).
 */
export function parseMappingJson(
  text: string,
  targetKey: ImportTargetKey,
): Record<string, string | null> {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return {};
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const validKeys = new Set<string>(IMPORT_TARGETS[targetKey].columns.map((column) => column.key));
  const out: Record<string, string | null> = {};
  for (const [header, value] of Object.entries(raw as Record<string, unknown>)) {
    out[header] = typeof value === 'string' && validKeys.has(value) ? value : null;
  }
  return out;
}
