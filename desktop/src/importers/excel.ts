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

function parseSheet(sheet: XLSX.WorkSheet): RawRow[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
  const headerIdx = matrix.findIndex((row) => row.some((c) => !isEmptyCell(c)));
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
      const header = String(headerRow[col] ?? '').trim() || `колонка_${col + 1}`;
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
    const rows = preview.sheets[0]?.rows ?? [];
    if (rows.length === 0) {
      throw new Error(`«${source.name}» пустой — нет данных для импорта.`);
    }
    return rows;
  },
};
