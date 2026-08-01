/**
 * AI-пайплайн массового импорта.
 *
 * Шаги: parse → normalize → confirm → batchPost.
 * Здесь — только типы и сигнатуры. Реализация — будущая TZ (AI-импорт).
 */

import type { RawRow } from '../importers';

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

/**
 * Шаг 2. AI-нормализация: сырые строки + схема из /api/registry/data-sources
 * → структурированные поля (см. core/ai/).
 * TODO(ai-import): вызов chatCompletion, JSON-режим, повтор при ошибке формата.
 */
export async function normalizeStep(_rows: RawRow[], _schemaId: string): Promise<NormalizedRow[]> {
  // TODO
  return [];
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
