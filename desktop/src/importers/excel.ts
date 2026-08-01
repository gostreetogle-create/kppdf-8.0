/**
 * Импортёр Excel (xlsx/xls) через библиотеку xlsx (SheetJS).
 * TODO(import): чтение первого листа, header-строка → RawRow[],
 * прогресс для больших книг, поддержка нескольких листов.
 */

import type { Importer, RawRow } from './index';

export const excelImporter: Importer = {
  id: 'excel',
  label: 'Excel (XLSX)',
  extensions: ['.xlsx', '.xls'],
  async parse(_file: File): Promise<RawRow[]> {
    throw new Error('TODO: парсинг Excel — будущая TZ (xlsx).');
  },
};
