import { IMPORT_TARGETS, type ImportTargetKey } from '../import-targets';
import type { TableSuggestion } from '../multi-import';

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

/**
 * TZD-78 — лучшая догадка целевой таблицы среди `analyzeTables()` (без AI):
 * максимум готовых (`ready`) колонок; при равенстве — первая по порядку
 * (уже приоритезирована `IMPORT_TARGET_ORDER` в `multi-import.ts`).
 */
export function pickBestTableSuggestion(
  suggestions: readonly TableSuggestion[],
): TableSuggestion | undefined {
  return suggestions.reduce<TableSuggestion | undefined>(
    (best, suggestion) => (!best || suggestion.readyCount > best.readyCount ? suggestion : best),
    undefined,
  );
}

/**
 * TZD-78 — короткая RU-сводка для чата: файл Inbox → таблица + готовые/на
 * проверку колонки. Детерминирована (без обращения к модели) — чат-команда
 * «разбери файл X» работает даже без настроенного AI-провайдера.
 */
export function buildInboxMappingSummary(
  fileName: string,
  rowCount: number,
  best: TableSuggestion | undefined,
): string {
  if (rowCount === 0) {
    return `Файл «${fileName}» прочитан, но строк с данными не нашлось.`;
  }
  if (!best) {
    return (
      `Файл «${fileName}» (${rowCount} строк): колонки не похожи на известные поля. ` +
      'Откройте в Импорте и сопоставьте вручную — кнопка ниже.'
    );
  }
  const label = IMPORT_TARGETS[best.targetKey].label;
  const needCheck = best.mapping.rows.filter(
    (row) => row.state !== 'ready' && row.state !== 'ignored',
  ).length;
  return (
    `Файл «${fileName}» (${rowCount} строк) похож на таблицу «${label}»: ` +
    `колонок распознано ${best.readyCount}, требует проверки ${needCheck}. ` +
    'Открою в Импорте — запись в базу только после вашего подтверждения там.'
  );
}
