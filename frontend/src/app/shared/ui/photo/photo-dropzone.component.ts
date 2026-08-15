import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import type { Photo } from '../../services/photos.service';
import { ButtonComponent } from '../button/button.component';

/**
 * Shared upload/preview strip for product photo-capable form dialogs.
 *
 * Presentational: receives the current photo list, uploading flag and error
 * message as inputs and reports user intent (files to upload / photo to
 * delete) through outputs. All API calls and write state are owned by the
 * parent container (QuickCreateDialogComponent) — B-PHOTO.
 */
@Component({
  selector: 'app-pi-photo-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="space-y-2" data-test="photo-dropzone">
      <div
        class="flex items-center justify-center min-h-20 p-3 hairline rounded-sm bg-paper-2/30 cursor-pointer transition-colors"
        [class.bg-paper-2]="dragActive()"
        role="button"
        tabindex="0"
        (click)="fileInput.click()"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click(); $event.preventDefault()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
        data-test="photo-drop-target"
      >
        <span class="text-xs text-muted-foreground">Перетащите фото сюда или выберите файл</span>
        <input
          #fileInput
          type="file"
          accept="image/*"
          multiple
          class="sr-only"
          (change)="onFileChange($event)"
          data-test="photo-file-input"
        />
      </div>

      @if (uploading()) {
        <p class="text-xs text-muted-foreground" role="status">Загрузка фото…</p>
      }
      @if (errorMessage()) {
        <p class="text-xs text-destructive" role="alert">{{ errorMessage() }}</p>
      }
      @if (photos().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" data-test="photo-previews">
          @for (photo of photos(); track photo._id; let i = $index) {
            <div
              class="relative hairline rounded-sm overflow-hidden bg-paper-2"
              [attr.data-test]="'photo-preview-' + i"
            >
              <img
                [src]="photo.storageUrl"
                [alt]="photo.originalFilename || 'Фото продукта'"
                class="block w-full h-24 object-cover"
              />
              <app-pi-button
                type="button"
                variant="destructive"
                size="icon"
                class="absolute top-1 right-1"
                [attr.aria-label]="'Удалить фото ' + (i + 1)"
                (click)="remove(photo._id, $event)"
                data-test="photo-remove"
              >
                ×
              </app-pi-button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PiPhotoDropzoneComponent {
  readonly photos = input<Photo[]>([]);
  readonly uploading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly uploadRequest = output<File[]>();
  readonly deleteRequest = output<string>();

  protected readonly dragActive = signal(false);

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadRequest.emit(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  protected onDragLeave(): void {
    this.dragActive.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    this.uploadRequest.emit(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(id: string, event: Event): void {
    event.stopPropagation();
    this.deleteRequest.emit(id);
  }
}
