import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type { Photo } from '../../services/photos.service';
import { ButtonComponent } from '../button/button.component';

/**
 * Shared upload/preview strip for product photo-capable form dialogs.
 *
 * Presentational: receives the current photo list, uploading flag, optional
 * progress percent and error message as inputs and reports user intent
 * (files to upload / photo to delete) through outputs. All API calls and
 * write state are owned by the parent container — B-PHOTO.
 */
@Component({
  selector: 'app-pi-photo-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="space-y-2" data-test="photo-dropzone">
      <div
        class="flex items-center justify-center min-h-20 p-3 hairline rounded-sm bg-paper-2/30 transition-colors"
        [class.bg-paper-2]="dragActive()"
        [class.cursor-pointer]="!uploading()"
        [class.cursor-wait]="uploading()"
        [class.opacity-60]="uploading()"
        [class.pointer-events-none]="uploading()"
        role="button"
        tabindex="0"
        [attr.aria-busy]="uploading() ? 'true' : null"
        [attr.aria-disabled]="uploading() ? 'true' : null"
        (click)="openPicker(fileInput)"
        (keydown.enter)="openPicker(fileInput)"
        (keydown.space)="openPicker(fileInput); $event.preventDefault()"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
        (focusin)="onFocusIn()"
        (focusout)="onFocusOut()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
        data-test="photo-drop-target"
      >
        <span class="text-xs text-muted-foreground" data-test="photo-drop-hint">
          {{ uploading() ? 'Идёт загрузка…' : 'Файл с диска · перетащить · Ctrl+V' }}
        </span>
        <input
          #fileInput
          type="file"
          accept="image/*"
          multiple
          class="sr-only"
          [disabled]="uploading()"
          (change)="onFileChange($event)"
          data-test="photo-file-input"
        />
      </div>

      @if (uploading()) {
        <div
          class="space-y-1.5 hairline rounded-sm bg-paper-2 p-2"
          data-test="photo-upload-progress"
        >
          <p class="text-sm text-ink m-0" role="status">{{ statusLabel() }}</p>
          <div
            class="w-full h-2 rounded-sm bg-rule/40 overflow-hidden"
            role="progressbar"
            [attr.aria-valuemin]="0"
            [attr.aria-valuemax]="100"
            [attr.aria-valuenow]="progressPercent() === null ? null : progressPercent()"
            [attr.aria-valuetext]="progressPercent() === null ? 'Загрузка' : null"
            aria-label="Загрузка фото"
          >
            <div
              class="h-full bg-ink motion-reduce:transition-none transition-all duration-300"
              [class.animate-pulse]="progressPercent() === null"
              [style.width.%]="progressPercent() === null ? 50 : progressPercent()"
            ></div>
          </div>
        </div>
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
  /** Determinate 0–100 when browser reports totals; null → indeterminate bar. */
  readonly progressPercent = input<number | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly uploadRequest = output<File[]>();
  readonly deleteRequest = output<string>();
  /** Fired when drop/select contained only non-image files. */
  readonly invalidFileType = output<void>();

  /** RU copy for parents wiring `(invalidFileType)`. */
  static readonly INVALID_FILE_TYPE_MESSAGE = 'Только изображения (JPG, PNG, WebP, GIF, AVIF, SVG)';

  protected readonly dragActive = signal(false);
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  private readonly interactionActive = computed(() => this.hovered() || this.focused());

  protected readonly statusLabel = computed(() => {
    const pct = this.progressPercent();
    return pct === null ? 'Загрузка фото…' : `Загрузка фото… ${pct}%`;
  });

  protected openPicker(fileInput: HTMLInputElement): void {
    if (this.uploading()) return;
    fileInput.click();
  }

  protected onFileChange(event: Event): void {
    if (this.uploading()) return;
    const input = event.target as HTMLInputElement;
    const files = imageFilesFromFileList(input.files);
    if (files.length === 0 && (input.files?.length ?? 0) > 0) {
      this.invalidFileType.emit();
      input.value = '';
      return;
    }
    if (files.length === 0) {
      input.value = '';
      return;
    }
    this.uploadRequest.emit(files);
    input.value = '';
  }

  protected onMouseEnter(): void {
    this.hovered.set(true);
  }

  protected onMouseLeave(): void {
    this.hovered.set(false);
  }

  protected onFocusIn(): void {
    this.focused.set(true);
  }

  protected onFocusOut(): void {
    this.focused.set(false);
  }

  @HostListener('document:paste', ['$event'])
  protected onDocumentPaste(event: ClipboardEvent): void {
    if (!this.interactionActive() || this.uploading()) return;
    const files = imageFilesFromClipboard(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    this.uploadRequest.emit(files);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.uploading()) return;
    event.preventDefault();
    this.dragActive.set(true);
  }

  protected onDragLeave(): void {
    this.dragActive.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    if (this.uploading()) return;
    const files = imageFilesFromFileList(event.dataTransfer?.files ?? null);
    if (files.length === 0) {
      this.invalidFileType.emit();
      return;
    }
    this.uploadRequest.emit(files);
  }

  protected remove(id: string, event: Event): void {
    event.stopPropagation();
    if (this.uploading()) return;
    this.deleteRequest.emit(id);
  }
}

function imageFilesFromFileList(files: FileList | null): File[] {
  return Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
}

function imageFilesFromClipboard(data: DataTransfer | null): File[] {
  const fromItems = Array.from(data?.items ?? [])
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  if (fromItems.length > 0) return fromItems;
  return Array.from(data?.files ?? []).filter((file) => file.type.startsWith('image/'));
}
