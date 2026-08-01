/**
 * Конфигурация десктоп-клиента.
 *
 * Хранится в app-data (Tauri) файлом config.json.
 * Запись атомарная: tmp-файл → rename (rename на Windows не перезаписывает).
 * Формат версионируется полем `version` — миграции в migrate().
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import {
  exists,
  mkdir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import { OLLAMA_DEFAULT } from './ai/defaults';

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

/** Версия формата файла конфига; инкремент при несовместимых изменениях. */
export const CONFIG_VERSION = 1;

export const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: '',
  aiProvider: { ...OLLAMA_DEFAULT },
};

const CONFIG_FILENAME = 'config.json';

function cloneDefault(): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    aiProvider: { ...DEFAULT_CONFIG.aiProvider },
  };
}

async function configPath(): Promise<string> {
  const dir = await appDataDir();
  return join(dir, CONFIG_FILENAME);
}

/**
 * Читает конфиг из app-data. Нет файла / повреждённый JSON / ошибка fs →
 * возвращает DEFAULT_CONFIG (копию, без мутаций глобальной константы).
 */
export async function loadConfig(): Promise<AppConfig> {
  try {
    const path = await configPath();
    if (!(await exists(path))) return cloneDefault();
    const raw = await readTextFile(path);
    const parsed = JSON.parse(raw) as { version?: number } & Partial<AppConfig>;
    return migrate(parsed);
  } catch {
    // Файл недоступен (в т.ч. вне Tauri-рантайма) или повреждён — дефолт.
    return cloneDefault();
  }
}

/**
 * Миграция формата: нормализует поля независимо от version.
 * TODO(migration): при version < CONFIG_VERSION — пошаговые апгрейды полей.
 */
function migrate(parsed: { version?: number } & Partial<AppConfig>): AppConfig {
  const cfg: AppConfig = {
    apiBaseUrl:
      typeof parsed.apiBaseUrl === 'string' ? parsed.apiBaseUrl : DEFAULT_CONFIG.apiBaseUrl,
    apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : undefined,
    username: typeof parsed.username === 'string' ? parsed.username : undefined,
    aiProvider:
      parsed.aiProvider && typeof parsed.aiProvider === 'object'
        ? parsed.aiProvider
        : { ...DEFAULT_CONFIG.aiProvider },
  };
  return cfg;
}

/** Сохраняет конфиг в app-data атомарно (tmp + rename). */
export async function saveConfig(config: AppConfig): Promise<void> {
  const dir = await appDataDir();
  await mkdir(dir, { recursive: true });
  const path = await configPath();
  const tmp = await join(dir, `${CONFIG_FILENAME}.tmp`);

  const body = JSON.stringify({ version: CONFIG_VERSION, ...config }, null, 2);
  await writeTextFile(tmp, body);

  if (await exists(path)) {
    // Windows: rename() не перезаписывает существующий файл — сначала удаляем.
    await remove(path);
  }
  await rename(tmp, path);
}
