/**
 * Сборка системного промпта для AI-нормализации.
 *
 * Базовый промпт — общий; схема сущности подставляется из реестра
 * (GET /api/registry/data-sources). Полные тексты: ai/system-prompts/.
 */

/** TODO(ai): читать общий промпт из ai/system-prompts/general.md. */
const BASE_SYSTEM_PROMPT = `Ты — AI-помощник заполнения kppdf-8.0.
Ниже дана JSON-схема полей сущности. Верни СТРОГО валидный JSON-массив
объектов по этой схеме. Уточняй, если данные неясны. Ничего не выдумывай:
неизвестные значения оставляй пустыми или null.`;

/**
 * Собирает итоговый системный промпт: базовый + схема сущности.
 * @param entitySchema — описание полей сущности (из registry).
 */
export function buildSystemPrompt(entitySchema: string): string {
  return `${BASE_SYSTEM_PROMPT}\n\nСхема сущности (JSON):\n${entitySchema}`;
}
