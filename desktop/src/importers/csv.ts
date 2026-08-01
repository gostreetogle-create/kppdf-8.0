/**
 * Импортёр CSV/TSV через papaparse.
 */

import Papa from 'papaparse';
import type { Importer, ImportSource, RawRow } from './index';

/** Декодирует байты в текст (UTF-8) и убирает BOM. */
function decodeText(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
}

export const csvImporter: Importer = {
  id: 'csv',
  label: 'CSV / TSV',
  extensions: ['.csv', '.tsv'],
  async parse(source: ImportSource): Promise<RawRow[]> {
    const text = decodeText(source.data);

    // header: true — первая строка = ключи; delimiter: '' — автодетект (papaparse);
    // skipEmptyLines: 'greedy' — пустые строки отбрасываются.
    // TODO(import): дубликаты заголовков в CSV молча перезаписываются
    // (papaparse: последняя колонка выигрывает) — учесть в v0.4.
    const result = Papa.parse<RawRow>(text, {
      header: true,
      delimiter: '',
      skipEmptyLines: 'greedy',
    });

    if (result.errors.length > 0) {
      const first = result.errors[0];
      // Не все ошибки papaparse задают row (например, UndetectableDelimiter).
      const rowLabel = first.row !== undefined ? ` (строка ${first.row + 1})` : '';
      throw new Error(`Ошибка разбора CSV в «${source.name}»: ${first.message}${rowLabel}.`);
    }
    return result.data;
  },
};
