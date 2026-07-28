import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { LucideAngularModule, BookOpen, Columns } from 'lucide-angular';

export interface TemplateSetupResult {
  pageSize: 'A3' | 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
}

@Component({
  selector: 'app-template-setup-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="dialog-host">
      <h2 class="dialog-title">{{ title() }}</h2>
      <p class="dialog-subtitle">Выберите формат и ориентацию документа</p>

      <!-- Orientation -->
      <div class="field">
        <span class="field__label">Ориентация</span>
        <div class="orientation-btns">
          <button
            type="button"
            class="orientation-btn"
            [class.is-active]="orientation() === 'portrait'"
            (click)="orientation.set('portrait')"
          >
            <lucide-icon [img]="BookOpenIcon" [size]="16"></lucide-icon>
            <span class="orientation-btn__label">Книжная</span>
          </button>
          <button
            type="button"
            class="orientation-btn"
            [class.is-active]="orientation() === 'landscape'"
            (click)="orientation.set('landscape')"
          >
            <lucide-icon [img]="ColumnsIcon" [size]="16"></lucide-icon>
            <span class="orientation-btn__label">Альбомная</span>
          </button>
        </div>
      </div>

      <!-- Page format -->
      <div class="field">
        <span class="field__label">Формат Страницы</span>
        <div class="pagesize-btns">
          <button
            type="button"
            class="pagesize-btn"
            [class.is-active]="pageSize() === 'A3'"
            (click)="pageSize.set('A3')"
          >A3</button>
          <button
            type="button"
            class="pagesize-btn"
            [class.is-active]="pageSize() === 'A4'"
            (click)="pageSize.set('A4')"
          >A4</button>
          <button
            type="button"
            class="pagesize-btn"
            [class.is-active]="pageSize() === 'A5'"
            (click)="pageSize.set('A5')"
          >A5</button>
        </div>
      </div>

      <div class="dialog-actions">
        <button type="button" class="btn btn--secondary" (click)="ref.close()">Отмена</button>
        <button type="button" class="btn btn--primary" (click)="onConfirm()">Продолжить</button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-host {
        background: var(--color-paper, #f8f9fa);
        padding: 24px;
        min-width: 340px;
        max-width: 420px;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
      }

      .dialog-title {
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: -0.01em;
        color: var(--color-ink, #191c1d);
        margin: 0 0 4px;
      }

      .dialog-subtitle {
        font-size: 14px;
        color: var(--color-muted, #7f7663);
        margin: 0 0 24px;
      }

      .field {
        margin-bottom: 20px;
      }

      .field__label {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
        margin-bottom: 8px;
      }

      .orientation-btns {
        display: flex;
        gap: 8px;
      }

      .orientation-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .orientation-btn:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .orientation-btn.is-active {
        background: var(--color-ink, #191c1d);
        border-color: var(--color-ink, #191c1d);
        color: var(--color-paper, #f8f9fa);
      }

      .orientation-btn__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .pagesize-btns {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .pagesize-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        background: var(--color-paper, #f8f9fa);
        color: var(--color-muted, #7f7663);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .pagesize-btn:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .pagesize-btn.is-active {
        background: var(--color-sunrise-warm, #735c00);
        border-color: var(--color-sunrise-warm, #735c00);
        color: var(--color-paper, #f8f9fa);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--color-rule, #d0c5af);
      }

      .btn {
        padding: 8px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-radius: 2px;
        cursor: pointer;
        transition: all 120ms ease;
        border: 1px solid transparent;
      }

      .btn--secondary {
        background: transparent;
        border-color: var(--color-rule, #d0c5af);
        color: var(--color-muted, #7f7663);
      }

      .btn--secondary:hover {
        border-color: var(--color-ink, #191c1d);
        color: var(--color-ink, #191c1d);
      }

      .btn--primary {
        background: var(--color-sunrise-warm, #735c00);
        border-color: var(--color-sunrise-warm, #735c00);
        color: var(--color-paper, #f8f9fa);
      }

      .btn--primary:hover {
        opacity: 0.9;
      }
    `,
  ],
})
export class TemplateSetupDialogComponent {
  protected readonly ref = inject<DialogRef<TemplateSetupResult>>(PI_DIALOG_REF);
  protected readonly data = inject<{ mode?: 'create' | 'duplicate' }>(PI_DIALOG_DATA);

  protected readonly BookOpenIcon = BookOpen;
  protected readonly ColumnsIcon = Columns;

  protected readonly pageSize = signal<'A3' | 'A4' | 'A5'>('A4');
  protected readonly orientation = signal<'portrait' | 'landscape'>('portrait');

  protected readonly title = signal(
    this.data?.mode === 'duplicate' ? 'Дублировать шаблон' : 'Новый шаблон',
  );

  protected onConfirm(): void {
    this.ref.close({
      pageSize: this.pageSize(),
      orientation: this.orientation(),
    });
  }
}
