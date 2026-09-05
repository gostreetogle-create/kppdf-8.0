import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiContractsService, type Contract } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { contractStatusLabel } from './contract-status';

/** Thin read-only card (TZ-NX-DEALS-D4) — no sign/attach/activate UI, see page.md known_limitation. */
@Component({
  selector: 'pi-contract-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="contract-detail">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0" data-test="contract-title">
          @if (contract(); as contract) {
            Договор №{{ contract.number }}
          } @else {
            Договор
          }
        </h1>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="contract-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="contract-error"
        />
      }

      @if (status() === 'success' && contract(); as contract) {
        <div class="space-y-6" data-test="contract-body">
          <app-pi-status-banner tone="info" [message]="statusLabel(contract.status)" />

          <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 text-sm">
            <div>
              <div class="text-xs text-muted-foreground">Заказчик</div>
              <div class="font-medium">{{ customerName(contract) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">КП</div>
              <div class="font-medium">
                @if (proposalNumber(contract); as number) {
                  {{ number }}
                } @else {
                  Без КП
                }
              </div>
            </div>
          </div>

          <section>
            <h2 class="text-sm font-medium m-0 mb-2">Позиции</h2>
            @if (contract.items.length > 0) {
              <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
                @for (item of contract.items; track $index) {
                  <div
                    class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom last:border-b-0 text-sm"
                    data-test="contract-item"
                  >
                    <span class="font-medium truncate">{{ item.productName ?? item.productId }}</span>
                    <span class="text-muted-foreground tabular-nums">×{{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}</span>
                    <span class="tabular-nums">{{ item.total }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="pi-dashed-panel p-8 text-center text-sm text-muted-foreground" data-test="contract-items-empty">
                В договоре нет позиций
              </div>
            }
          </section>

          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Сумма</span>
            <span class="font-medium tabular-nums" data-test="contract-total">{{ contract.totalAmount }}</span>
          </div>
        </div>
      }
    </main>
  `,
})
export class ContractDetailPage implements OnInit {
  private readonly api = inject(PiContractsService);
  private readonly route = inject(ActivatedRoute);

  readonly contract = signal<Contract | null>(null);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить договор.');

  protected readonly statusLabel = contractStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.api.getById(this.id())).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.contract.set(result.data ?? null);
      this.status.set('success');
    });
  }

  customerName(contract: Contract): string {
    const c = contract.customerId;
    return typeof c === 'string' ? c : (c.name ?? '—');
  }

  proposalNumber(contract: Contract): string | null {
    const p = contract.proposalId;
    if (!p || typeof p === 'string') return null;
    return p.number ?? null;
  }

  private id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }
}
