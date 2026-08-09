import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import { estimateFamilyTotal } from '../../../shared/services/pi-proposals.service';
import { formatPrice } from '../../../shared/util/format';
import { extractErrorMessage } from '../../../core/silent-http';
import type { ProposalDraftLine } from './proposal-product-rail.component';

export interface ProposalCreateInspectorState {
  organizationId: string;
  orgMarkupPercent: number;
}

/**
 * Right inspector for Create KP (TZ-SALES-315).
 * Estimate sum is UI-only preview from draft lines × markup %.
 */
@Component({
  selector: 'app-proposal-create-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <div class="inspector" data-test="kp-create-inspector">
      <app-pi-form-field label="Наша фирма (бланк)" htmlFor="kp-insp-org">
        <app-pi-overflow-select
          [items]="organizationItems()"
          [value]="organizationId()"
          (valueChange)="onOrgChange($event)"
          searchable="auto"
          placeholder="— выберите —"
          ariaLabel="Наша фирма"
          dataTest="kp-insp-org"
        />
      </app-pi-form-field>

      @if (organizationId()) {
        <app-pi-button
          type="button"
          variant="ghost"
          size="sm"
          data-test="kp-insp-open-org"
          (click)="openOrganization()"
        >
          Открыть организацию
        </app-pi-button>
      }

      <app-pi-form-field label="Наценка %" htmlFor="kp-insp-markup">
        <app-pi-input
          id="kp-insp-markup"
          type="number"
          [ngModel]="orgMarkupPercent()"
          (ngModelChange)="onMarkupChange($event)"
          data-test="kp-insp-markup"
        />
      </app-pi-form-field>

      <div class="inspector__estimate" data-test="kp-insp-estimate">
        <p class="eyebrow m-0">оценка</p>
        <p class="text-base font-mono m-0">{{ estimateLabel() }}</p>
        <p class="text-[11px] text-muted-foreground m-0">
          Подсказка по draft × наценка; не пишется в сохранённый total.
        </p>
      </div>

      <app-pi-form-field label="Клиент (заглушка)" htmlFor="kp-insp-cp">
        <select id="kp-insp-cp" class="pi-input w-full" disabled data-test="kp-insp-cp-stub">
          <option>Выбор клиента — later</option>
        </select>
      </app-pi-form-field>

      @if (error()) {
        <p class="text-xs text-destructive m-0" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    .inspector {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
      min-height: 0;
      overflow: auto;
    }
    .inspector__estimate {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem;
      border: 1px solid var(--color-rule);
    }
  `,
})
export class ProposalCreateInspectorComponent implements OnInit {
  private readonly orgs = inject(OrganizationsService);
  private readonly router = inject(Router);

  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly stateChange = output<ProposalCreateInspectorState>();

  protected readonly organizations = signal<Organization[]>([]);
  protected readonly organizationId = signal('');
  protected readonly orgMarkupPercent = signal(0);
  protected readonly error = signal<string | null>(null);

  protected readonly organizationItems = computed(() =>
    this.organizations().map((o) => ({
      id: o._id,
      label: `${o.name}${o.inn ? ' · ИНН ' + o.inn : ''}`,
    })),
  );

  protected readonly estimateLabel = computed(() => {
    const base = this.draftLines().reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    return formatPrice(estimateFamilyTotal(base, this.orgMarkupPercent()));
  });

  ngOnInit(): void {
    this.orgs.list({ limit: 200 }).subscribe((res) => {
      if (!res.ok) {
        this.error.set(extractErrorMessage(res.error));
        this.organizations.set([]);
        return;
      }
      this.organizations.set(res.data.items ?? []);
    });
  }

  protected onOrgChange(id: string): void {
    this.organizationId.set(id);
    this.emitState();
  }

  protected onMarkupChange(raw: string | number): void {
    const n = Number(raw);
    this.orgMarkupPercent.set(Number.isFinite(n) ? n : 0);
    this.emitState();
  }

  protected openOrganization(): void {
    const id = this.organizationId();
    if (!id) return;
    void this.router.navigate(['/organizations'], { queryParams: { highlight: id } });
  }

  private emitState(): void {
    this.stateChange.emit({
      organizationId: this.organizationId(),
      orgMarkupPercent: this.orgMarkupPercent(),
    });
  }
}
