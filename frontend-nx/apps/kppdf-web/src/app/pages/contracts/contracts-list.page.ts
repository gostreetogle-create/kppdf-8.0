import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiContractsService, type Contract } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { DEALS_TOC_CHIPS } from '../deals-group-chips';
import { contractStatusLabel } from './contract-status';

/** Read-only list (TZ-NX-DEALS-D4) — see `Contract` doc comment for why create stays out of NX. */
@Component({
  selector: 'pi-contracts-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink, PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="contracts" [chips]="[]" activeId="">
    <main class="py-6" data-test="contracts-list">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0">Договоры</h1>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="contracts-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="contracts-error"
        />
      }

      @if (status() === 'success' && rows().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="contracts-empty">
          Договоров пока нет.
        </div>
      }

      @if (status() === 'success' && rows().length > 0) {
        <div
          class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised"
          role="table"
          aria-label="Договоры"
          data-test="contracts-table"
        >
          <div class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(6rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader">Номер</span>
            <span role="columnheader">Заказчик</span>
            <span role="columnheader">Статус</span>
            <span role="columnheader">Сумма</span>
            <span role="columnheader" aria-label="Открыть карточку"></span>
          </div>
          @for (row of rows(); track row._id) {
            <div
              class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(6rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 items-center px-4 py-3 hairline-bottom last:border-b-0"
              role="row"
              data-test="contract-row"
            >
              <span class="font-medium truncate" role="cell">{{ row.number }}</span>
              <span class="text-sm text-muted-foreground truncate" role="cell">{{ customerName(row) }}</span>
              <span class="text-sm" role="cell">{{ statusLabel(row.status) }}</span>
              <span class="text-sm tabular-nums" role="cell">{{ row.totalAmount }}</span>
              <a class="pi-button pi-button-secondary" [routerLink]="['/contracts', row._id]" role="cell" data-test="contract-row-link">
                Карточка
              </a>
            </div>
          }
        </div>
      }
    </main>
    </app-pi-group-workspace>
  `,
})
export class ContractsListPage implements OnInit {
  private readonly api = inject(PiContractsService);

  protected readonly toc = DEALS_TOC_CHIPS;

  readonly rows = signal<readonly Contract[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить договоры.');

  protected readonly statusLabel = contractStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.api.list()).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.rows.set(result.data ?? []);
      this.status.set('success');
    });
  }

  customerName(row: Contract): string {
    const c = row.customerId;
    return typeof c === 'string' ? c : (c.name ?? '—');
  }
}
