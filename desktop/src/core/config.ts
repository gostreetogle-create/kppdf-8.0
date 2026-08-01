/**
 * Конфигурация десктоп-клиента.
 *
 * Хранится локально в app-data (Tauri). TODO(паринг): реализовать
 * load/save через @tauri-apps/plugin-fs — будущая TZ.
 */

export interface AiProviderConfig {
  type: 'local-ollama' | 'remote';
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export interface AppConfig {
  /** Базовый URL backend kppdf (например https://app.kppdf.ru). */
  apiBaseUrl: string;
  /** Bearer-токен паринга, выданный веб-клиентом. */
  apiKey?: string;
  /** Имя пользователя, для которого выдан токен. */
  username?: string;
  aiProvider: AiProviderConfig;
}

export const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: '',
  aiProvider: {
    type: 'local-ollama',
    baseUrl: 'http://localhost:11434',
    model: 'qwen2.5:7b',
  },
};

/**
 * TODO(паринг): прочитать конфиг из app-data; при отсутствии вернуть DEFAULT_CONFIG.
 * Формат файла, миграция версий, атомарная запись — в TZ паринга.
 */
export async function loadConfig(): Promise<AppConfig> {
  return { ...DEFAULT_CONFIG };
}

/** TODO(паринг): сохранить конфиг в app-data (tmp + rename). */
export async function saveConfig(_config: AppConfig): Promise<void> {
  // TODO
}
