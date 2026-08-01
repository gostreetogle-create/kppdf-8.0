/**
 * Импортёр PDF через pdfjs-dist.
 * TODO(import): извлечение текста страниц, поиск таблиц (эвристика
 * по пробелам/табуляции), очень большие PDF — только первые N страниц.
 */

import type { Importer, ImportSource, RawRow } from './index';

export const pdfImporter: Importer = {
  id: 'pdf',
  label: 'PDF',
  extensions: ['.pdf'],
  async parse(_source: ImportSource): Promise<RawRow[]> {
    throw new Error('TODO: парсинг PDF — будущая TZ (pdfjs-dist).');
  },
};
