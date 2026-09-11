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

/**
 * TZD-AI-IMPORT-MAPPING-OLLAMA — быстрая (короткий таймаут) проверка
 * доступности провайдера перед тем, как звать реальный чат-запрос.
 * Ollama: `GET /api/tags` — документированный, дешёвый health-check.
 * Remote: нет универсального дешёвого пинга для произвольного
 * OpenAI-совместимого шлюза (не у всех есть /v1/models) — оптимистично
 * считаем настроенный remote «доступным»; настоящий сбой (сеть/401/429)
 * честно всплывает из самого вызова `chatCompletion`, не молчит.
 */
export async function pingProvider(config: AiProviderConfig): Promise<boolean> {
  const provider = resolveProvider(config);
  if (provider.isRemote) return true;
  try {
    const url = `${provider.baseUrl.replace(/\/+$/, '')}/api/tags`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}
