/**
 * AI-пайплайн массового импорта.
 *
 * Шаги: parse → normalize → confirm → batchPost.
 * normalize wired: TZD-AI-IMPORT-GENERAL-BASELINE (general.md + chatCompletion,
 * retry on invalid JSON). parse/confirm/batchPost — типы и сигнатуры, реализация
 * — будущая TZ.
 */

import type { RawRow } from '../importers';
import { idempotencyKey } from './api';
import { chatCompletion, type ChatClientOptions } from './ai/client';
import type { ResolvedProvider } from './ai/providers';
import {
  buildNormalizePrompt,
  buildNormalizeRetryMessage,
  parseNormalizeResponse,
  type ParsedNormalizeResult,
} from './ai/normalize';
import { isImportTargetKey, type ImportTargetKey } from './import-targets';
import type { ChatMessage } from './ai/types';

/** Строка после нормализации: поля сущности + метаданные источника. */
export interface NormalizedRow {
  /** Сущность-приёмник (product/material/counterparty/...). */
  entity: string;
  /** Схема (описание полей), которой соответствует строка. */
  schemaId: string;
  /** Значения полей после AI-нормализации. */
  fields: Record<string, unknown>;
  /** idempotencyKey() — для батч-поста (per-row). */
  key: string;
  /** Источник: номер строки/листа, если известен. */
  source?: string;
}

/** Результат normalizeStep: строки + мета-сообщения общие на весь батч (формат general.md). */
export interface NormalizeStepResult {
  rows: NormalizedRow[];
  questions: string[];
  errors: string[];
  skipped: string[];
}

export interface BatchPostResult {
  okCount: number;
  failed: Array<{ key: string; error: string }>;
}

/**
 * Шаг 1. Парсинг файла в сырые строки (importers/*).
 * TODO(import): выбор импортёра по расширению, прогресс.
 * TODO(import): сигнатура устарела — контракт импортёров теперь
 * ImportSource { name, data } (см. importers/index.ts), а не File.
 */
export async function parseStep(_file: File): Promise<RawRow[]> {
  // TODO
  return [];
}

async function callAndParseNormalize(
  clientOptions: ChatClientOptions,
  model: string,
  messages: ChatMessage[],
  schemaId: ImportTargetKey,
): Promise<{ parsed: ParsedNormalizeResult; messages: ChatMessage[] }> {
  const res = await chatCompletion(clientOptions, {
    model,
    messages,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });
  const text = res.choices?.[0]?.message?.content ?? '';
  return { parsed: parseNormalizeResponse(text, schemaId), messages };
}

/**
 * Шаг 2. AI-нормализация: сырые строки + схема из IMPORT_TARGETS →
 * структурированные поля. Один повтор при невалидном JSON (general.md
 * просит строгий JSON, но не все модели/кванты держат формат стабильно).
 * Никаких записей в БД — только возвращает NormalizedRow[] + мета.
 */
export async function normalizeStep(
  rows: RawRow[],
  schemaId: string,
  provider: ResolvedProvider,
): Promise<NormalizeStepResult> {
  if (!isImportTargetKey(schemaId)) {
    return { rows: [], questions: [], errors: [`Неизвестная схема: ${schemaId}`], skipped: [] };
  }
  if (rows.length === 0) {
    return { rows: [], questions: [], errors: [], skipped: [] };
  }

  const { system, user } = await buildNormalizePrompt(rows, schemaId);
  const clientOptions: ChatClientOptions = {
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    timeoutMs: 120_000,
  };
  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  let { parsed } = await callAndParseNormalize(clientOptions, provider.model, messages, schemaId);
  if (!parsed.ok) {
    const retryMessages = [...messages, buildNormalizeRetryMessage()];
    ({ parsed } = await callAndParseNormalize(clientOptions, provider.model, retryMessages, schemaId));
  }

  if (!parsed.ok) {
    return {
      rows: [],
      questions: [],
      errors: ['Модель не вернула валидный JSON после повтора.'],
      skipped: [],
    };
  }

  const normalizedRows: NormalizedRow[] = parsed.rows.map((fields, index) => ({
    entity: schemaId,
    schemaId,
    fields,
    key: idempotencyKey(),
    source: String(index + 1),
  }));

  return {
    rows: normalizedRows,
    questions: parsed.questions,
    errors: parsed.errors,
    skipped: parsed.skipped,
  };
}

/**
 * Шаг 3. Подтверждение пользователем: показать результат нормализации,
 * дать поправить вручную (Svelte-таблица), затем продолжить.
 * TODO(ui): экран подтверждения.
 */
export async function confirmStep(_rows: NormalizedRow[]): Promise<NormalizedRow[]> {
  // TODO
  return _rows;
}

/**
 * Шаг 4. Батч-отправка на сервер с per-row Idempotency-Key.
 * TODO(import): пакетная обработка, ретраи, отчёт об ошибках.
 */
export async function batchPostStep(_rows: NormalizedRow[]): Promise<BatchPostResult> {
  // TODO
  return { okCount: 0, failed: [] };
}
