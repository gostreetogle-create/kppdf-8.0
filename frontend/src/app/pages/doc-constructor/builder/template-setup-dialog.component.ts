import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';

export type PageSize = 'A3' | 'A4' | 'A5';
export type Orientation = 'portrait' | 'landscape';

export interface TemplateSetupResult {
  pageSize: PageSize;
  orientation: Orientation;
}

export interface TemplateSetupData {
  mode: 'create' | 'duplicate';
}

/**
 * Dialog for choosing page size and orientation when creating or duplicating
 * a document template. Opened via PiDialogService.open().
 */
@Component({
  selector: 'app-template-setup-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      title="Настройка шаблона"
      [width]="'sm'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="setup-form">
          <!-- Page size -->
          <div class="field">
            <span class="field__label">Формат страницы</span>
            <div class="field__chips">
              @for (size of pageSizes; track size) {
                <button
                  type="button"
                  class="chip"
                  [class.chip--active]="pageSize() === size"
                  (click)="pageSize.set(size)"
                >
                  {{ size }}
                </button>
              }
            </div>
          </div>

          <!-- Orientation -->
          <div class="field">
            <span class="field__label">Ориентация</span>
            <div class="field__chips">
              @for (orient of orientations; track orient.value) {
                <button
                  type="button"
                  class="chip"
                  [class.chip--active]="orientation() === orient.value"
                  (click)="orientation.set(orient.value)"
                >
                  {{ orient.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">
          Отмена
        </app-pi-button>
        <app-pi-button variant="default" size="sm" (click)="onConfirm()">
          {{ data.mode === 'duplicate' ? 'Дублировать' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .setup-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 4px 0;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__chips {
        display: flex;
        gap: 8px;
      }

      .chip {
        flex: 1;
        padding: 10px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .chip:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .chip--active {
        background: var(--color-sunrise-warm, #735c00);
        border-color: var(--color-sunrise-warm, #735c00);
        color: white;
      }
    `,
  ],
})
export class TemplateSetupDialogComponent {
  readonly data = inject<TemplateSetupData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<TemplateSetupResult>>(PI_DIALOG_REF);

  protected readonly pageSizes: PageSize[] = ['A3', 'A4', 'A5'];
  protected readonly orientations = [
    { value: 'portrait' as Orientation, label: 'Книжная' },
    { value: 'landscape' as Orientation, label: 'Альбомная' },
  ];

  protected readonly pageSize = signal<PageSize>('A4');
  protected readonly orientation = signal<Orientation>('portrait');

  protected onConfirm(): void {
    this.ref.close({
      pageSize: this.pageSize(),
      orientation: this.orientation(),
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
