import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@kppdf/ui/button';

@Component({
  selector: 'pi-studio-elements-panel',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="elements">
      <p class="hint">Текст — в активный слой, если он текстовый, иначе новый. Фото и таблица — всегда новый слой.</p>
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
        data-test="studio-add-image"
        [disabled]="previewMode()"
        (click)="openImagePicker()"
      >
        + Фото
      </app-pi-button>
      <app-pi-button
        variant="secondary"
        size="sm"
        class="w-full"
        data-test="studio-add-table"
        [disabled]="previewMode()"
        (click)="addTable.emit()"
      >
        + Таблица (слой)
      </app-pi-button>
      <input
        #fileInput
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        class="sr-only"
        (change)="onFile($event)"
      />
    </div>
  `,
  styles: [`
    .elements { display: flex; flex-direction: column; gap: 8px; }
    .hint { margin: 0 0 4px; font-size: 11px; color: var(--color-muted-foreground); line-height: 1.35; }
    .sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
  `],
})
export class StudioElementsPanelComponent {
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly activeLayerId = input<string | null>(null);
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
