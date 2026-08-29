import type { StudioDocument } from '../../../shared/services/pi-studio-documents.service';
import type { TableColumn } from '../../../shared/services/pi-table-templates.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

export function studioTableColumns(block: TemplateBlock): TableColumn[] {
  const settings = block.settings as { tableTemplateColumns?: TableColumn[] } | undefined;
  return settings?.tableTemplateColumns ?? [];
}

export function studioTableRows(block: TemplateBlock): unknown[][] {
  const settings = block.settings as { tableTemplateSampleRows?: unknown[][] } | undefined;
  return settings?.tableTemplateSampleRows ?? [];
}

export function studioTableDataSetKey(block: TemplateBlock): string {
  const id = block._id ?? block.tempId ?? 'draft';
  return `table-${id}`;
}

export function studioTableDataSetSource(
  doc: StudioDocument | null,
  block: TemplateBlock,
): 'manual' | 'quotation-items' | 'order-items' {
  if (!doc) return 'manual';
  const key = studioTableDataSetKey(block);
  const entry = (doc.dataSets ?? []).find(
    (item) => String((item as { key?: unknown }).key ?? '') === key,
  ) as { source?: { type?: string } } | undefined;
  const type = entry?.source?.type;
  if (type === 'quotation-items' || type === 'order-items') return type;
  return 'manual';
}

export function readStudioDataSetRows(doc: StudioDocument, key: string): string[][] {
  const entry = (doc.dataSets ?? []).find(
    (item) => String((item as { key?: unknown }).key ?? '') === key,
  ) as { rows?: unknown } | undefined;
  const rows = entry?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : []));
}

export function studioLayoutPct(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

export function studioImageUrl(block: TemplateBlock): string | null {
  const url = block.settings?.['imageUrl'];
  return typeof url === 'string' && url.trim() ? url : null;
}
