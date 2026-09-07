import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  PiPhotoFrame,
  PiPhotoFrameEditorComponent,
  normalizePhotoFrame,
  photoFrameStyle,
} from './pi-photo-frame-editor.component';

/** Shape consumed by the previews strip; mirrors `Photo` (id + url enough for display). */
export interface PiPhotoItem {
  _id: string;
  storageUrl: string;
  originalFilename?: string;
  frame?: PiPhotoFrame;
}

/** Read a populated Photo ref's frame while keeping malformed refs on the default. */
export function photoFrameOf(value: unknown): PiPhotoFrame | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const frame = (value as { frame?: unknown }).frame;
  if (!frame || typeof frame !== 'object') return undefined;
  const candidate = frame as Partial<PiPhotoFrame>;
  if (candidate.fit !== 'contain' && candidate.fit !== 'cover') return undefined;
  return normalizePhotoFrame(candidate);
}

/**
 * Shared upload/preview strip for catalog photo-capable forms (TZ-UI-PHOTO-343 port).
 *
 * Presentational: receives the current photo list, uploading flag, optional
 * progress percent and error message as inputs and reports user intent
 * (files to upload / photo to delete / new main photo) through outputs.
 * All API calls and write state are owned by the parent container — B-PHOTO.
 */
@Component({
  selector: 'pi-photo-dropzone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPhotoFrameEditorComponent],
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
          {{ uploading() ? 'Идёт загрузка…' : 'Файл · перетащить · Ctrl+V (кликните зону)' }}
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
                class="block w-full h-24"
                [style]="photoFrameStyle(photoFrames()?.get(photo._id) ?? photo.frame)"
                data-test="photo-preview-img"
              />
              <button
                type="button"
                class="absolute bottom-1 left-1 z-10 h-6 rounded-sm px-1.5 bg-paper-raised text-ink hairline text-[10px] font-mono uppercase tracking-wider transition-colors hover:bg-paper-2"
                [attr.aria-label]="'Рамка фото ' + (i + 1)"
                (click)="openFrameEditor(photo._id, $event)"
                data-test="photo-frame-button"
              >
                Рамка
              </button>
              <button
                type="button"
                class="absolute top-1 left-1 z-10 h-6 min-w-6 rounded-sm text-xs font-mono transition-colors"
                [class.bg-gold]="photo._id === mainPhotoId()"
                [class.text-on-gold]="photo._id === mainPhotoId()"
                [class.bg-paper-raised]="photo._id !== mainPhotoId()"
                [class.text-ink]="photo._id !== mainPhotoId()"
                [class.hairline]="photo._id !== mainPhotoId()"
                [attr.aria-pressed]="photo._id === mainPhotoId() ? 'true' : 'false'"
                [attr.aria-label]="
                  photo._id === mainPhotoId()
                    ? 'Главное фото: ' + (photo.originalFilename || photo.storageUrl)
                    : 'Сделать главным: ' + (photo.originalFilename || photo.storageUrl)
                "
                (click)="setMain(photo._id, $event)"
                data-test="photo-main-toggle"
              >
                {{ photo._id === mainPhotoId() ? '★' : '·' }}
              </button>
              <button
                type="button"
                class="absolute top-1 right-1 z-10 h-6 min-w-6 rounded-sm bg-destructive text-white text-xs transition-colors hover:brightness-110"
                [attr.aria-label]="'Удалить фото ' + (i + 1)"
                (click)="remove(photo._id, $event)"
                data-test="photo-remove"
              >
                ×
              </button>
            </div>
          }
        </div>
      }
      @if (frameEditingId()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Рамка фото"
          (click)="closeFrameEditor()"
          data-test="photo-frame-overlay"
        >
          <div class="w-full max-w-md bg-paper rounded-sm hairline p-3" (click)="$event.stopPropagation()">
            @if (editingPhoto(); as ep) {
              <pi-photo-frame-editor
                [photoUrl]="ep.storageUrl"
                [photoName]="ep.originalFilename ?? null"
                [frame]="photoFrames()?.get(ep._id) ?? ep.frame ?? null"
                (save)="onFrameSave(ep._id, $event)"
                (cancel)="closeFrameEditor()"
              />
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PiPhotoDropzoneComponent {
  readonly photos = input<PiPhotoItem[]>([]);
  readonly uploading = input(false);
  /** Determinate 0–100 when browser reports totals; null → indeterminate bar. */
  readonly progressPercent = input<number | null>(null);
  readonly errorMessage = input<string | null>(null);
  /** Currently main photo id; null = no main (main ★ deferred to parent default). */
  readonly mainPhotoId = input<string | null>(null);
  /** Frames by photo id (P3); missing id → canonical contain/center. */
  readonly photoFrames = input<ReadonlyMap<string, PiPhotoFrame> | null>(null);
  /** Reports the merged partial frame from the frame editor (parent persists via API). */
  readonly frameSave = output<{ id: string; frame: Partial<PiPhotoFrame> }>();
  readonly filesSelected = output<File[]>();
  readonly removePhoto = output<string>();
  readonly mainChanged = output<string | null>();
  /** Fired when drop/select contained only non-image files. */
  readonly invalidFileType = output<void>();

  /** RU copy for parents wiring `(invalidFileType)`. */
  static readonly INVALID_FILE_TYPE_MESSAGE =
    'Только изображения (JPG, PNG, WebP, GIF, AVIF, SVG)';

  protected readonly dragActive = signal(false);
  protected readonly frameEditingId = signal<string | null>(null);
  protected readonly editingPhoto = computed(
    () => this.photos().find((p) => p._id === this.frameEditingId()) ?? null,
  );
  protected readonly photoFrameStyle = photoFrameStyle;
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
    this.filesSelected.emit(files);
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
    this.filesSelected.emit(files);
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
    this.filesSelected.emit(files);
  }

  protected remove(id: string, event: Event): void {
    event.stopPropagation();
    if (this.uploading()) return;
    this.removePhoto.emit(id);
  }

  protected setMain(id: string, event: Event): void {
    event.stopPropagation();
    if (this.uploading()) return;
    this.mainChanged.emit(this.mainPhotoId() === id ? null : id);
  }

  protected openFrameEditor(id: string, event: Event): void {
    event.stopPropagation();
    if (this.uploading()) return;
    this.frameEditingId.set(id);
  }

  protected closeFrameEditor(): void {
    this.frameEditingId.set(null);
  }

  protected onFrameSave(id: string, frame: Partial<PiPhotoFrame>): void {
    this.frameSave.emit({ id, frame });
    this.closeFrameEditor();
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
