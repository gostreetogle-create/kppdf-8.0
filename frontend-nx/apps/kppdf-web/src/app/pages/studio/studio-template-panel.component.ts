import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { SelectComponent, SelectOptionComponent } from '@kppdf/ui/select';
import type { DocType } from '@kppdf/data-access';

@Component({
  selector: 'pi-studio-template-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormFieldComponent, SelectComponent, SelectOptionComponent],
  template: `
    <div data-test="studio-template-panel">
      <p class="heading">Шаблон</p>
      <p class="hint">
        Сохраните текущий документ как шаблон для повторного использования.
      </p>
      <app-pi-form-field
        label="Тип документа"
        htmlFor="studio-template-doc-type"
        [required]="!docTypeId()"
        class="doc-type-field"
      >
        <app-pi-select
          id="studio-template-doc-type"
          size="sm"
          ariaLabel="Тип документа"
          placeholder="— выберите тип —"
          [disabled]="docTypeSaving()"
          [value]="docTypeId() || null"
          (valueChange)="docTypeChange.emit($event ?? '')"
          data-test="studio-template-doc-type"
        >
          @for (dt of docTypes(); track dt._id) {
            <app-pi-select-option [value]="dt._id">{{ dt.name }}</app-pi-select-option>
          }
        </app-pi-select>
      </app-pi-form-field>
      @if (!docTypeId()) {
        <p class="warn" data-test="studio-template-doc-type-hint">
          Назначьте тип документа — без него шаблон не сохранить.
        </p>
      }
      <app-pi-button
        variant="default"
        size="sm"
        class="cta"
        data-test="studio-template-save-cta"
        [disabled]="saving() || !docTypeId()"
        (click)="saveAsTemplate.emit()"
      >
        @if (saving()) {
          Сохранение…
        } @else {
          Сохранить как шаблон
        }
      </app-pi-button>
    </div>
  `,
  styles: [
    `
      .heading {
        margin: 12px 0 0;
        font-weight: 600;
        color: var(--color-ink);
      }
      .hint {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-muted-foreground);
      }
      .doc-type-field {
        display: block;
        margin-top: 12px;
      }
      .warn {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-destructive);
      }
      .cta {
        margin-top: 12px;
        width: 100%;
      }
    `,
  ],
})
export class StudioTemplatePanelComponent {
  readonly docTypeId = input('');
  readonly docTypes = input<DocType[]>([]);
  readonly docTypeSaving = input(false);
  readonly saving = input(false);
  readonly saveAsTemplate = output<void>();
  readonly docTypeChange = output<string>();
}
