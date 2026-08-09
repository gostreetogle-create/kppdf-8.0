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
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import { Organization, OrganizationsService } from '../../../shared/services/organizations.service';
import { estimateFamilyTotal } from '../../../shared/services/pi-proposals.service';
import { formatPrice } from '../../../shared/util/format';
import { extractErrorMessage } from '../../../core/silent-http';
import type { ProposalDraftLine } from './proposal-product-rail.component';

export interface ProposalTableLayoutColumn {
  key: string;
  label: string;
  visible: boolean;
}

export interface ProposalCreateInspectorState {
  organizationId: string;
  orgMarkupPercent: number;
}

/**
 * Right inspector for Create KP (TZ-SALES-315 + TZ-SALES-330).
 * Estimate sum is UI-only preview from draft lines × markup %.
 */
@Component({
  selector: 'app-proposal-create-inspector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
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

      <section class="inspector__table" data-test="kp-insp-table">
        <div class="inspector__section-heading">
          <h3>Таблица</h3>
          <p>Меняет только это КП, не общий шаблон</p>
        </div>
        <div class="inspector__columns">
          @for (column of tableLayout(); track column.key; let index = $index) {
            <div class="inspector__column" [attr.data-test]="'kp-table-column-' + column.key">
              <span class="inspector__column-label">{{ column.label }}</span>
              <span class="inspector__column-actions">
                <button
                  type="button"
                  class="pi-focus-ring"
                  [disabled]="index === 0"
                  [attr.aria-label]="'Поднять ' + column.label"
                  [attr.data-test]="'kp-table-up-' + column.key"
                  (click)="moveColumn(index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="pi-focus-ring"
                  [disabled]="index === tableLayout().length - 1"
                  [attr.aria-label]="'Опустить ' + column.label"
                  [attr.data-test]="'kp-table-down-' + column.key"
                  (click)="moveColumn(index, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="pi-focus-ring inspector__visibility"
                  role="switch"
                  [attr.aria-checked]="column.visible"
                  [attr.data-test]="'kp-table-visible-' + column.key"
                  (click)="toggleColumn(index)"
                >
                  {{ column.visible ? 'Показать' : 'Скрыто' }}
                </button>
              </span>
            </div>
          }
        </div>
        <a
          class="inspector__preset-link"
          routerLink="/doc-constructor/tables"
          data-test="kp-table-open-preset"
        >
          Пресет в Документах
        </a>
      </section>

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
    .inspector__estimate,
    .inspector__table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid var(--color-rule);
    }
    .inspector__section-heading h3,
    .inspector__section-heading p {
      margin: 0;
    }
    .inspector__section-heading h3 {
      font-size: 0.9rem;
      color: var(--color-ink);
    }
    .inspector__section-heading p {
      color: var(--color-muted-foreground, #6b7280);
      font-size: 0.7rem;
    }
    .inspector__columns {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .inspector__column {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      min-height: 2rem;
      padding: 0.2rem 0.25rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .inspector__column-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.8rem;
    }
    .inspector__column-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex-shrink: 0;
    }
    .inspector__column-actions button {
      min-width: 1.75rem;
      min-height: 1.75rem;
      padding: 0.15rem 0.3rem;
      border: 1px solid var(--color-rule);
      background: transparent;
      color: var(--color-ink);
      cursor: pointer;
    }
    .inspector__column-actions button:disabled {
      cursor: default;
      opacity: 0.45;
    }
    .inspector__column-actions .inspector__visibility {
      min-width: 4.5rem;
      font-size: 0.7rem;
    }
    .inspector__preset-link {
      color: var(--color-gold-deep, var(--color-ink));
      font-size: 0.75rem;
      text-decoration: underline;
    }
  `,
})
export class ProposalCreateInspectorComponent implements OnInit {
  private readonly orgs = inject(OrganizationsService);
  private readonly router = inject(Router);

  readonly draftLines = input<ProposalDraftLine[]>([]);
  readonly tableLayout = input<ProposalTableLayoutColumn[]>([]);
  readonly stateChange = output<ProposalCreateInspectorState>();
  readonly tableLayoutChange = output<ProposalTableLayoutColumn[]>();

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

  protected moveColumn(index: number, delta: -1 | 1): void {
    const nextIndex = index + delta;
    const current = this.tableLayout();
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;
    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    this.tableLayoutChange.emit(next);
  }

  protected toggleColumn(index: number): void {
    const current = this.tableLayout();
    const column = current[index];
    if (!column) return;
    this.tableLayoutChange.emit(
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, visible: !entry.visible } : entry,
      ),
    );
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
