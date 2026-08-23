import type { ProposalTableLayoutColumn } from './proposal-create-inspector.component';

/** Catalog / template aliases merged to canonical KP layout keys. */
const COLUMN_KEY_ALIASES: Record<string, string[]> = {
  photo: [
    'photo',
    'image',
    'рисунок',
    'photourl',
    'photoid',
    'photo_id',
    'photoids',
    'photo_ids',
    'фото',
  ],
  productName: ['productname', 'name', 'title', 'product', 'наименование'],
  productSku: ['sku', 'article', 'артикул', 'productsku'],
  quantity: ['quantity', 'qty', 'count', 'кол-во', 'количество'],
  unit: ['unit', 'ед', 'ед.изм'],
  unitPrice: ['unitprice', 'price', 'unit_price', 'listprice', 'list_price', 'цена'],
  sum: ['sum', 'total', 'amount', 'сумма'],
};

const DEFAULT_LABELS: Record<string, string> = {
  index: '№',
  productName: 'Наименование',
  productSku: 'Артикул',
  photo: 'Фото',
  quantity: 'Кол-во',
  unit: 'Ед.',
  unitPrice: 'Цена',
  sum: 'Сумма',
};

export function normalizeTableLayoutColumnKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  for (const [canonical, aliases] of Object.entries(COLUMN_KEY_ALIASES)) {
    if (canonical === normalized || aliases.includes(normalized)) {
      return canonical;
    }
  }
  return key.trim();
}

export function isPhotoColumnKey(key: string): boolean {
  return normalizeTableLayoutColumnKey(key) === 'photo';
}

export function normalizeTableLayoutColumns(
  layout: ProposalTableLayoutColumn[],
): ProposalTableLayoutColumn[] {
  const seen = new Set<string>();
  const next: ProposalTableLayoutColumn[] = [];
  for (const column of layout) {
    const canonicalKey = normalizeTableLayoutColumnKey(column.key);
    if (seen.has(canonicalKey)) continue;
    seen.add(canonicalKey);
    next.push({
      ...column,
      key: canonicalKey,
      label: column.label?.trim() || DEFAULT_LABELS[canonicalKey] || column.key,
    });
  }
  return next;
}

export function tableLayoutColumnAliases(canonicalKey: string): string[] {
  const normalized = canonicalKey.trim().toLowerCase();
  const aliases = COLUMN_KEY_ALIASES[normalized] ?? COLUMN_KEY_ALIASES[canonicalKey];
  return aliases ? [canonicalKey, ...aliases] : [canonicalKey];
}
