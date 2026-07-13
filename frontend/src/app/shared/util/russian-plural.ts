/**
 * Russian noun pluralization helper.
 *
 * Slavic `one / few / many` pluralization with the standard
 * 11–14 special case (which always takes `many` form).
 *
 * Forms:
 *   ['колонка', 'колонки', 'колонок']    →  RU_COLUMNS
 *   ['блок',    'блока',   'блоков']     →  RU_BLOCKS
 *
 * Examples:
 *   pluralRu(1,  RU_COLUMNS) // 'колонка'
 *   pluralRu(3,  RU_COLUMNS) // 'колонки'
 *   pluralRu(5,  RU_COLUMNS) // 'колонок'
 *   pluralRu(11, RU_COLUMNS) // 'колонок'   (special case)
 *   pluralRu(21, RU_COLUMNS) // 'колонка'   (mod100 = 21 → м10 = 1)
 */
export function pluralRu(
  n: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  const mod10 = n % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export const RU_COLUMNS = ['колонка', 'колонки', 'колонок'] as const;
export const RU_BLOCKS = ['блок', 'блока', 'блоков'] as const;
