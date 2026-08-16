/**
 * Импортёр Excel (xlsx/xls) через библиотеку xlsx (SheetJS).
 */

import * as XLSX from 'xlsx';
import type { Importer, ImportSource, RawRow } from './index';

export interface ExcelSheetPreview {
  name: string;
  rows: RawRow[];
}

export interface ExcelWorkbookPreview {
  sheets: ExcelSheetPreview[];
  activeSheet: string;
}

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

/**
 * Находит строку заголовков в матрице листа.
 *
 * Файлы из CAD/PDM часто начинаются с «шапки» документа (заголовок,
 * объединённые ячейки), а настоящие заголовки колонок — в следующей строке.
 * Поэтому берём первую строку с «полным» набором непустых ячеек: не меньше
 * половины от максимума среди первых 10 непустых строк (минимум 2 ячейки).
 */
function findHeaderRow(matrix: unknown[][]): number {
  const MAX_SCAN = 10;
  const scan = matrix.slice(0, MAX_SCAN);
  const counts = scan.map((row) => row.filter((cell) => !isEmptyCell(cell)).length);
  const maxCount = Math.max(0, ...counts);
  if (maxCount === 0) return -1;
  const threshold = Math.max(2, Math.ceil(maxCount / 2));
  return counts.findIndex((count) => count >= threshold);
}

function parseSheet(sheet: XLSX.WorkSheet): RawRow[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
  const headerIdx = findHeaderRow(matrix);
  if (headerIdx === -1) return [];

  const headerRow = matrix[headerIdx];
  const keptColumns = Array.from({ length: headerRow.length }, (_, c) => c).filter((col) => {
    if (!isEmptyCell(headerRow[col])) return true;
    for (let r = headerIdx + 1; r < matrix.length; r++) {
      if (!isEmptyCell(matrix[r][col])) return true;
    }
    return false;
  });

  const rows: RawRow[] = [];
  for (let r = headerIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row.some((c) => !isEmptyCell(c))) continue;
    const record: RawRow = {};
    for (const col of keptColumns) {
      const header = String(headerRow[col] ?? '').trim() || `Колонка ${col + 1}`;
      record[header] = normalizeCell(row[col]);
    }
    rows.push(record);
  }
  return rows;
}

/** Parse every workbook sheet for the Import Studio sheet picker. */
export async function parseExcelWorkbook(source: ImportSource): Promise<ExcelWorkbookPreview> {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(source.data, { type: 'array', cellDates: true });
  } catch {
    throw new Error(
      `«${source.name}» не является Excel-книгой или файл повреждён. Поддерживаются .xlsx и .xls.`,
    );
  }

  const sheets = workbook.SheetNames.map((name) => ({
    name,
    rows: parseSheet(workbook.Sheets[name]),
  }));
  if (sheets.length === 0) throw new Error(`В «${source.name}» нет ни одного листа.`);
  const firstWithRows = sheets.find((sheet) => sheet.rows.length > 0) ?? sheets[0];
  if (firstWithRows.rows.length === 0) throw new Error(`«${source.name}» пустой — нет данных для импорта.`);
  return { sheets, activeSheet: firstWithRows.name };
}

export const excelImporter: Importer = {
  id: 'excel',
  label: 'Excel (XLSX)',
  extensions: ['.xlsx', '.xls'],
  async parse(source: ImportSource): Promise<RawRow[]> {
    const preview = await parseExcelWorkbook(source);
    // Лист с данными (активный), а не слепой sheets[0]: первый лист может быть
    // пустым/шапкой, а данные — на втором.
    const rows = preview.sheets.find((sheet) => sheet.name === preview.activeSheet)?.rows ?? [];
    if (rows.length === 0) {
      throw new Error(`«${source.name}» пустой — нет данных для импорта.`);
    }
    return rows;
  },
};
