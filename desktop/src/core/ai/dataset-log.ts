/**
 * TZD-AI-IMPORT-HITL-DATASET-LOG — opt-in local JSONL лог HITL-подтверждений.
 *
 * Цель: сырьё для будущего Soup-датасета (raw → confirmed JSON), которого
 * сегодня нет ни в mutation_journal, ни в import_task (см.
 * `docs/audits/2026-09-11-soup-sft-import-decision.md` §2). Строго
 * локально — `app-data/ai-dataset-log.jsonl`, никакой отправки в облако,
 * никакого HuggingFace. Выключен по умолчанию: пишет только при явном
 * согласии оператора (переключатель на вкладке «Импорт»).
 *
 * Разбито на детерминированную часть (тестируется без Tauri: redaction,
 * сборка записи, формат строки) и fs-запись (не юнит-тестируется —
 * тот же паттерн, что у `config.ts`/`inbox.ts`, тоже без .test.ts).
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import { exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export const DATASET_LOG_FILENAME = 'ai-dataset-log.jsonl';
/** Отдельный файл-переключатель — не в config.json: опт-ин датасет-лог
 * сознательно не путается с основными настройками аккаунта/AI-провайдера. */
const DATASET_LOG_SETTING_FILENAME = 'ai-dataset-log-enabled.json';

/** Длинные строковые значения обрезаются — не PII-фильтр, просто гигиена размера файла. */
const MAX_STRING_LENGTH = 500;

export interface DatasetLogEntry {
  /** ImportTargetKey — какая целевая таблица подтверждена. */
  schemaId: string;
  /** Исходные строки (как пришли из файла, до маппинга) — обрезаны по длине значений. */
  rawRows: Record<string, unknown>[];
  /** Итоговые значения после HITL-подтверждения (то, что реально ушло/пошло в SoT). */
  confirmedPayload: Record<string, unknown>[];
  ts: string;
  source: 'hitl-confirm';
}

function redactValue(value: unknown): unknown {
  if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
    return `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]`;
  }
  return value;
}

function redactRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = redactValue(value);
  }
  return out;
}

/** Собирает одну запись лога (детерминированно, без сети/fs — тестируется напрямую). */
export function buildDatasetLogEntry(
  schemaId: string,
  rawRows: readonly Record<string, unknown>[],
  confirmedPayload: readonly Record<string, unknown>[],
): DatasetLogEntry {
  return {
    schemaId,
    rawRows: rawRows.map(redactRow),
    confirmedPayload: confirmedPayload.map(redactRow),
    ts: new Date().toISOString(),
    source: 'hitl-confirm',
  };
}

/** Одна JSONL-строка (без завершающего \n — его добавляет appendDatasetLogEntry). */
export function formatDatasetLogLine(entry: DatasetLogEntry): string {
  return JSON.stringify(entry);
}

async function datasetLogPath(): Promise<string> {
  return join(await appDataDir(), DATASET_LOG_FILENAME);
}

/** Дописывает одну строку JSONL (создаёт файл при отсутствии) — тот же приём, что `appendInboxLog` (`core/inbox.ts`). */
export async function appendDatasetLogEntry(entry: DatasetLogEntry): Promise<void> {
  const path = await datasetLogPath();
  let existing = '';
  try {
    existing = (await readTextFile(path)) || '';
  } catch {
    // файла ещё нет — начинаем с пустого
  }
  const line = formatDatasetLogLine(entry);
  await writeTextFile(path, `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${line}\n`);
}

async function datasetLogSettingPath(): Promise<string> {
  return join(await appDataDir(), DATASET_LOG_SETTING_FILENAME);
}

/** По умолчанию OFF; любая ошибка чтения (файла нет, битый JSON) — тоже OFF, не молчаливое включение. */
export async function isDatasetLogEnabled(): Promise<boolean> {
  try {
    const path = await datasetLogSettingPath();
    if (!(await exists(path))) return false;
    const raw = await readTextFile(path);
    const parsed = JSON.parse(raw) as { enabled?: unknown };
    return parsed.enabled === true;
  } catch {
    return false;
  }
}

export async function setDatasetLogEnabled(enabled: boolean): Promise<void> {
  const path = await datasetLogSettingPath();
  await writeTextFile(path, JSON.stringify({ enabled }, null, 2));
}
