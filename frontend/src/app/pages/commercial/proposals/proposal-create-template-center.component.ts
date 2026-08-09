import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import { extractErrorMessage } from '../../../core/silent-http';
import type { ProposalDraftLine } from './proposal-product-rail.component';

/**
 * Center template bind + A4 preview zone (TZ-SALES-316).
 * No embedded WYSIWYG / PDF engine — deep-link to builder.
 */
@Component({
  selector: 'app-proposal-create-template-center',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormFieldComponent, PiOverflowSelectComponent],
  template: `
    <div class="center" data-test="kp-create-template-center">
      <app-pi-form-field label="Шаблон КП" htmlFor="kp-tpl">
        <app-pi-overflow-select
          [items]="templateItems()"
          [value]="selectedId()"
          (valueChange)="onSelect($event)"
          searchable="auto"
          placeholder="— выберите шаблон —"
          ariaLabel="Шаблон КП"
          dataTest="kp-tpl-select"
        />
      </app-pi-form-field>

      @if (selected()) {
        <div class="center__actions">
          <app-pi-button
            type="button"
            variant="outline"
            size="sm"
            data-test="kp-tpl-edit"
            (click)="openBuilder()"
          >
            Редактировать шаблон
          </app-pi-button>
        </div>
      }

      <div class="center__sheet" data-test="kp-tpl-preview">
        @if (!selected()) {
          <p class="text-sm text-muted-foreground m-0" data-test="kp-tpl-empty">
            Выберите шаблон КП или добавьте позиции слева
          </p>
        } @else {
          <h3 class="text-sm font-semibold m-0" data-test="kp-tpl-name">{{ selected()!.name }}</h3>
          @if (selected()!.description) {
            <p class="text-xs text-muted-foreground m-0">{{ selected()!.description }}</p>
          }
          <p class="text-[11px] text-muted-foreground m-0">
            Превью A4 (упрощённое). Полный builder — по кнопке выше.
          </p>
          @if (draftLines().length > 0) {
            <ul class="center__draft" data-test="kp-tpl-draft-lines">
              @for (line of draftLines(); track $index) {
                <li>{{ line.productName }} · {{ line.quantity }} × {{ line.unitPrice }} ₽</li>
              }
            </ul>
          }
        }
      </div>

      @if (error()) {
        <p class="text-xs text-destructive m-0" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .center {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .center__actions {
      display: flex;
      gap: 0.5rem;
    }
    .center__sheet {
      width: 100%;
      max-width: 794px;
      margin-inline: auto;
      min-height: 14rem;
      padding: 1rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper-2, transparent);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .center__draft {
      margin: 0.5rem 0 0;
      padding-left: 1.1rem;
      font-size: 0.8125rem;
    }
  `,
})
export class ProposalCreateTemplateCenterComponent implements OnInit {
  private readonly templates = inject(DocumentTemplatesService);
  private readonly router = inject(Router);

  readonly draftLines = input<ProposalDraftLine[]>([]);

  protected readonly all = signal<DocumentTemplate[]>([]);
  protected readonly selectedId = signal('');
  protected readonly selected = signal<DocumentTemplate | null>(null);
  protected readonly error = signal<string | null>(null);

  protected templateItems(): { id: string; label: string }[] {
    return this.all().map((t) => ({ id: t._id, label: t.name }));
  }

  ngOnInit(): void {
    this.templates.list({}).subscribe((res) => {
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        this.all.set([]);
        return;
      }
      this.all.set(res.data.items ?? []);
    });
  }

  protected onSelect(id: string): void {
    this.selectedId.set(id);
    this.selected.set(this.all().find((t) => t._id === id) ?? null);
  }

  protected openBuilder(): void {
    const id = this.selectedId();
    if (!id) return;
    void this.router.navigate(['/doc-constructor/templates'], {
      queryParams: { templateId: id, source: 'quotation-create' },
    });
  }
}
