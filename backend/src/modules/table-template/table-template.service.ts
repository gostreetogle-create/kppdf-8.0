import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  KP_LINE_ITEM_COLUMNS,
  KP_LINE_ITEM_PRESET_NAME,
  TableTemplate,
  TableTemplateDocument,
} from './table-template.schema';
import { CreateTableTemplateDto } from './dto/create-table-template.dto';
import { UpdateTableTemplateDto } from './dto/update-table-template.dto';

/** Request-only copy-on-write layout applied to a live table preview. */
export interface TablePreviewLayoutColumn {
  key: string;
  visible?: boolean;
}

export interface TableDealTotals {
  total: number;
  vatPercent: number;
  discountType?: 'none' | 'percent' | 'amount';
  discountPercent?: number;
  discountAmount?: number;
}

/**
 * TZ-86 Phase A.2 — TableTemplateService extended.
 *
 * New responsibilities:
 *  - preview(id) → HTML string. Server-side Intl.NumberFormat ('ru-RU' /
 *    'RUB') for currency/number cells; ISO date short for date cells;
 *    HTML-escaped text for text/bool cells.
 *  - create() / update() preserve new optional fields.
 *  - remove() uses Mongoose deleteOne with softDelete plugin (captures
 *    `deletedAt`). Service previously did `$set: {deletedAt}` — that's a
 *    raw mongo update that BYPASSES the softDelete plugin's audit hook;
 *    fixing it to deleteOne() restores plugin integration.
 */
@Injectable()
export class TableTemplateService implements OnModuleInit {
  constructor(
    @InjectModel(TableTemplate.name)
    private readonly model: Model<TableTemplateDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureKpPreset();
  }

  /** Ensure the canonical active KP preset exists exactly once by name/category. */
  async ensureKpPreset(): Promise<TableTemplateDocument> {
    const existing = await this.model
      .findOne({ name: KP_LINE_ITEM_PRESET_NAME, category: 'kp' })
      .exec();
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return existing;
    }

    return this.model.create({
      name: KP_LINE_ITEM_PRESET_NAME,
      description: 'Канон колонок позиций для коммерческого предложения',
      category: 'kp',
      sortOrder: -100,
      columns: KP_LINE_ITEM_COLUMNS.map((column) => ({ ...column })),
      isActive: true,
    });
  }

  async create(dto: CreateTableTemplateDto): Promise<TableTemplateDocument> {
    return this.model.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      sortOrder: dto.sortOrder ?? 0,
      columns: dto.columns,
      sampleRows: dto.sampleRows,
      dataSource: dto.dataSource,
      isActive: dto.isActive ?? true,
    });
  }

  async findAll(filter?: {
    activeOnly?: boolean;
  }): Promise<TableTemplateDocument[]> {
    const q: Record<string, unknown> = {};
    if (filter?.activeOnly) q.isActive = true;
    return this.model
      .find(q)
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<TableTemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`TableTemplate ${id} not found`);
    }
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`TableTemplate ${id} not found`);
    return doc;
  }

  async update(
    id: string,
    dto: UpdateTableTemplateDto,
  ): Promise<TableTemplateDocument> {
    const doc = await this.findById(id);
    if (dto.name !== undefined) doc.name = dto.name;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.category !== undefined) doc.category = dto.category;
    if (dto.sortOrder !== undefined) doc.sortOrder = dto.sortOrder;
    if (dto.columns !== undefined) doc.columns = dto.columns as never;
    if (dto.sampleRows !== undefined) doc.sampleRows = dto.sampleRows;
    if (dto.dataSource !== undefined) doc.dataSource = dto.dataSource;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;
    return doc.save();
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    /**
     * `model.deleteOne({ _id, deletedAt: null })` lets the softDelete plugin
     *   set `deletedAt: <now>` automatically AND fire audit-log. The previous
     *   `$set: {deletedAt}` raw update bypassed both — fixing here.
     */
    await this.model.deleteOne({ _id: doc._id, deletedAt: null }).exec();
  }

  // ── Phase A.2 — preview endpoint ───────────────────────────────────────────

  /**
   * Render the table-template as inline HTML using sampleRows.
   * Pure HTML (no CSS — host page provides container styling).
   * Used by: TZ-86C.2 picker preview + TZ-86D.7 canvas placeholder.
   *
   * Cell formatting rules:
   *   - currency → `Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'})`
   *   - number   → `Intl.NumberFormat('ru-RU')` (no currency symbol, default decimals)
   *   - date     → `Date.toLocaleDateString('ru-RU')` (short dd.mm.yyyy)
   *   - bool     → «Да» / «Нет» (Russian labels, culturally consistent)
   *   - text     → HTML-escaped via `escapeHtml()`
   *
   * Empty sampleRows with declared columns preserve the table geometry:
   * headers plus one blank data row. A table without columns keeps the short
   * Russian empty state «Нет описанных колонок.».
   */
  async preview(
    id: string,
    previewRows?: unknown[][],
    layout?: TablePreviewLayoutColumn[],
    dealTotals?: TableDealTotals,
  ): Promise<string> {
    const doc = await this.findById(id);
    const cols = this.resolvePreviewColumns(doc.columns ?? [], layout);
    if (cols.length === 0) {
      return '<p class="pi-empty-state">Нет описанных колонок.</p>';
    }

    const headHtml = cols
      .map(
        (c) =>
          `<th scope="col" style="text-align:${c.align ?? 'left'};width:${
            c.width ?? 100
          }px">${this.escapeHtml(c.label ?? c.key ?? '')}</th>`,
      )
      .join('');
    // A caller-supplied array is request-scoped preview data. An explicit empty
    // array intentionally preserves the table skeleton instead of falling back
    // to persisted sample rows.
    const rows = previewRows ?? doc.sampleRows ?? [];
    if (rows.length === 0) {
      const blankCells = cols
        .map((c) => `<td style="text-align:${c.align ?? 'left'}"></td>`)
        .join('');
      const tableHtml =
        '<table class="pi-table pi-table-preview" cellspacing="0" cellpadding="6">' +
        `<thead><tr>${headHtml}</tr></thead>` +
        `<tbody><tr>${blankCells}</tr></tbody>` +
        '</table>';
      return tableHtml + this.renderDealFooter(dealTotals);
    }

    const bodyHtml = rows
      .map((row) => {
        const cells = cols
          .map((c, idx) => {
            const cell = Array.isArray(row) ? row[idx] : undefined;
            const formatted = this.formatCell(cell, c.type, c.format);
            return `<td style="text-align:${c.align ?? 'left'}">${formatted}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const tableHtml =
      '<table class="pi-table pi-table-preview" cellspacing="0" cellpadding="6">' +
      `<thead><tr>${headHtml}</tr></thead>` +
      `<tbody>${bodyHtml}</tbody>` +
      '</table>';
    return tableHtml + this.renderDealFooter(dealTotals);
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private resolvePreviewColumns(
    columns: TableTemplateDocument['columns'],
    layout?: TablePreviewLayoutColumn[],
  ): TableTemplateDocument['columns'] {
    if (!layout) return columns;
    const byKey = new Map(columns.map((column) => [column.key, column]));
    const selected = layout
      .filter((entry) => entry.visible !== false)
      .map((entry) => byKey.get(entry.key) ?? this.syntheticKpColumn(entry.key))
      .filter((column): column is TableTemplateDocument['columns'][number] =>
        Boolean(column),
      );
    return selected.length > 0 ? selected : columns;
  }

  /** Request-only KP columns; never persisted into the shared table template. */
  private syntheticKpColumn(
    key: string,
  ): TableTemplateDocument['columns'][number] | null {
    const normalized = key.trim().toLowerCase();
    const aliases: Record<string, string[]> = {
      index: ['index', 'number', '№', 'номер'],
      productName: ['productname', 'name', 'title', 'product', 'наименование'],
      quantity: ['quantity', 'qty', 'count', 'кол-во', 'количество'],
      unit: ['unit', 'ед', 'ед.изм'],
      unitPrice: ['unitprice', 'price', 'unit_price', 'цена'],
      sum: ['sum', 'total', 'amount', 'сумма'],
    };
    const match = Object.entries(aliases).find(([, values]) =>
      values.includes(normalized),
    );
    if (!match) return null;
    const defaults = KP_LINE_ITEM_COLUMNS.find(
      (column) => column.key === match[0],
    );
    return defaults
      ? ({ ...defaults } as TableTemplateDocument['columns'][number])
      : null;
  }

  private renderDealFooter(dealTotals?: TableDealTotals): string {
    if (!dealTotals) return '';
    const total = this.roundMoney(dealTotals.total);
    const totalLabel = this.formatMoney(total);
    const vat = this.roundMoney(
      dealTotals.vatPercent > 0
        ? (total * dealTotals.vatPercent) / (100 + dealTotals.vatPercent)
        : 0,
    );
    const vatRow =
      dealTotals.vatPercent > 0
        ? `<div>в т.ч. НДС ${dealTotals.vatPercent}%: ${this.formatMoney(vat)} ₽</div>`
        : '';
    return (
      `<div class="pi-deal-totals" style="margin-top:8px;text-align:right">` +
      `<div><strong>Итого: ${totalLabel} ₽</strong></div>${vatRow}</div>`
    );
  }

  private roundMoney(value: number): number {
    return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatCell(value: unknown, type: string, format?: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (
      typeof value === 'object' &&
      value !== null &&
      (value as { kind?: string }).kind === 'image'
    ) {
      return this.formatImageCell((value as { url?: unknown }).url);
    }
    switch (type) {
      case 'currency': {
        const num = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(num)) return this.escapeHtml(String(value));
        try {
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            ...(format ? { minimumFractionDigits: Number(format) || 2 } : {}),
          }).format(num);
        } catch {
          return this.escapeHtml(String(value));
        }
      }
      case 'number': {
        const num = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(num)) return this.escapeHtml(String(value));
        try {
          return new Intl.NumberFormat('ru-RU', {
            ...(format ? { minimumFractionDigits: Number(format) || 0 } : {}),
          }).format(num);
        } catch {
          return this.escapeHtml(String(value));
        }
      }
      case 'date': {
        const d = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(d.getTime())) return this.escapeHtml(String(value));
        return d.toLocaleDateString('ru-RU');
      }
      case 'bool':
        return value === true ||
          value === 'true' ||
          value === 1 ||
          value === '1'
          ? 'Да'
          : 'Нет';
      case 'text':
      default:
        return this.escapeHtml(String(value));
    }
  }

  private formatImageCell(value: unknown): string {
    if (typeof value !== 'string' || !value) return '';
    const url = value.trim();
    const allowed =
      /^https?:\/\//i.test(url) ||
      /^\/(?!\/)/.test(url) ||
      /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(url);
    if (!allowed) return '';
    return `<img src="${this.escapeHtml(url)}" alt="" style="max-width:72px;max-height:48px;object-fit:contain" />`;
  }

  /** Minimal HTML escaper; output rendered as `[innerHTML]` on consumer side. */
  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
