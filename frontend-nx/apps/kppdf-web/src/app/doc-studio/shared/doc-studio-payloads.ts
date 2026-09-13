import type { PiTableTemplatesService, PiTextBlocksService, TableTemplate } from '@kppdf/data-access';

/**
 * TZ-NX-SORTORDER-EMPTY-MIN — `app-pi-input[type="number"]`'s CVA always
 * writes the native `<input>`'s own `.value` (always a string) back into the
 * FormControl, so a cleared "Порядок" field is the literal string `''`, not
 * `0` — sending it straight through as JSON produced `sortOrder: ""`,
 * failing the BE's `@IsNumber()`/`@Min(0)` with a raw-looking "Значение
 * слишком мало" instead of silently defaulting like an empty optional field
 * should. Omitted (not sent) rather than coerced to `0`, so the schema's own
 * default order applies — matches how `description`/`dataSource` already
 * omit-when-empty just below.
 */
function finiteSortOrderOrUndefined(raw: number | string | null | undefined): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * TZ-NX-TEXT-PICKER-FORM — `slug` is no longer a form field: the server
 * always auto-generates it from `name` on create (`TextBlockService`) and
 * leaves it untouched on update when omitted, so this payload never sends
 * it. `categoryId` is now mandatory (leaf/subcategory) at the form-validation
 * layer — still trimmed defensively here rather than assumed non-empty.
 */
export function textBlockPayload(value: {
  name: string;
  tags: string;
  categoryId: string;
  sortOrder: number | string;
  content: string;
}): Parameters<PiTextBlocksService['create']>[0] {
  const payload = {
    name: value.name.trim(),
    tags: value.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    content: value.content,
    sortOrder: finiteSortOrderOrUndefined(value.sortOrder),
  } as Parameters<PiTextBlocksService['create']>[0];
  return value.categoryId.trim() ? { ...payload, categoryId: value.categoryId.trim() } : payload;
}

export function tableTemplatePayload(value: {
  name: string;
  description: string;
  category: TableTemplate['category'];
  sortOrder: number | string;
  dataSource: string;
  columns: TableTemplate['columns'];
  sampleRows?: unknown[][];
}): Parameters<PiTableTemplatesService['create']>[0] {
  const payload = {
    name: value.name.trim(),
    description: value.description.trim() || undefined,
    category: value.category,
    sortOrder: finiteSortOrderOrUndefined(value.sortOrder),
    columns: value.columns,
  } as Parameters<PiTableTemplatesService['create']>[0];
  const withSource = value.dataSource.trim()
    ? { ...payload, dataSource: value.dataSource.trim() }
    : payload;
  return value.sampleRows?.length ? { ...withSource, sampleRows: value.sampleRows } : withSource;
}
