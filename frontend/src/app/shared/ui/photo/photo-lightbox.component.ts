import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PiDialogComponent } from '../dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../dialog/dialog.tokens';
import type { DialogRef } from '../dialog/dialog.types';

export interface PhotoLightboxData {
  src: string;
  alt: string;
  filename?: string;
}

/**
 * Single-image viewer for catalogue photo surfaces.
 *
 * Intentionally has no zoom, pan, carousel, or mutation controls. The dialog
 * service owns Escape/backdrop/focus lifecycle; this component owns only the
 * image presentation and explicit close action.
 */
@Component({
  selector: 'app-pi-photo-lightbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [variant]="'content'"
      [width]="'xl'"
      [title]="'Просмотр фото'"
      [showClose]="false"
      [ariaLabel]="dialogLabel()"
      [animate]="true"
    >
      <div body class="-mx-6 -my-6 bg-ink/95 p-3 sm:p-5" data-test="photo-lightbox-body">
        @if (data.src && !imageFailed()) {
          <img
            [src]="data.src"
            [alt]="data.alt"
            class="block w-full max-h-[calc(90vh-10rem)] object-contain object-center"
            draggable="false"
            (error)="onImageError()"
            data-test="photo-lightbox-image"
          />
        } @else {
          <p
            class="m-0 py-16 text-center text-sm text-paper"
            role="alert"
            data-test="photo-lightbox-error"
          >
            Фото недоступно.
          </p>
        }
      </div>
      <div footer class="w-full justify-between">
        <span
          class="min-w-0 truncate text-xs text-muted-foreground"
          data-test="photo-lightbox-caption"
        >
          {{ data.alt }}
        </span>
        <app-pi-button
          type="button"
          variant="outline"
          size="sm"
          (click)="close()"
          aria-label="Закрыть просмотр фото"
          data-test="photo-lightbox-close"
        >
          Закрыть
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PiPhotoLightboxComponent {
  readonly data = inject<PhotoLightboxData>(PI_DIALOG_DATA);
  protected readonly imageFailed = signal(false);
  private readonly ref = inject<DialogRef<unknown>>(PI_DIALOG_REF);

  protected dialogLabel(): string {
    return this.data.filename ? `Просмотр фото: ${this.data.filename}` : 'Просмотр фото';
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }

  protected close(): void {
    this.ref.close();
  }
}
