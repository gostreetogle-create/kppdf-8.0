/**
 * Импортёр произвольного текста (txt/табличный текст).
 * TODO(import): декодирование байтов → строки → RawRow (одна колонка «текст»),
 * либо срез по разделителям/табуляции.
 */

import type { Importer, ImportSource, RawRow } from './index';

export const textImporter: Importer = {
  id: 'text',
  label: 'Текст',
  extensions: ['.txt'],
  async parse(_source: ImportSource): Promise<RawRow[]> {
    throw new Error('TODO: парсинг текста — будущая TZ.');
  },
};
