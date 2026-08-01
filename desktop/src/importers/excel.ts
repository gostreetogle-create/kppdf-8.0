/**
 * Импортёр Excel (xlsx/xls) через библиотеку xlsx (SheetJS).
 * TODO(import): листы → строки, первая строка — заголовки, отбрасывание
 * пустых строк/колонок, ячейки → string/number/Date.
 */

import type { Importer, ImportSource, RawRow } from './index';

export const excelImporter: Importer = {
  id: 'excel',
  label: 'Excel (XLSX)',
  extensions: ['.xlsx', '.xls'],
  async parse(_source: ImportSource): Promise<RawRow[]> {
    throw new Error('TODO: парсинг Excel — следующая TZ (xlsx).');
  },
};
