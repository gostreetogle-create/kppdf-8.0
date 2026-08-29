import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import {
  studioLayoutPct,
  studioImageUrl,
  studioTableColumns,
  studioTableRows,
} from './studio-table.helpers';

@Component({
  selector: 'app-studio-panel-properties',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    SwitchComponent,
  ],
  template: `
    <p class="mt-3 font-medium text-ink">Свойства</p>
    @if (block(); as block) {
      @if (block.type === 'text') {
        <app-pi-form-field label="Текст" htmlFor="studio-block-content" class="mt-2">
          <app-pi-textarea
            id="studio-block-content"
            size="sm"
            [value]="block.content ?? ''"
            (valueChange)="contentChange.emit($event)"
            data-test="studio-block-content"
          />
        </app-pi-form-field>
      } @else if (block.type === 'image') {
        <p class="mt-2 text-xs text-muted-foreground">Фото-блок</p>
        @if (imageUrl(block); as url) {
          <img [src]="url" alt="" class="mt-2 max-h-32 w-auto rounded border border-border" />
        }
        @if (block.layout) {
          <app-pi-button
            variant="secondary"
            size="sm"
            class="w-full mt-3"
            data-test="studio-image-full-page"
            [disabled]="!!block.locked"
            (click)="imageFullPage.emit()"
          >
            На весь лист
          </app-pi-button>
          <app-pi-button
            variant="ghost"
            size="sm"
            class="w-full mt-1"
            data-test="studio-image-z-bottom"
            [disabled]="!!block.locked"
            (click)="imageToBack.emit()"
          >
            На задний план
          </app-pi-button>
        }
      } @else if (block.type === 'table') {
        <app-pi-form-field label="Заголовок таблицы" htmlFor="studio-table-title" class="mt-2">
          <app-pi-input
            id="studio-table-title"
            size="sm"
            [value]="block.title ?? ''"
            (valueChange)="titleChange.emit($event)"
            data-test="studio-table-title"
          />
        </app-pi-form-field>
        <dl class="mt-3 space-y-1 text-xs text-muted-foreground">
          <div class="flex justify-between gap-2">
            <dt>Колонок</dt>
            <dd class="tabular-nums text-ink">{{ columns(block).length }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt>Строк (образец)</dt>
            <dd class="tabular-nums text-ink">{{ rows(block).length }}</dd>
          </div>
        </dl>
        <ul class="mt-2 space-y-0.5 text-xs text-ink">
          @for (col of columns(block); track col.key) {
            <li>{{ col.label }}</li>
          }
        </ul>
      }
      @if (block.layout; as layout) {
        <dl class="mt-3 space-y-1 text-xs text-muted-foreground">
          <div class="flex justify-between gap-2">
            <dt>Страница</dt>
            <dd class="tabular-nums text-ink">{{ layout.page ?? 1 }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt>X</dt>
            <dd class="tabular-nums text-ink">{{ pct(layout.x) }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt>Y</dt>
            <dd class="tabular-nums text-ink">{{ pct(layout.y) }}</dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt>Ширина</dt>
            <dd class="tabular-nums text-ink">{{ pct(layout.width) }}</dd>
          </div>
          @if (layout.height !== undefined) {
            <div class="flex justify-between gap-2">
              <dt>Высота</dt>
              <dd class="tabular-nums text-ink">{{ pct(layout.height) }}</dd>
            </div>
          }
          <div class="flex justify-between gap-2">
            <dt>Z</dt>
            <dd class="tabular-nums text-ink">{{ layout.zIndex ?? 1 }}</dd>
          </div>
        </dl>
      }
      <div class="mt-3 flex items-center gap-2 text-xs">
        <app-pi-switch
          id="studio-block-lock"
          [checked]="!!block.locked"
          (checkedChange)="lockChange.emit($event)"
          ariaLabel="Заблокировать геометрию"
        />
        <label for="studio-block-lock" class="cursor-pointer">Заблокировать геометрию</label>
      </div>
      @if (!block.locked) {
        <app-pi-button
          variant="ghost"
          size="sm"
          class="mt-3 text-destructive normal-case tracking-normal font-sans"
          (click)="deleteBlock.emit()"
        >
          Удалить блок
        </app-pi-button>
      }
    } @else {
      <p class="mt-2 text-xs text-muted-foreground">Выберите блок на листе</p>
    }
  `,
})
export class StudioPanelPropertiesComponent {
  readonly block = input<TemplateBlock | null>(null);

  readonly contentChange = output<string>();
  readonly titleChange = output<string>();
  readonly lockChange = output<boolean>();
  readonly imageFullPage = output<void>();
  readonly imageToBack = output<void>();
  readonly deleteBlock = output<void>();

  protected readonly imageUrl = studioImageUrl;
  protected readonly pct = studioLayoutPct;
  protected readonly columns = studioTableColumns;
  protected readonly rows = studioTableRows;
}
