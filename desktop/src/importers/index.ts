/**
 * Реестр импортёров файлов.
 *
 * Каждый импортёр: parse(file) → Promise<RawRow[]>.
 * Реализация — будущая TZ (Excel/csv: xlsx + papaparse; pdf: pdfjs-dist).
 */

import { excelImporter } from './excel';
import { csvImporter } from './csv';
import { textImporter } from './text';
import { pdfImporter } from './pdf';

/** Сырая строка: ключ — имя колонки, значение — ячейка. */
export interface RawRow {
  [column: string]: unknown;
}

export interface Importer {
  id: 'excel' | 'csv' | 'text' | 'pdf';
  label: string;
  extensions: string[];
  /** TODO: реализация парсинга в соответствующей TZ. */
  parse(file: File): Promise<RawRow[]>;
}

export const importers: Importer[] = [
  excelImporter,
  csvImporter,
  textImporter,
  pdfImporter,
];

/** Найти импортёр по расширению файла. */
export function importerFor(file: File): Importer | undefined {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return importers.find((i) => i.extensions.includes(ext));
}
