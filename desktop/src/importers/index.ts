/**
 * Реестр импортёров файлов.
 *
 * Каждый импортёр: parse(source) → Promise<RawRow[]>.
 * Источник — имя файла + байты (Tauri readFile даёт Uint8Array;
 * drag&drop — ArrayBuffer). Реализация: excel/csv — v0.3,
 * text/pdf — будущие TZ.
 */

import { excelImporter } from './excel';
import { csvImporter } from './csv';
import { textImporter } from './text';
import { pdfImporter } from './pdf';

/** Сырая строка: ключ — имя колонки, значение — ячейка. */
export interface RawRow {
  [column: string]: unknown;
}

/** Источник данных для импортёра: имя файла + байты. */
export interface ImportSource {
  name: string;
  data: ArrayBuffer | Uint8Array;
}

export interface Importer {
  id: 'excel' | 'csv' | 'text' | 'pdf';
  label: string;
  extensions: string[];
  /** TODO: реализация парсинга (text/pdf — будущие TZ). */
  parse(source: ImportSource): Promise<RawRow[]>;
}

export const importers: Importer[] = [
  excelImporter,
  csvImporter,
  textImporter,
  pdfImporter,
];

/** Найти импортёр по имени файла (по расширению). */
export function importerFor(fileName: string): Importer | undefined {
  const dot = fileName.lastIndexOf('.');
  if (dot === -1) return undefined; // нет расширения
  const ext = fileName.slice(dot).toLowerCase();
  return importers.find((i) => i.extensions.includes(ext));
}
