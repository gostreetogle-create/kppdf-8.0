import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { SelectOptionComponent } from '../../../shared/ui/select/select-option.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import type { DocumentTypeOption } from '../../../shared/services/pi-document-templates.service';

@Component({
  selector: 'app-studio-panel-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    SelectComponent,
    SelectOptionComponent,
    SwitchComponent,
  ],
  template: `
    <p class="mt-3 font-medium text-ink">Шаблон</p>
    <div class="mt-3 flex items-center gap-2 text-xs">
      <app-pi-switch
        id="studio-page-numbering"
        [checked]="pageNumbering()"
        (checkedChange)="pageNumberingChange.emit($event)"
        ariaLabel="Нумерация страниц"
        data-test="studio-page-numbering"
      />
      <label for="studio-page-numbering" class="cursor-pointer">Нумерация страниц</label>
    </div>
    <p class="mt-2 text-xs text-muted-foreground">
      Сохранить текущий документ как шаблон для повторного использования.
    </p>
    <app-pi-form-field label="Название шаблона" htmlFor="studio-template-name" class="mt-3">
      <app-pi-input
        id="studio-template-name"
        size="sm"
        placeholder="Например: КП для клиента"
        [value]="templateName()"
        (valueChange)="templateNameChange.emit($event)"
        data-test="studio-template-name"
      />
    </app-pi-form-field>
    <app-pi-form-field
      label="Тип документа"
      htmlFor="studio-template-doc-type"
      [required]="!docTypeId()"
      class="mt-3"
    >
      <app-pi-select
        id="studio-template-doc-type"
        size="sm"
        ariaLabel="Тип документа"
        placeholder="— выберите тип —"
        [disabled]="contextSaving()"
        [value]="docTypeId() || null"
        (valueChange)="docTypeChange.emit($event ?? '')"
        data-test="studio-template-doc-type"
      >
        @for (dt of docTypes(); track dt._id) {
          <app-pi-select-option [value]="dt._id">{{ dt.name }}</app-pi-select-option>
        }
      </app-pi-select>
    </app-pi-form-field>
    <div class="mt-3 flex items-center gap-2 text-xs">
      <app-pi-switch
        id="studio-template-keep-bindings"
        [checked]="keepBindings()"
        (checkedChange)="keepBindingsChange.emit($event)"
        ariaLabel="Сохранить привязки данных"
        data-test="studio-template-keep-bindings"
      />
      <label for="studio-template-keep-bindings" class="cursor-pointer">
        Сохранить привязки данных
      </label>
    </div>
    @if (saveError()) {
      <p class="mt-2 text-xs text-destructive">{{ saveError() }}</p>
    }
    <app-pi-button
      variant="default"
      size="sm"
      class="w-full mt-3"
      data-test="studio-template-save"
      [disabled]="saving() || !templateName().trim() || !docTypeId()"
      (click)="save.emit()"
    >
      @if (saving()) {
        Сохранение…
      } @else {
        Сохранить как шаблон
      }
    </app-pi-button>
  `,
})
export class StudioPanelTemplateComponent {
  readonly pageNumbering = input(false);
  readonly templateName = input('');
  readonly docTypeId = input('');
  readonly docTypes = input<DocumentTypeOption[]>([]);
  readonly keepBindings = input(false);
  readonly contextSaving = input(false);
  readonly saving = input(false);
  readonly saveError = input<string | null>(null);

  readonly pageNumberingChange = output<boolean>();
  readonly templateNameChange = output<string>();
  readonly docTypeChange = output<string>();
  readonly keepBindingsChange = output<boolean>();
  readonly save = output<void>();
}
