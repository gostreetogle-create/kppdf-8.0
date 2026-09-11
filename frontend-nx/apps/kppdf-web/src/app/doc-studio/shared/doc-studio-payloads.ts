import type { PiTableTemplatesService, PiTextBlocksService, TableTemplate } from '@kppdf/data-access';

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
  sortOrder: number;
  content: string;
}): Parameters<PiTextBlocksService['create']>[0] {
  const payload = {
    name: value.name.trim(),
    tags: value.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    content: value.content,
    sortOrder: value.sortOrder,
  } as Parameters<PiTextBlocksService['create']>[0];
  return value.categoryId.trim() ? { ...payload, categoryId: value.categoryId.trim() } : payload;
}

export function tableTemplatePayload(value: {
  name: string;
  description: string;
  category: TableTemplate['category'];
  sortOrder: number;
  dataSource: string;
  columns: TableTemplate['columns'];
  sampleRows?: unknown[][];
}): Parameters<PiTableTemplatesService['create']>[0] {
  const payload = {
    name: value.name.trim(),
    description: value.description.trim() || undefined,
    category: value.category,
    sortOrder: value.sortOrder,
    columns: value.columns,
  } as Parameters<PiTableTemplatesService['create']>[0];
  const withSource = value.dataSource.trim()
    ? { ...payload, dataSource: value.dataSource.trim() }
    : payload;
  return value.sampleRows?.length ? { ...withSource, sampleRows: value.sampleRows } : withSource;
}
