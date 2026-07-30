import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
} from '../../../shared/ui/dialog/dialog.tokens';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import {
  TableTemplate,
  TableTemplatesService,
} from '../../../shared/services/pi-table-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { extractErrorMessage } from '../../../core/silent-http';

/**
 * TZ-232 Wave 2 — минимальный диалог создания/редактирования шаблона таблицы.
 * Scope: редактирует только name + description. Полный редактор колонок +
 * образцов строк запланирован в TZ-235.D (grouping/template editor).
 */
@Component({
  selector: 'app-table-template-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent],
  template: `
    <form class="flex flex-col gap-4" (ngSubmit)="onSubmit()" data-test="table-template-form-dialog">
      <h2 class="font-display text-xl font-medium text-fg">
        {{ row ? 'Редактировать шаблон' : 'Новый шаблон таблицы' }}
      </h2>

      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-fg">Название</span>
        <input
          type="text"
          class="pi-input"
          [(ngModel)]="name"
          name="name"
          required
          data-test="name-input"
        />
      </label>

      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-fg">Описание</span>
        <textarea
          class="pi-input min-h-[5rem]"
          [(ngModel)]="description"
          name="description"
          rows="3"
          data-test="description-input"
        ></textarea>
      </label>

      @if (row) {
        <div class="text-xs text-muted">
          Колонок: {{ row.columns.length }} · Образцов строк: {{ row.sampleRows?.length ?? 0 }}
        </div>
      } @else {
        <div class="text-xs text-muted">
          Полный редактор колонок и строк — в разработке. Сейчас создаётся пустой шаблон.
        </div>
      }

      <div class="flex justify-end gap-2 pt-2">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button variant="default" type="submit" [disabled]="submitting()" data-test="submit-button">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </form>
  `,
})
export class TableTemplateFormDialogComponent {
  private readonly data = inject(PI_DIALOG_DATA) as { row: TableTemplate | null };
  private readonly ref = inject(PI_DIALOG_REF) as DialogRef<TableTemplate | null>;
  private readonly service = inject(TableTemplatesService);
  private readonly toast = inject(PiToastService);

  // Alias for template readability
  protected get row(): TableTemplate | null {
    return this.data?.row ?? null;
  }

  protected readonly submitting = signal<boolean>(false);
  protected name = '';
  protected description = '';

  constructor() {
    if (this.row) {
      this.name = this.row.name ?? '';
      this.description = this.row.description ?? '';
    }
  }

  protected onSubmit(): void {
    if (!this.name.trim()) {
      this.toast.error('Введите название шаблона.');
      return;
    }
    this.submitting.set(true);
    const payload: Partial<TableTemplate> = {
      name: this.name.trim(),
    };
    const trimmedDesc = this.description.trim();
    if (trimmedDesc) payload.description = trimmedDesc;

    const obs = this.row
      ? this.service.update(this.row._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      this.submitting.set(false);
      if (res.ok) {
        this.toast.success(this.row ? 'Шаблон обновлён.' : 'Шаблон создан.');
        this.ref.close(res.data);
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
