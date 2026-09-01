import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';
import { ProductModule, ProductModuleDocument } from '../product-module/product-module.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import type { QuotationItem } from '../quotation/quotation.schema';
import { QuotationService } from '../quotation/quotation.service';
import type { OrderItem } from '../order/order.schema';
import { OrderService } from '../order/order.service';
import type { TemplateBlockDocument } from '../template-block/template-block.schema';
import type { StudioDocumentDocument } from './studio-document.schema';
import { escapeHtmlValue } from '../document-render/document-render.utils';

export type DataSetSourceType =
  | 'manual'
  | 'quotation-items'
  | 'order-items'
  | 'catalog-products'
  | 'catalog-modules'
  | 'catalog-parts'
  | 'catalog-materials';

export type StudioTableColumn = {
  key: string;
  label?: string;
  type?: string;
  align?: string;
};

type LineItem = {
  productName?: string;
  productSku?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  total?: number;
};

type DataSetEntry = {
  key?: string;
  source?: { type?: string };
  rows?: unknown;
};

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['name', 'productname', 'title', 'product', 'наименование'],
  qty: ['qty', 'quantity', 'count', 'кол-во', 'количество'],
  price: ['price', 'unitprice', 'unit_price', 'цена'],
  sum: ['sum', 'total', 'amount', 'сумма'],
  unit: ['unit', 'ед', 'ед.изм'],
  sku: ['sku', 'productsku', 'артикул'],
};

function refId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return value == null ? '' : String(value);
}

function sourceType(entry: DataSetEntry): DataSetSourceType {
  const raw = entry.source?.type;
  if (raw === 'quotation-items' || raw === 'order-items' || raw === 'catalog-products' || raw === 'catalog-modules' || raw === 'catalog-parts' || raw === 'catalog-materials') return raw;
  return 'manual';
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function lineValue(columnKey: string, line: LineItem): string {
  const normalized = normalizeKey(columnKey);
  const alias = Object.entries(COLUMN_ALIASES).find(([, values]) =>
    values.includes(normalized),
  )?.[0];

  switch (alias ?? normalized) {
    case 'name':
      return line.productName ?? '';
    case 'qty':
      return line.quantity == null ? '' : String(line.quantity);
    case 'price':
      return line.unitPrice == null ? '' : String(line.unitPrice);
    case 'sum':
      return line.total == null ? '' : String(line.total);
    case 'unit':
      return line.unit ?? '';
    case 'sku':
      return line.productSku ?? '';
    default:
      return '';
  }
}

export function mapLineItemsToRows(
  items: LineItem[],
  columns: StudioTableColumn[],
): string[][] {
  return items.map((item) =>
    columns.map((column) => lineValue(column.key, item)),
  );
}

export function storedRows(entry: DataSetEntry): string[][] {
  const rows = entry.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : [],
  );
}

export function renderStudioTableHtml(
  columns: StudioTableColumn[],
  rows: string[][],
): string {
  if (columns.length === 0) {
    return '<p class="pi-empty-state">Нет описанных колонок.</p>';
  }
  const width = Math.round(100 / columns.length);
  const head = columns
    .map(
      (col) =>
        `<th scope="col" style="text-align:${col.align ?? 'left'};width:${width}%">${escapeHtmlValue(col.label ?? col.key)}</th>`,
    )
    .join('');
  const body =
    rows.length > 0
      ? rows
          .map((row) => {
            const cells = columns
              .map((_, idx) => {
                const value = row[idx] ?? '';
                return `<td style="text-align:${columns[idx]?.align ?? 'left'}">${escapeHtmlValue(value)}</td>`;
              })
              .join('');
            return `<tr>${cells}</tr>`;
          })
          .join('')
      : `<tr>${columns.map(() => '<td></td>').join('')}</tr>`;
  return (
    `<table class="pi-table pi-table-preview" cellspacing="0" cellpadding="6" style="border-collapse:collapse;table-layout:fixed;width:100%">` +
    `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
  );
}

export function tableDataSetKey(block: TemplateBlockDocument): string {
  return `table-${String(block._id)}`;
}

export function tableColumnsFromBlock(
  block: TemplateBlockDocument,
): StudioTableColumn[] {
  const settings = block.settings as
    | { tableTemplateColumns?: StudioTableColumn[] }
    | undefined;
  return settings?.tableTemplateColumns ?? [];
}

/** Manual table rows stored on the block until baked into document.dataSets. */
export function sampleRowsFromBlock(block: TemplateBlockDocument): string[][] {
  const settings = block.settings as
    | {
        tableTemplateSampleRows?: unknown;
        tableTemplateDisabledRows?: unknown;
      }
    | undefined;
  const rawRows = settings?.tableTemplateSampleRows;
  if (!Array.isArray(rawRows)) return [];
  const disabled = new Set(
    Array.isArray(settings?.tableTemplateDisabledRows)
      ? settings!.tableTemplateDisabledRows!.filter(
          (value): value is number => typeof value === 'number' && Number.isFinite(value),
        )
      : [],
  );
  return rawRows
    .map((row, index) => (disabled.has(index) ? null : row))
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => row.map((cell) => String(cell ?? '')));
}

/** Ensure each table block has a dataSet entry (preview/PDF when dataSets[] is empty). */
export function ensureTableDataSetsFromBlocks(
  blocks: TemplateBlockDocument[],
  entries: DataSetEntry[],
): DataSetEntry[] {
  const merged = [...entries];
  const keys = new Set(
    merged
      .filter((entry) => typeof entry.key === 'string')
      .map((entry) => String(entry.key)),
  );
  for (const block of blocks) {
    if (block.type !== 'table') continue;
    const key = tableDataSetKey(block);
    if (keys.has(key)) continue;
    merged.push({
      key,
      source: { type: 'manual' },
      rows: sampleRowsFromBlock(block),
    });
    keys.add(key);
  }
  return merged;
}

export function injectTableContent(
  blocks: TemplateBlockDocument[],
  dataSets: DataSetEntry[],
): TemplateBlockDocument[] {
  const byKey = new Map(
    dataSets
      .filter((entry) => typeof entry.key === 'string')
      .map((entry) => [String(entry.key), entry]),
  );

    return blocks.map((block) => {
    if (block.type !== 'table') return block;
    const key = tableDataSetKey(block);
    const entry = byKey.get(key);
    const columns = tableColumnsFromBlock(block);
    const rows = entry ? storedRows(entry) : [];
    const html = renderStudioTableHtml(columns, rows);
    const plain =
      typeof (block as { toObject?: () => Record<string, unknown> }).toObject ===
      'function'
        ? (block as { toObject: () => Record<string, unknown> }).toObject()
        : { ...(block as object) };
    return { ...plain, content: html } as TemplateBlockDocument;
  });
}

/**
 * TZ-DOC-STUDIO-1601 — live-read ERP rows for draft studio documents.
 */
@Injectable()
export class StudioDataResolverService {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly orderService: OrderService,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductModule.name) private readonly moduleModel: Model<ProductModuleDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async resolveDataSets(
    doc: StudioDocumentDocument,
    blocks: TemplateBlockDocument[],
    useLive: boolean,
  ): Promise<Record<string, unknown>[]> {
    const context = doc.context ?? {};
    const orgId = refId(doc.organizationId);
    const entries = ensureTableDataSetsFromBlocks(
      blocks,
      [...(doc.dataSets ?? [])] as DataSetEntry[],
    );
    const columnsByKey = new Map(
      blocks
        .filter((block) => block.type === 'table')
        .map((block) => [tableDataSetKey(block), tableColumnsFromBlock(block)]),
    );

    const resolved = await Promise.all(
      entries.map(async (entry) => {
        const type = sourceType(entry);
        if (!useLive || type === 'manual') {
          return { ...entry };
        }
        const key = String(entry.key ?? '');
        const columns = columnsByKey.get(key) ?? this.defaultColumns();
        const liveRows = await this.fetchLiveRows(
          type,
          context,
          orgId,
          columns,
        );
        if (liveRows == null) {
          return { ...entry };
        }
        const manual = storedRows(entry);
        const rows =
          manual.length > 0
            ? this.mergeRowOverrides(liveRows, manual)
            : liveRows;
        return { ...entry, rows };
      }),
    );

    return resolved as Record<string, unknown>[];
  }

  async bakeSnapshot(
    doc: StudioDocumentDocument,
    blocks: TemplateBlockDocument[],
  ): Promise<Record<string, unknown>[]> {
    const baked = await this.resolveDataSets(doc, blocks, true);
    return baked.map((entry) => {
      const type = sourceType(entry as DataSetEntry);
      if (type === 'manual') return entry;
      return {
        ...entry,
        source: { type: 'manual', bakedFrom: type },
        rows: storedRows(entry as DataSetEntry),
      };
    });
  }

  private mergeRowOverrides(
    liveRows: string[][],
    manualRows: string[][],
  ): string[][] {
    const max = Math.max(liveRows.length, manualRows.length);
    const merged: string[][] = [];
    for (let i = 0; i < max; i += 1) {
      const live = liveRows[i] ?? [];
      const manual = manualRows[i] ?? [];
      const width = Math.max(live.length, manual.length);
      const row: string[] = [];
      for (let j = 0; j < width; j += 1) {
        const override = manual[j]?.trim();
        row.push(override ? manual[j]! : (live[j] ?? ''));
      }
      merged.push(row);
    }
    return merged;
  }

  private async fetchLiveRows(
    type: DataSetSourceType,
    context: Record<string, unknown>,
    organizationId: string,
    columns: StudioTableColumn[],
  ): Promise<string[][] | null> {
    if (type === 'quotation-items') {
      const quotationId = context['quotationId'];
      if (typeof quotationId !== 'string' || !quotationId.trim()) return null;
      const quotation = await this.quotationService.findById(quotationId);
      if (refId(quotation.organizationId) !== organizationId) {
        throw new ForbiddenException(
          'Quotation belongs to another organization scope',
        );
      }
      return mapLineItemsToRows(
        (quotation.items ?? []) as QuotationItem[],
        columns,
      );
    }

    if (type === 'order-items') {
      const orderId = context['orderId'];
      if (typeof orderId !== 'string' || !orderId.trim()) return null;
      const order = await this.orderService.findById(orderId);
      const orderOrg = order.organizationId
        ? refId(order.organizationId)
        : organizationId;
      if (orderOrg !== organizationId) {
        throw new ForbiddenException(
          'Order belongs to another organization scope',
        );
      }
      return mapLineItemsToRows((order.items ?? []) as OrderItem[], columns);
    }

    if (type.startsWith('catalog-')) {
      const kind = type.slice('catalog-'.length);
      const selections = (context['catalogSelections'] as Record<string, unknown> | undefined) ?? {};
      const rawIds = selections[kind];
      if (!Array.isArray(rawIds)) return [];
      const ids = rawIds.filter((id): id is string => typeof id === 'string' && Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
      if (ids.length === 0) return [];
      const filter: Record<string, unknown> = { _id: { $in: ids }, deletedAt: null };
      if (kind === 'parts') filter.materialKind = 'part';
      if (kind === 'materials') filter.materialKind = { $ne: 'part' };
      const scopeFilter = { ...filter, $or: [{ organizationId: new Types.ObjectId(organizationId) }, { organizationId: null }, { organizationId: { $exists: false } }] };
      const docs: Array<Record<string, unknown>> = kind === 'products'
        ? await this.productModel.find(scopeFilter).lean().exec() as unknown as Array<Record<string, unknown>>
        : kind === 'modules'
          ? await this.moduleModel.find(scopeFilter).lean().exec() as unknown as Array<Record<string, unknown>>
          : await this.materialModel.find(scopeFilter).lean().exec() as unknown as Array<Record<string, unknown>>;
      const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
      return ids.filter((id) => byId.has(String(id))).map((id) => {
        const item = byId.get(String(id)) as Record<string, unknown>;
        const name = String(item['name'] ?? item['sku'] ?? item['article'] ?? '');
        const sku = String(item['sku'] ?? item['article'] ?? '');
        const unit = String(item['unit'] ?? 'шт');
        const price = Number(item['listPrice'] ?? item['basePrice'] ?? item['pricePerUnit'] ?? 0);
        return mapLineItemsToRows([{ productName: name, productSku: sku, unit, quantity: 1, unitPrice: price, total: price }], columns)[0] ?? [];
      });
    }

    return null;
  }

  private defaultColumns(): StudioTableColumn[] {
    return [
      { key: 'name', label: 'Наименование', align: 'left' },
      { key: 'qty', label: 'Кол-во', align: 'right' },
      { key: 'price', label: 'Цена', align: 'right' },
    ];
  }
}
