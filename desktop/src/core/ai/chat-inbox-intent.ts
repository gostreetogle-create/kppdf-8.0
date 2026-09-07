/**
 * TZD-78 — распознаёт в сообщении чата упоминание файла Inbox + намерение
 * его разобрать. Чисто текстовая эвристика (без модели): чат не пишет в API
 * kppdf (LIMITED_HELPER) и не должен зависеть от рантайма провайдера, чтобы
 * работать даже без настроенного AI (см. ChatPanel.svelte).
 */

const INTENT_WORDS = [
  'разбери',
  'разобрать',
  'импортируй',
  'импорт',
  'открой',
  'открыть',
  'проверь',
  'сопоставь',
  'сопоставление',
  'файл',
];

/** Обрезает расширение файла для мягкого совпадения без «.xlsx» и т.п. */
function stemOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return (dot > 0 ? fileName.slice(0, dot) : fileName).trim().toLowerCase();
}

/**
 * Возвращает имя файла из `fileNames`, если сообщение похоже на команду его
 * разобрать (есть слово-триггер + узнаваемое имя/основа имени файла).
 * Точное совпадение имени с расширением приоритетнее совпадения по основе.
 */
export function matchInboxIntent(message: string, fileNames: readonly string[]): string | null {
  if (fileNames.length === 0) return null;
  const lower = message.trim().toLowerCase();
  if (!lower) return null;
  if (!INTENT_WORDS.some((word) => lower.includes(word))) return null;

  const exact = fileNames.find((name) => lower.includes(name.toLowerCase()));
  if (exact) return exact;

  const byStem = fileNames.find((name) => {
    const stem = stemOf(name);
    return stem.length >= 3 && lower.includes(stem);
  });
  return byStem ?? null;
}
