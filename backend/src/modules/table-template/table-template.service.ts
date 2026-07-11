import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableTemplate, TableTemplateDocument } from './table-template.schema';
import { CreateTableTemplateDto } from './dto/create-table-template.dto';
import { UpdateTableTemplateDto } from './dto/update-table-template.dto';

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
export class TableTemplateService {
  constructor(
    @InjectModel(TableTemplate.name)
    private readonly model: Model<TableTemplateDocument>,
  ) {}

  async create(dto: CreateTableTemplateDto): Promise<TableTemplateDocument> {
    return this.model.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      sortOrder: dto.sortOrder ?? 0,
      columns: dto.columns,
      sampleRows: dto.sampleRows,
      dataSource: dto.dataSource,
      isActive: true,
    });
  }

  async findAll(): Promise<TableTemplateDocument[]> {
    return this.model
      .find({ isActive: true })
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
   * Empty sampleRows → returns `<p class="pi-empty-state">Нет sample data</p>`.
   */
  async preview(id: string): Promise<string> {
    const doc = await this.findById(id);
    const cols = doc.columns ?? [];
    if (cols.length === 0) {
      return '<p class="pi-empty-state">Нет описанных колонок.</p>';
    }
    const rows = doc.sampleRows ?? [];
    if (rows.length === 0) {
      return (
        '<p class="pi-empty-state">Нет sample rows для preview. Добавьте sampleRows.</p>'
      );
    }

    const headHtml = cols
      .map(
        (c) =>
          `<th scope="col" style="text-align:${c.align ?? 'left'};width:${
            c.width ?? 100
          }px">${this.escapeHtml(c.label ?? c.key ?? '')}</th>`,
      )
      .join('');
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

    return (
      '<table class="pi-table pi-table-preview" cellspacing="0" cellpadding="6">' +
      `<thead><tr>${headHtml}</tr></thead>` +
      `<tbody>${bodyHtml}</tbody>` +
      '</table>'
    );
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private formatCell(value: unknown, type: string, format?: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
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
        return value === true || value === 'true' || value === 1 || value === '1'
          ? 'Да'
          : 'Нет';
      case 'text':
      default:
        return this.escapeHtml(String(value));
    }
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
