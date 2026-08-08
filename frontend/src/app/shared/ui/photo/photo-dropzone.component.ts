import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { PhotosService, type Photo } from '../../services/photos.service';
import { PiToastService } from '../toast';
import { extractErrorMessage } from '../../../core/silent-http';
import { ButtonComponent } from '../button/button.component';

/** Shared upload/preview strip for product photo-capable form dialogs. */
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
  readonly initialPhotos = input<Photo[]>([]);
  readonly photosChange = output<Photo[]>();
  readonly uploadedPhotoIdsChange = output<string[]>();
  readonly uploadStateChange = output<boolean>();

  protected readonly photos = signal<Photo[]>([]);
  protected readonly uploading = signal(false);
  protected readonly dragActive = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly uploadedPhotoIds = signal<string[]>([]);

  private readonly photosService = inject(PhotosService);
  private readonly toast = inject(PiToastService);

  constructor() {
    effect(() => {
      const initial = this.initialPhotos();
      this.photos.set(initial);
    });
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFiles(Array.from(input.files ?? []));
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
    this.uploadFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected remove(id: string, event: Event): void {
    event.stopPropagation();
    const next = this.photos().filter((photo) => photo._id !== id);
    this.photos.set(next);
    this.photosChange.emit(next);
    this.uploadedPhotoIds.update((ids) => ids.filter((photoId) => photoId !== id));
    this.uploadedPhotoIdsChange.emit(this.uploadedPhotoIds());
    this.photosService.remove(id).subscribe((result) => {
      if (!result.ok) this.toast.error(extractErrorMessage(result.error));
    });
  }

  private uploadFiles(files: File[]): void {
    if (files.length === 0) return;
    this.uploading.set(true);
    this.uploadStateChange.emit(true);
    this.errorMessage.set(null);
    forkJoin(files.map((file) => this.photosService.upload(file))).subscribe((results) => {
      const uploaded: Photo[] = [];
      const failed: string[] = [];
      results.forEach((result, index) => {
        if (result.ok) uploaded.push(result.data);
        else failed.push(files[index].name);
      });
      if (uploaded.length > 0) {
        const next = [...this.photos(), ...uploaded];
        this.photos.set(next);
        this.photosChange.emit(next);
        this.uploadedPhotoIds.update((ids) => [...ids, ...uploaded.map((photo) => photo._id)]);
        this.uploadedPhotoIdsChange.emit(this.uploadedPhotoIds());
      }
      this.uploading.set(false);
      this.uploadStateChange.emit(false);
      if (failed.length > 0) {
        this.errorMessage.set(`Не удалось загрузить: ${failed.join(', ')}`);
        this.toast.error(this.errorMessage() ?? 'Не удалось загрузить фото');
      }
    });
  }
}
