/**
 * Единый источник дефолта локального Ollama.
 * Используется и в config.ts (DEFAULT_CONFIG), и в providers.ts (resolveProvider).
 */

import type { AiProviderConfig } from '../config';

export const OLLAMA_DEFAULT: AiProviderConfig = {
  type: 'local-ollama',
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5:7b',
};
