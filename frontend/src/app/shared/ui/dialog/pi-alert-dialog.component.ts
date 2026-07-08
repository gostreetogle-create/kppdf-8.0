import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from './dialog.tokens';
import type { DialogRef } from './pi-dialog.service';

export type AlertDialogVariant = 'default' | 'destructive';

export interface AlertDialogData {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AlertDialogVariant;
}

/**
 * AlertDialog — typed wrapper for confirm/cancel flows, opened via
 * PiDialogService.open(). Receives config from PI_DIALOG_DATA token.
 *
 * Web-spec compliant: role="alertdialog", initial focus = cancel button
 * (safer for destructive operations). Closes the dialog on confirm/cancel.
 *
 * @example
 *   this.dialog.open(AlertDialogComponent, {
 *     data: {
 *       title: 'Удалить запись?',
 *       description: 'Это действие нельзя отменить.',
 *       confirmLabel: 'Удалить',
 *       variant: 'destructive',
 *     },
 *     width: 'sm',
 *   });
 */
@Component({
  selector: 'app-pi-alert-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div
      role="alertdialog"
      [attr.aria-labelledby]="titleId()"
      [attr.aria-describedby]="data.description ? descId() : null"
      class="bg-paper hairline rounded-sm w-[440px] overflow-hidden"
    >
      <header class="px-6 pt-6 pb-2">
        <h2 [id]="titleId()" class="font-display text-lg tracking-tight text-ink">
          {{ data.title }}
        </h2>
        @if (data.description) {
          <p [id]="descId()" class="text-sm text-muted-foreground mt-2">
            {{ data.description }}
          </p>
        }
      </header>
      <footer class="px-6 py-4 flex justify-end gap-3 hairline-t">
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">
          {{ data.cancelLabel || 'Отмена' }}
        </app-pi-button>
        <app-pi-button
          [variant]="data.variant === 'destructive' ? 'destructive' : 'default'"
          size="sm"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel || 'Подтвердить' }}
        </app-pi-button>
      </footer>
    </div>
  `,
})
export class AlertDialogComponent implements AfterViewInit {
  readonly data = inject<AlertDialogData>(PI_DIALOG_DATA);

  private readonly ref = inject<DialogRef<boolean>>(PI_DIALOG_REF);
  private readonly doc = inject(DOCUMENT);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  private readonly _uid = signal<string>(
    this.doc.defaultView?.crypto?.randomUUID?.() ??
      `pi-ad-${Math.random().toString(36).slice(2, 8)}`,
  );

  readonly titleId = computed(() => `${this._uid()}-title`);
  readonly descId = computed(() => `${this._uid()}-desc`);

  protected onConfirm(): void {
    this.ref.close(true);
  }

  protected onCancel(): void {
    this.ref.close();
  }

  ngAfterViewInit(): void {
    // Initial focus on cancel button — safer for destructive actions.
    queueMicrotask(() => {
      const host = this.hostEl.nativeElement;
      const first = host.querySelector('button');
      if (first) (first as HTMLButtonElement).focus();
    });
  }
}
