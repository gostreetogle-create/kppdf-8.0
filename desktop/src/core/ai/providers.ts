/**
 * Селектор AI-провайдера: локальный Ollama (по умолчанию) или
 * удалённый OpenAI-совместимый endpoint из конфига.
 */

import type { AiProviderConfig } from '../config';
import { OLLAMA_DEFAULT } from './defaults';

export { OLLAMA_DEFAULT };

export interface ResolvedProvider {
  baseUrl: string;
  apiKey?: string;
  model: string;
  /** Удалённый провайдер — общаться с сетью, локальный — нет. */
  isRemote: boolean;
}

/** Преобразует конфиг в готовые параметры для chatCompletion(). */
export function resolveProvider(config: AiProviderConfig): ResolvedProvider {
  if (config.type === 'remote') {
    return {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      isRemote: true,
    };
  }
  // Локальный Ollama: API-ключ не нужен, baseUrl обычно localhost:11434.
  return {
    baseUrl: config.baseUrl || OLLAMA_DEFAULT.baseUrl,
    model: config.model || OLLAMA_DEFAULT.model,
    isRemote: false,
  };
}

/** TODO(ai): проверка доступности провайдера (GET /api/tags для Ollama). */
export async function pingProvider(_config: AiProviderConfig): Promise<boolean> {
  return false;
}
