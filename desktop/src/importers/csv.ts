/**
 * Импортёр CSV/TSV через papaparse.
 * TODO(import): разделитель (автодетект), BOM, кавычки, кодировка,
 * header-строка → RawRow[].
 */

import type { Importer, RawRow } from './index';

export const csvImporter: Importer = {
  id: 'csv',
  label: 'CSV / TSV',
  extensions: ['.csv', '.tsv'],
  async parse(_file: File): Promise<RawRow[]> {
    throw new Error('TODO: парсинг CSV — будущая TZ (papaparse).');
  },
};
