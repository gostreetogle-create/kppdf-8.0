/**
 * Пресеты для карточки «Модель по API» (TZD-65) — OpenAI-совместимые
 * бесплатные/дешёвые шлюзы, чтобы проверить чат без скачивания GGUF.
 * Пресет заполняет только URL и id модели — ключ всегда вводится вручную,
 * настоящий ключ PO в код не зашивается.
 */

export interface ApiPreset {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
  /** Куда идти за ключом — подсказка в UI, не сам ключ. */
  keyHint: string;
}

export const API_PRESETS: readonly ApiPreset[] = [
  {
    id: 'tokenrouter-qwen3.8-max-free',
    label: 'TokenRouter · Qwen 3.8 Max Free',
    baseUrl: 'https://api.tokenrouter.com/v1',
    model: 'qwen/qwen3.8-max-free',
    keyHint: 'Бесплатный ключ — в личном кабинете tokenrouter.com, вставьте его сюда сами.',
  },
];

export function apiPresetById(id: string): ApiPreset | undefined {
  return API_PRESETS.find((preset) => preset.id === id);
}
