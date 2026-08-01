/**
 * Импортёр произвольного текста (txt/табличный текст).
 * TODO(import): строки → RawRow (одна колонка «текст»),
 * либо срез по разделителям/табуляции.
 */

import type { Importer, RawRow } from './index';

export const textImporter: Importer = {
  id: 'text',
  label: 'Текст',
  extensions: ['.txt'],
  async parse(_file: File): Promise<RawRow[]> {
    throw new Error('TODO: парсинг текста — будущая TZ.');
  },
};
