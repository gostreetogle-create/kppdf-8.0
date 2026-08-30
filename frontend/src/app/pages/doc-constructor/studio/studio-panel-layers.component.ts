import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { GripVertical, Lock, LucideAngularModule, Unlock } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { SelectOptionComponent } from '../../../shared/ui/select/select-option.component';
import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';

@Component({
  selector: 'app-studio-panel-layers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    FormFieldComponent,
    SelectComponent,
    SelectOptionComponent,
    CdkDropList,
    CdkDrag,
    LucideAngularModule,
  ],
  styles: [
    `
      .studio-layer-row--selected {
        border-color: var(--color-gold);
        background: color-mix(in srgb, var(--color-gold) 8%, transparent);
      }
      .studio-layers-list.cdk-drop-list-dragging .studio-layer-row:not(.cdk-drag-placeholder) {
        transition: transform 200ms ease;
      }
    `,
  ],
  template: `
    <p class="mt-3 font-medium text-ink">Слои</p>
    <div class="mt-2 flex items-center gap-1">
      <app-pi-button
        variant="secondary"
        size="sm"
        class="flex-1"
        data-test="studio-add-page"
        [disabled]="previewMode()"
        (click)="addPage.emit()"
      >
        + Страница
      </app-pi-button>
      <app-pi-button
        variant="ghost"
        size="sm"
        class="flex-1"
        data-test="studio-remove-page"
        [disabled]="previewMode() || pageCount() <= 1"
        (click)="removePage.emit()"
      >
        − Страница
      </app-pi-button>
    </div>
    <p class="mt-2 text-xs text-muted-foreground tabular-nums">Всего: {{ pageCount() }}</p>

    <app-pi-form-field label="Страница на листе" htmlFor="studio-page-filter" class="mt-2">
      <app-pi-select
        id="studio-page-filter"
        size="sm"
        ariaLabel="Страница на листе"
        [value]="pageFilterValue()"
        (valueChange)="pageFilterChange.emit($event ?? 'all')"
        data-test="studio-page-filter"
      >
        <app-pi-select-option value="all">Все страницы</app-pi-select-option>
        @for (page of pageOptions(); track page) {
          <app-pi-select-option [value]="pageValue(page)">Страница {{ page }}</app-pi-select-option>
        }
      </app-pi-select>
    </app-pi-form-field>

    <p class="mt-3 text-xs text-muted-foreground">Порядок сверху вниз — от переднего к заднему</p>
    <div
      cdkDropList
      class="studio-layers-list mt-2 space-y-1"
      data-test="studio-layers-list"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (block of layers(); track blockKey(block)) {
        <div
          cdkDrag
          class="studio-layer-row flex items-center gap-1 rounded border border-border px-1 py-1"
          [class.studio-layer-row--selected]="blockKey(block) === selectedId()"
          data-test="studio-layer-row"
        >
          <span cdkDragHandle class="cursor-grab text-muted-foreground" aria-hidden="true">
            <lucide-angular [img]="GripVerticalIcon" [size]="14" aria-hidden="true" />
          </span>
          <app-pi-button
            variant="ghost"
            size="sm"
            class="flex-1 min-w-0 justify-start truncate px-1 py-0.5 normal-case tracking-normal font-sans"
            (click)="layerSelect.emit(block)"
          >
            {{ typeLabel()(block) }}
            @if (block.layout?.page; as page) {
              <span class="text-muted-foreground"> · стр. {{ page }}</span>
            }
          </app-pi-button>
          <app-pi-button
            variant="ghost"
            size="icon"
            class="shrink-0"
            [attr.aria-label]="block.locked ? 'Разблокировать' : 'Заблокировать'"
            [attr.aria-pressed]="!!block.locked"
            data-test="studio-layer-lock"
            (click)="toggleLock.emit(block)"
          >
            <lucide-angular
              [img]="block.locked ? LockIcon : UnlockIcon"
              [size]="14"
              aria-hidden="true"
            />
          </app-pi-button>
        </div>
      } @empty {
        <p class="text-xs text-muted-foreground mt-2">Нет блоков с геометрией</p>
      }
    </div>
  `,
})
export class StudioPanelLayersComponent {
  readonly previewMode = input(false);
  readonly pageCount = input(1);
  readonly pageFilterValue = input('all');
  readonly pageOptions = input<number[]>([]);
  readonly layers = input<TemplateBlock[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly typeLabel = input.required<(block: TemplateBlock) => string>();

  readonly addPage = output<void>();
  readonly removePage = output<void>();
  readonly pageFilterChange = output<string>();
  readonly layerSelect = output<TemplateBlock>();
  readonly toggleLock = output<TemplateBlock>();
  readonly layerReorder = output<string[]>();

  protected readonly blockKey = blockKey;
  protected readonly GripVerticalIcon = GripVertical;
  protected readonly LockIcon = Lock;
  protected readonly UnlockIcon = Unlock;

  protected pageValue(page: number): string {
    return String(page);
  }

  onDrop(event: CdkDragDrop<TemplateBlock[]>): void {
    const ordered = [...this.layers()];
    moveItemInArray(ordered, event.previousIndex, event.currentIndex);
    const ids = ordered.map((b) => b._id).filter((id): id is string => !!id);
    if (ids.length > 0) this.layerReorder.emit(ids);
  }
}
