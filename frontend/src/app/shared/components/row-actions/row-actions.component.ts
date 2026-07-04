import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export interface RowActionsCallbacks {
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (row: Record<string, unknown>) => void;
}

export type RowActionsParams = ICellRendererParams & RowActionsCallbacks;

/**
 * AG Grid cell renderer: shows ✎ (Edit) and 🗑 (Delete) buttons.
 * Callbacks are passed via cellRendererParams from CrudPage.
 */
@Component({
  selector: 'app-row-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1 h-full justify-center">
      <button
        type="button"
        class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-foreground transition-colors"
        (click)="onEditClick($event)"
        title="Редактировать"
        aria-label="Редактировать"
      >
        ✎
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
        (click)="onDeleteClick($event)"
        title="Удалить"
        aria-label="Удалить"
      >
        🗑
      </button>
    </div>
  `,
})
export class RowActionsComponent implements ICellRendererAngularComp {
  private params!: RowActionsParams;

  agInit(params: RowActionsParams): void {
    this.params = params;
  }

  refresh(params: RowActionsParams): boolean {
    this.params = params;
    return true;
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    if (this.params?.onEdit && this.params?.data) {
      this.params.onEdit(this.params.data);
    }
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    if (this.params?.onDelete && this.params?.data) {
      this.params.onDelete(this.params.data);
    }
  }
}
