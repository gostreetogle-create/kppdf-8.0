/**
 * Импортёр произвольного текста (txt): каждая непустая строка — строка данных
 * с одной колонкой «текст». Полезно для inbox: список наименований без шапки.
 * Для табличного текста (TSV-подобного) используйте CSV-импортёр.
 */

import type { Importer, ImportSource, RawRow } from './index';

/** Декодирует байты в текст (UTF-8) и убирает BOM. */
function decodeText(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
}

export const textImporter: Importer = {
  id: 'text',
  label: 'Текст',
  extensions: ['.txt'],
  async parse(source: ImportSource): Promise<RawRow[]> {
    const text = decodeText(source.data);
    const rows: RawRow[] = [];
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      rows.push({ текст: line });
    }
    if (rows.length === 0) {
      throw new Error(`«${source.name}» пустой — нет данных для импорта.`);
    }
    return rows;
  },
};
