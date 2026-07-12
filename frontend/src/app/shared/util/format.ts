/**
 * Russian pluralization for countable nouns.
 *
 * Usage: `totalLabel(n, ['материал', 'материала', 'материалов'])`
 *
 * Rules based on the last two digits:
 *  - 1 (but not 11) → singular[0]
 *  - 2-4 (but not 12-14) → singular[1]
 *  - everything else → singular[2]
 */
export function pluralize(
  n: number,
  forms: [string, string, string],
): string {
  const mod10 = n % 10;
  const mod100 = n % 10;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** Format a Date-like value as dd.mm.yyyy. */
export function formatDate(d: string | undefined | null): string {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

/** Format a number as currency with ₽ symbol. */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '';
  return `${value.toFixed(2)} ₽`;
}
