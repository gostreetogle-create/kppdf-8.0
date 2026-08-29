import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
  ElementRef,
} from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import type { StudioDocument } from '../../../shared/services/pi-studio-documents.service';

@Component({
  selector: 'app-studio-panel-elements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col gap-2">
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-add-text"
        [disabled]="previewMode()"
        (click)="addText.emit()"
      >
        + Текст
      </app-pi-button>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-add-table"
        [disabled]="previewMode()"
        (click)="addTable.emit()"
      >
        + Таблица
      </app-pi-button>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-add-image"
        [disabled]="previewMode()"
        (click)="openImagePicker()"
      >
        + Фото
      </app-pi-button>
      <input
        #fileInput
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        class="sr-only"
        (change)="onFile($event)"
      />

      @if (doc(); as d) {
        <dl class="mt-2 space-y-1 text-xs text-muted-foreground">
          <div class="flex justify-between gap-2">
            <dt>Ревизия</dt>
            <dd class="tabular-nums text-ink">{{ d.revision }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt>Блоков</dt>
            <dd class="tabular-nums text-ink">{{ blockCount() }}</dd>
          </div>
        </dl>
      }
    </div>
  `,
})
export class StudioPanelElementsComponent {
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly doc = input<StudioDocument | null>(null);
  readonly blockCount = input(0);
  readonly previewMode = input(false);

  readonly addText = output<void>();
  readonly addTable = output<void>();
  readonly imageFile = output<File>();

  openImagePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFile(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (file) this.imageFile.emit(file);
  }
}
