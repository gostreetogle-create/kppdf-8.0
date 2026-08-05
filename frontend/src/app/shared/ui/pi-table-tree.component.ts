import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
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
import { ColumnDef } from './pi-table.component';

export interface TreeDropEvent<T> {
  parent: T | null;
  previousIndex: number;
  currentIndex: number;
}

/**
 * Tree variant of the Paper & Ink table kit.
 *
 * The primitive owns tree chrome, expansion, indentation, and optional
 * drag-reorder capability. The page supplies only columns, data, and cells.
 * MVP intentionally supports the two levels used by CategoriesPage.
 */
@Component({
  selector: 'app-pi-table-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, NgTemplateOutlet],
  template: `
    <div role="table" [attr.aria-label]="ariaLabel()" class="w-full border-collapse text-sm">
      <div
        role="row"
        class="grid gap-2 px-3 py-3 hairline-b bg-paper text-left"
        [style.grid-template-columns]="gridTemplate()"
      >
        @for (col of columns(); track col.key) {
          <div
            role="columnheader"
            class="eyebrow select-none"
            [class.text-right]="col.align === 'right'"
            [class.text-center]="col.align === 'center'"
          >
            {{ col.label }}
          </div>
        }
        @if (rowActions()) {
          <div role="columnheader" class="eyebrow text-right w-24">
            <span class="sr-only">Действия</span>
          </div>
        }
      </div>

      @if (loading()) {
        @for (row of skeletonRows; track row) {
          <div
            role="row"
            class="hairline-b px-3 py-3"
            [style.grid-template-columns]="gridTemplate()"
            data-test="tree-skeleton-row"
          >
            <div class="h-3 bg-paper-2 rounded-sm animate-pulse col-span-full"></div>
          </div>
        }
      } @else if (data().length === 0) {
        <div class="py-12 px-3 text-center text-muted-foreground" data-test="tree-empty-state">
          {{ emptyMessage() }}
        </div>
      } @else {
        <div
          cdkDropList
          [cdkDropListData]="data()"
          [cdkDropListDisabled]="!dragReorder()"
          (cdkDropListDropped)="onDrop(null, $event)"
          class="divide-y divide-rule"
          data-test="tree-root-list"
        >
          @for (row of data(); track rowKeyOf(row)) {
            <ng-container *ngTemplateOutlet="treeRow; context: { $implicit: row, level: 0 }" />
            @if (isExpanded(row) && childRowsOf(row).length > 0) {
              <div
                cdkDropList
                [cdkDropListData]="childRowsOf(row)"
                [cdkDropListDisabled]="!dragReorder()"
                (cdkDropListDropped)="onDrop(row, $event)"
                class="divide-y divide-rule/50 bg-muted/20 pl-8"
                [attr.data-test]="'tree-children-' + rowKeyOf(row)"
              >
                @for (child of childRowsOf(row); track rowKeyOf(child)) {
                  <ng-container
                    *ngTemplateOutlet="treeRow; context: { $implicit: child, level: 1 }"
                  />
                }
              </div>
            }
          }
        </div>
      }
    </div>

    <ng-template #treeRow let-row let-level="level">
      <div
        cdkDrag
        [cdkDragDisabled]="!dragReorder()"
        [cdkDragData]="row"
        role="row"
        class="grid gap-2 px-3 py-2.5 items-center hover:bg-paper-2 transition-colors group"
        [style.grid-template-columns]="gridTemplate()"
        [attr.data-test]="'tree-row-' + rowKeyOf(row)"
      >
        @for (col of columns(); track col.key; let first = $first) {
          <div
            role="cell"
            class="min-w-0 py-0.5"
            [class.text-right]="col.align === 'right'"
            [class.text-center]="col.align === 'center'"
            [class.tabular-nums]="col.numeric"
            [class]="col.cellClass ?? ''"
            [style.padding-left.rem]="first ? level * 1.5 : null"
          >
            @if (first) {
              <span class="inline-flex items-center gap-2 min-w-0">
                @if (childRowsOf(row).length > 0) {
                  <button
                    type="button"
                    class="w-5 h-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-ink pi-focus-ring shrink-0"
                    (click)="toggleExpanded(row)"
                    [attr.aria-label]="isExpanded(row) ? 'Свернуть' : 'Развернуть'"
                    [attr.aria-expanded]="isExpanded(row)"
                  >
                    <span [class.rotate-90]="isExpanded(row)" aria-hidden="true">›</span>
                  </button>
                } @else {
                  <span class="w-5 h-5 shrink-0"></span>
                }
                @if (dragReorder()) {
                  <span
                    cdkDragHandle
                    class="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                    aria-hidden="true"
                    >⋮⋮</span
                  >
                }
                @if (cellTemplates()[col.key]; as tpl) {
                  <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row }" />
                } @else {
                  {{ formatCell(col, row) }}
                }
              </span>
            } @else if (cellTemplates()[col.key]; as tpl) {
              <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row }" />
            } @else {
              {{ formatCell(col, row) }}
            }
          </div>
        }
        @if (rowActions(); as actions) {
          <div
            role="cell"
            class="w-24 flex items-center justify-end gap-1"
            (click)="$event.stopPropagation()"
          >
            <ng-container *ngTemplateOutlet="actions; context: { $implicit: row }" />
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class PiTableTreeComponent<T> {
  readonly data = input<T[]>([]);
  readonly columns = input.required<ColumnDef<T>[]>();
  /** Child resolver; named childRows to avoid colliding with HTMLElement.children in shallow tests. */
  readonly childRows = input.required<(row: T) => T[]>();
  readonly expandedIds = input<ReadonlySet<string>>(new Set<string>());
  readonly cellTemplates = input<Record<string, TemplateRef<{ $implicit: T }>>>({});
  readonly rowActions = input<TemplateRef<{ $implicit: T }> | null>(null);
  readonly dragReorder = input(false);
  readonly loading = input(false);
  readonly emptyMessage = input('Нет данных для отображения.');
  readonly ariaLabel = input('Дерево');

  readonly expandedChange = output<Set<string>>();
  readonly drop = output<TreeDropEvent<T>>();

  protected readonly skeletonRows = [0, 1, 2, 3, 4] as const;
  private readonly localExpandedIds = signal<Set<string>>(new Set<string>());

  protected readonly gridTemplate = computed(() => {
    const columns = this.columns().map((col) => col.width ?? 'minmax(0, 1fr)');
    if (this.rowActions()) columns.push('6rem');
    return columns.join(' ');
  });

  protected childRowsOf(row: T): T[] {
    return this.childRows()(row);
  }
  protected rowKeyOf(row: T): string {
    const value = row as T & { _id?: string; id?: string };
    return value._id ?? value.id ?? JSON.stringify(row);
  }
  protected isExpanded(row: T): boolean {
    const key = this.rowKeyOf(row);
    return this.expandedIds().has(key) || this.localExpandedIds().has(key);
  }
  protected toggleExpanded(row: T): void {
    const key = this.rowKeyOf(row);
    const next = new Set(this.expandedIds());
    if (this.localExpandedIds().has(key)) next.add(key);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.localExpandedIds.set(next);
    this.expandedChange.emit(next);
  }
  protected onDrop(parent: T | null, event: CdkDragDrop<T[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.drop.emit({
      parent,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
  protected formatCell(col: ColumnDef<T>, row: T): string {
    if (col.format) return col.format(row);
    const value = col.accessor ? col.accessor(row) : row[col.key];
    return value == null ? '' : String(value);
  }
}
