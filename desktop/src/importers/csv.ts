/**
 * Импортёр CSV/TSV через papaparse.
 * TODO(import): header:true, динамический разделитель, BOM-strip.
 */

import type { Importer, ImportSource, RawRow } from './index';

export const csvImporter: Importer = {
  id: 'csv',
  label: 'CSV / TSV',
  extensions: ['.csv', '.tsv'],
  async parse(_source: ImportSource): Promise<RawRow[]> {
    throw new Error('TODO: парсинг CSV — следующая TZ (papaparse).');
  },
};
