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

/** Настройки MCP host (TZD-14): порт и разрешение LAN-биндинга. */
export interface McpHostConfig {
  /** Порт HTTP MCP host (127.0.0.1:<port>/mcp). */
  port: number;
  /** Bind 0.0.0.0 (доступ по локальной сети). По умолчанию выключено. */
  allowLan: boolean;
  /**
   * Абсолютный путь к пакету `desktop/mcp` (`@kppdf/desktop-mcp`).
   * Нужен для установленного NSIS: resourceDir walk иначе даёт `%USERPROFILE%\mcp`.
   */
  hostDir?: string;
}

/** Настройки inbox-папки (TZD-15): куда класть файлы для агента. */
export interface InboxConfig {
  /** Абсолютный путь каталога; пустая строка = app-data/inbox по умолчанию. */
  dir?: string;
}

/** HTTP Basic («подъезд») для nginx перед публичным URL. Не admin login. */
export interface BasicAuthConfig {
  username: string;
  password: string;
}

export interface AppConfig {
  /** Базовый URL backend kppdf (например https://app.kppdf.ru). */
  apiBaseUrl: string;
  /** Pairing key (`kppd_…`), выданный веб-клиентом. */
  apiKey?: string;
  /** Имя пользователя, для которого выдан токен. */
  username?: string;
  /** Подъездный пароль nginx (prod). Пусто на LAN. */
  basicAuth?: BasicAuthConfig;
  aiProvider: AiProviderConfig;
  /** Ид выбранной встроенной модели (Фаза 2); пусто — модель не выбрана. */
  modelId?: string;
  /** MCP host: порт + bind (сохраняется между запусками). */
  mcp: McpHostConfig;
  /** Inbox (TZD-15): каталог для файлов агента. */
  inbox: InboxConfig;
}

/** Порт MCP host по умолчанию (совпадает с KPPDF_MCP_PORT в desktop/mcp). */
export const DEFAULT_MCP_PORT = 9743;

export const DEFAULT_MCP_CONFIG: McpHostConfig = {
  port: DEFAULT_MCP_PORT,
  allowLan: false,
};

/**
 * Версия формата файла конфига; инкремент при несовместимых изменениях.
 * v2 (TZD-14): добавлен блок `mcp` { port, allowLan }.
 * v3 (TZD-15): добавлен блок `inbox` { dir }.
 * v4: optional `basicAuth` { username, password } for nginx «подъезд».
 * v5: optional `mcp.hostDir` absolute path to @kppdf/desktop-mcp.
 */
export const CONFIG_VERSION = 5;

export const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: '',
  aiProvider: { ...OLLAMA_DEFAULT },
  mcp: { ...DEFAULT_MCP_CONFIG },
  inbox: {},
};

const CONFIG_FILENAME = 'config.json';

function cloneDefault(): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    aiProvider: { ...DEFAULT_CONFIG.aiProvider },
    mcp: { ...DEFAULT_CONFIG.mcp },
    inbox: { ...DEFAULT_CONFIG.inbox },
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
/** Нормализует блок mcp из файла (v1 конфиги без mcp получают дефолт). */
function migrateMcp(raw: unknown): McpHostConfig {
  const mcp =
    raw && typeof raw === 'object' ? (raw as Partial<McpHostConfig>) : undefined;
  const port =
    typeof mcp?.port === 'number' && Number.isInteger(mcp.port) && mcp.port > 0 && mcp.port <= 65535
      ? mcp.port
      : DEFAULT_MCP_PORT;
  const hostDir =
    typeof mcp?.hostDir === 'string' && mcp.hostDir.trim() ? mcp.hostDir.trim() : undefined;
  return { port, allowLan: mcp?.allowLan === true, hostDir };
}

/** Нормализует блок inbox из файла (старые конфиги без inbox → дефолт). */
function migrateInbox(raw: unknown): InboxConfig {
  const inbox =
    raw && typeof raw === 'object' ? (raw as Partial<InboxConfig>) : undefined;
  const dir = typeof inbox?.dir === 'string' && inbox.dir.trim() ? inbox.dir : undefined;
  return { dir };
}

function migrateBasicAuth(raw: unknown): BasicAuthConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const b = raw as Partial<BasicAuthConfig>;
  const username = typeof b.username === 'string' ? b.username.trim() : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (!username) return undefined;
  return { username, password };
}

function migrate(parsed: { version?: number } & Partial<AppConfig>): AppConfig {
  const cfg: AppConfig = {
    apiBaseUrl:
      typeof parsed.apiBaseUrl === 'string' ? parsed.apiBaseUrl : DEFAULT_CONFIG.apiBaseUrl,
    apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : undefined,
    username: typeof parsed.username === 'string' ? parsed.username : undefined,
    basicAuth: migrateBasicAuth(parsed.basicAuth),
    aiProvider:
      parsed.aiProvider && typeof parsed.aiProvider === 'object'
        ? parsed.aiProvider
        : { ...DEFAULT_CONFIG.aiProvider },
    modelId: typeof parsed.modelId === 'string' && parsed.modelId.trim() ? parsed.modelId.trim() : undefined,
    mcp: migrateMcp(parsed.mcp),
    inbox: migrateInbox(parsed.inbox),
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
