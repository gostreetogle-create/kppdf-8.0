/**
 * Shared WorkType catalog-days prompt (Gantt work-detail).
 * TZ-PRODUCTION-322: inspector host / bottom sheet removed; helpers kept.
 */

export const CATALOG_DAYS_PROMPT_RU =
  'Новый норматив дней вида работ в справочнике (для ВСЕХ заказов):';

export const CATALOG_DAYS_CONFIRM_RU =
  'Изменить норматив вида работ (дни) для ВСЕХ заказов с этим видом?\n\n' +
  'Это правка справочника WorkType, не только текущего заказа.';

export type CatalogDaysPromptResult = number | 'cancel' | 'invalid';

/** Shared prompt+confirm for WorkType catalog days (Gantt work-detail). */
export function promptCatalogDaysChange(current: number | string): CatalogDaysPromptResult {
  const raw = window.prompt(CATALOG_DAYS_PROMPT_RU, String(current || ''));
  if (raw == null) return 'cancel';
  const days = Math.floor(Number(raw));
  if (!Number.isFinite(days) || days < 1) return 'invalid';
  return window.confirm(CATALOG_DAYS_CONFIRM_RU) ? days : 'cancel';
}
