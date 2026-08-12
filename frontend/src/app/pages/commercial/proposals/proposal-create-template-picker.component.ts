import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import {
  DocumentTemplate,
  DocumentTemplatesService,
} from '../../../shared/services/pi-document-templates.service';
import { extractErrorMessage } from '../../../core/silent-http';

/**
 * Left-panel template bind for Create КП (TZ-SALES-317 polish).
 * Select + edit live here so center stays A4-only.
 */
@Component({
  selector: 'app-proposal-create-template-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiOverflowSelectComponent],
  template: `
    <div class="tpl-picker" data-test="kp-tpl-picker">
      <div class="tpl-picker__heading">
        <h3>Шаблон</h3>
        <p>Бланк этого КП</p>
      </div>
      <app-pi-overflow-select
        [items]="templateItems()"
        [value]="selectedId()"
        (valueChange)="onSelect($event)"
        searchable="auto"
        placeholder="Выберите шаблон…"
        ariaLabel="Шаблон КП"
        dataTest="kp-tpl-select"
      />

      @if (selected()) {
        <div class="tpl-picker__meta">
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

      @if (error()) {
        <p class="text-xs text-destructive m-0" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      flex: 0 0 auto;
    }
    .tpl-picker {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-bottom: 0.75rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-rule);
    }
    .tpl-picker__heading {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .tpl-picker__heading h3,
    .tpl-picker__heading p {
      margin: 0;
    }
    .tpl-picker__heading h3 {
      font-size: 0.9rem;
    }
    .tpl-picker__heading p {
      font-size: 0.75rem;
      color: var(--color-muted-foreground, #6b7280);
    }
    .tpl-picker__meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  `,
})
export class ProposalCreateTemplatePickerComponent implements OnInit {
  private readonly templates = inject(DocumentTemplatesService);
  private readonly router = inject(Router);

  /** Restore selection when flyout remounts. */
  readonly initialId = input<string>('');
  readonly templateChange = output<DocumentTemplate | null>();

  protected readonly all = signal<DocumentTemplate[]>([]);
  protected readonly selectedId = signal('');
  protected readonly selected = signal<DocumentTemplate | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.initialId();
      if (!id || id === this.selectedId()) return;
      if (this.all().length === 0) return;
      this.applyId(id, false);
    });
  }

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
      const restore = this.initialId();
      if (restore) this.applyId(restore, false);
    });
  }

  protected onSelect(id: string): void {
    this.applyId(id, true);
  }

  protected openBuilder(): void {
    const id = this.selectedId();
    if (!id) return;
    void this.router.navigate(['/doc-constructor/templates'], {
      queryParams: { templateId: id, source: 'quotation-create' },
    });
  }

  private applyId(id: string, emit: boolean): void {
    this.selectedId.set(id);
    const tpl = this.all().find((t) => t._id === id) ?? null;
    this.selected.set(tpl);
    if (emit) this.templateChange.emit(tpl);
  }
}
