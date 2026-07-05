import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  format?: (row: T) => string;
  cellClass?: string;
  accessor?: (row: T) => unknown;
}

export type SelectionMode = 'none' | 'single' | 'multi';

/**
 * Paper & Ink data table primitive.
 *
 * Features:
 * - Sortable column headers (click-toggle asc → desc → null).
 * - Optional single/multi row selection with header checkbox.
 * - Optional expanded row content via TemplateRef.
 * - Footer slot for `<app-pi-pagination>`-style paginators.
 *
 * Standalone, OnPush, signal-based. NO Material, NO shadows.
 */
@Component({
  selector: 'app-pi-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <table
      role="table"
      [attr.aria-label]="ariaLabel()"
      class="w-full border-collapse text-sm"
    >
      <thead class="border-b hairline border-rule">
        <tr>
          @if (selectionMode() !== 'none') {
            <th class="w-10 py-3 px-3 text-left">
              @if (selectionMode() === 'multi') {
                <input
                  type="checkbox"
                  [checked]="isAllSelected()"
                  [indeterminate]="isSomeSelected() && !isAllSelected()"
                  (change)="toggleAll($event)"
                  aria-label="Выбрать всё"
                  class="align-middle"
                />
              }
            </th>
          }
          @for (col of columns(); track col.key) {
            <th
              class="eyebrow py-3 px-3 select-none"
              [class.text-left]="(col.align ?? 'left') === 'left'"
              [class.text-right]="col.align === 'right'"
              [class.text-center]="col.align === 'center'"
              [class.cursor-pointer]="col.sortable"
              [style.width]="col.width ?? null"
              (click)="col.sortable && onSort(col.key)"
            >
              <span>{{ col.label }}</span>
              @if (col.sortable) {
                <span class="ml-1 font-mono text-[10px] text-muted" aria-hidden="true">
                  {{ sortIcon(col.key) }}
                </span>
              }
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of sortedData(); track rowKeyOf(row, $index)) {
          <tr
            class="border-b hairline border-rule hover:bg-paper-2 transition-colors cursor-pointer"
            (click)="onRowClick(row)"
          >
            @if (selectionMode() !== 'none') {
              <td class="py-3 px-3 align-middle" (click)="$event.stopPropagation()">
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row)"
                  (change)="toggleRow(row, $event)"
                  aria-label="Выбрать строку"
                />
              </td>
            }
            @for (col of columns(); track col.key) {
              <td
                class="py-3 px-3 align-top"
                [class.text-right]="col.align === 'right'"
                [class.text-center]="col.align === 'center'"
                [class]="col.cellClass ?? ''"
              >
                {{ formatCell(col, row) }}
              </td>
            }
          </tr>
          @if (expandedRow()) {
            <tr>
              <td
                [attr.colspan]="columns().length + (selectionMode() !== 'none' ? 1 : 0)"
                class="bg-paper-2 p-0 border-b hairline border-rule"
              >
                <ng-container
                  *ngTemplateOutlet="expandedRow()!; context: { $implicit: row }"
                />
              </td>
            </tr>
          }
        }
        @if (sortedData().length === 0) {
          <tr>
            <td
              [attr.colspan]="columns().length + (selectionMode() !== 'none' ? 1 : 0)"
              class="py-12 px-3 text-center text-muted"
            >
              <div class="flex flex-col items-center gap-1">
                <span class="eyebrow">00</span>
                <span class="text-sm">Нет данных для отображения.</span>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
    <div class="border-t hairline border-rule px-3 py-3 flex items-center justify-between gap-2">
      <div class="text-xs text-muted">
        <ng-content select="[caption]" />
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[footer]" />
      </div>
    </div>
  `,
})
export class TableComponent<T extends Record<string, unknown>> {
  readonly data = input<T[]>([]);
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly selectionMode = input<SelectionMode>('none');
  readonly ariaLabel = input<string>('Таблица');
  readonly expandedRow = input<TemplateRef<{ $implicit: T }> | null>(null);

  readonly rowClick = output<T>();
  readonly sortChange = output<{ key: string; dir: SortDirection }>();
  readonly selectionChange = output<T[]>();

  private readonly sortKeySig = signal<string | null>(null);
  private readonly sortDirSig = signal<SortDirection>(null);
  private readonly selectedKeys = signal<Set<string>>(new Set());

  readonly sortKey = computed(() => this.sortKeySig());
  readonly isAllSelected = computed(() => {
    const data = this.data();
    if (data.length === 0) return false;
    const selected = this.selectedKeys();
    return data.every((row) => selected.has(this.keyOf(row)));
  });
  readonly isSomeSelected = computed(() => {
    const data = this.data();
    const selected = this.selectedKeys();
    return data.some((row) => selected.has(this.keyOf(row))) && !this.isAllSelected();
  });

  readonly sortedData = computed<T[]>(() => {
    const data = this.data().slice();
    const key = this.sortKeySig();
    const dir = this.sortDirSig();
    if (!key || !dir) return data;
    const cols = this.columns();
    const col = cols.find((c) => c.key === key);
    if (!col) return data;
    const accessor = col.accessor ?? ((row: T) => row[col.key]);
    const sign = dir === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * sign;
      if (bv == null) return 1 * sign;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv), 'ru') * sign;
    });
  });

  rowKeyOf(row: T, index: number): string {
    return this.keyOf(row) ?? `idx-${index}`;
  }

  onSort(key: string): void {
    const currentDir = this.sortDirSig();
    const currentKey = this.sortKeySig();
    let nextDir: SortDirection = 'asc';
    if (currentKey === key) {
      if (currentDir === 'asc') nextDir = 'desc';
      else if (currentDir === 'desc') nextDir = null;
    }
    this.sortKeySig.set(nextDir === null ? null : key);
    this.sortDirSig.set(nextDir);
    this.sortChange.emit({ key, dir: nextDir });
  }

  sortIcon(key: string): string {
    if (this.sortKeySig() !== key) return '↕';
    return this.sortDirSig() === 'asc' ? '↑' : '↓';
  }

  isRowSelected(row: T): boolean {
    return this.selectedKeys().has(this.keyOf(row));
  }

  toggleRow(row: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const key = this.keyOf(row);
    const mode = this.selectionMode();
    const next = new Set(this.selectedKeys());
    if (mode === 'single') {
      next.clear();
      if (checked) next.add(key);
    } else if (mode === 'multi') {
      if (checked) next.add(key);
      else next.delete(key);
    }
    this.selectedKeys.set(next);
    this.emitSelectionChange();
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const data = this.data();
    const next = new Set<string>();
    if (checked) data.forEach((row) => next.add(this.keyOf(row)));
    this.selectedKeys.set(next);
    this.emitSelectionChange();
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  formatCell(col: ColumnDef<T>, row: T): string {
    if (col.format) return col.format(row);
    const val = col.accessor ? col.accessor(row) : row[col.key];
    if (val == null) return '';
    return String(val);
  }

  private keyOf(row: T): string {
    const k = (row as { id?: string }).id;
    return k ?? JSON.stringify(row);
  }

  private emitSelectionChange(): void {
    const data = this.data();
    const selectedSet = this.selectedKeys();
    const selected = data.filter((row) => selectedSet.has(this.keyOf(row)));
    this.selectionChange.emit(selected);
  }
}
