/**
 * Импортёр Excel (xlsx/xls) через библиотеку xlsx (SheetJS).
 */

import * as XLSX from 'xlsx';
import type { Importer, ImportSource, RawRow } from './index';

function isEmptyCell(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Нормализует значение ячейки: string/number/boolean/Date, иначе null. */
function normalizeCell(value: unknown): unknown {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return null;
}

export const excelImporter: Importer = {
  id: 'excel',
  label: 'Excel (XLSX)',
  extensions: ['.xlsx', '.xls'],
  async parse(source: ImportSource): Promise<RawRow[]> {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(source.data, { type: 'array', cellDates: true });
    } catch {
      throw new Error(
        `«${source.name}» не является Excel-книгой или файл повреждён. Поддерживаются .xlsx и .xls.`,
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error(`В «${source.name}» нет ни одного листа.`);
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: null,
    });

    // Первая непустая строка — заголовки колонок.
    const headerIdx = matrix.findIndex((row) => row.some((c) => !isEmptyCell(c)));
    if (headerIdx === -1) {
      throw new Error(`«${source.name}» пустой — нет данных для импорта.`);
    }
    const headerRow = matrix[headerIdx];

    // Пустые колонки отбрасываем: пропускаем колонку, если заголовок пуст
    // и все ячейки колонки ниже пусты.
    const colCount = headerRow.length;
    const keptColumns = Array.from({ length: colCount }, (_, c) => c).filter((col) => {
      if (!isEmptyCell(headerRow[col])) return true;
      for (let r = headerIdx + 1; r < matrix.length; r++) {
        if (!isEmptyCell(matrix[r][col])) return true;
      }
      return false;
    });

    const rows: RawRow[] = [];
    for (let r = headerIdx + 1; r < matrix.length; r++) {
      const row = matrix[r];
      // Пустую строку пропускаем.
      if (!row.some((c) => !isEmptyCell(c))) continue;

      const record: RawRow = {};
      for (const col of keptColumns) {
        // String(null) === 'null' (truthy) и whitespace-заголовки — обрабатываем через trim().
        const header = String(headerRow[col] ?? '').trim() || `колонка_${col + 1}`;
        record[header] = normalizeCell(row[col]);
      }
      rows.push(record);
    }
    return rows;
  },
};
