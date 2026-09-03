import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  PiCounterpartiesService,
  PiOrdersService,
  PiOrganizationsService,
  PiProductsService,
  PiSitesService,
  type Counterparty,
  type OrderItemPayload,
  type Organization,
  type Product,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';

interface ItemDraft {
  readonly productId: string;
  readonly quantity: number;
}

/**
 * Direct order creation without a quotation (TZ-NX-SALES-S36-ORDER-CREATE).
 * The site comes from `PiSitesService.ensureDefault`; the order is created
 * with `status: 'draft'` and NO quotationId. Never calls stub-proposal.
 */
@Component({
  selector: 'pi-order-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink],
  template: `
    <main class="px-panel-inset py-6" data-test="order-create">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0">Новый заказ</h1>
        <p class="text-sm text-muted-foreground m-0 mt-1">Прямой заказ без КП.</p>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="order-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="order-error"
        />
      }

      @if (status() === 'ready') {
        <form class="space-y-6 max-w-2xl" (submit)="onFormSubmit($event)">
          @if (error()) {
            <app-pi-status-banner tone="destructive" [message]="error()" data-test="order-error" />
          }

          <div class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium">Заказчик *</span>
              <select
                class="pi-input w-full"
                data-test="order-customer"
                [value]="customerId()"
                (change)="customerId.set($any($event.target).value)"
              >
                <option value="">Выберите заказчика</option>
                @for (customer of counterparties(); track customer._id) {
                  <option [value]="customer._id">{{ customer.name }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium">Наша фирма</span>
              <select
                class="pi-input w-full"
                data-test="order-organization"
                [value]="organizationId()"
                (change)="organizationId.set($any($event.target).value)"
              >
                <option value="">Не выбрана</option>
                @for (org of organizations(); track org._id) {
                  <option [value]="org._id">{{ org.name }}</option>
                }
              </select>
            </label>
          </div>

          <section>
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-medium m-0">Позиции *</h2>
              <button
                class="pi-button pi-button-secondary"
                type="button"
                data-test="order-add-item"
                (click)="addItem()"
              >
                Добавить позицию
              </button>
            </div>
            <div class="space-y-2">
              @for (item of items(); track $index) {
                <div class="grid grid-cols-[minmax(0,1fr)_minmax(6rem,0.5fr)_auto] gap-3" data-test="order-item-row">
                  <select
                    class="pi-input w-full"
                    data-test="order-item-product"
                    [value]="item.productId"
                    (change)="setItemProduct($index, $any($event.target).value)"
                  >
                    <option value="">Выберите изделие</option>
                    @for (product of products(); track product._id) {
                      <option [value]="product._id">{{ product.name }}</option>
                    }
                  </select>
                  <input
                    class="pi-input w-full"
                    type="number"
                    min="1"
                    data-test="order-item-qty"
                    [value]="item.quantity"
                    (input)="setItemQty($index, $any($event.target).value)"
                    aria-label="Количество"
                  />
                  <button
                    class="pi-button pi-button-ghost"
                    type="button"
                    data-test="order-item-remove"
                    (click)="removeItem($index)"
                    [disabled]="items().length <= 1"
                  >
                    Убрать
                  </button>
                </div>
              }
            </div>
          </section>

          <label class="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input type="checkbox" class="pi-checkbox" data-test="order-paid" [checked]="isPaid()" (change)="isPaid.set($any($event.target).checked)" />
            <span>Оплачен</span>
          </label>

          <div class="flex items-center gap-3">
            <button
              class="pi-button pi-button-primary"
              type="submit"
              data-test="order-create-submit"
              [disabled]="!canSubmit()"
            >
              {{ saving() ? 'Создание…' : 'Создать заказ' }}
            </button>
            <a class="pi-button pi-button-ghost" routerLink="/orders">Отмена</a>
          </div>
        </form>
      }
    </main>
  `,
})
export class OrderCreatePage implements OnInit {
  private readonly counterpartiesApi = inject(PiCounterpartiesService);
  private readonly productsApi = inject(PiProductsService);
  private readonly organizationsApi = inject(PiOrganizationsService);
  private readonly sitesApi = inject(PiSitesService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly router = inject(Router);

  readonly counterparties = signal<readonly Counterparty[]>([]);
  readonly products = signal<readonly Product[]>([]);
  readonly organizations = signal<readonly Organization[]>([]);
  readonly customerId = signal('');
  readonly organizationId = signal('');
  readonly isPaid = signal(false);
  readonly items = signal<readonly ItemDraft[]>([{ productId: '', quantity: 1 }]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly saving = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    const [customers, products, orgs] = await Promise.all([
      firstValueFrom(this.counterpartiesApi.list()),
      firstValueFrom(this.productsApi.list({ isActive: true })),
      firstValueFrom(this.organizationsApi.list()),
    ]);
    if (!customers.ok) {
      this.error.set(extractErrorMessage(customers.error));
      this.status.set('error');
      return;
    }
    this.counterparties.set(customers.data?.items ?? []);
    this.products.set(products.ok ? (products.data?.items ?? []) : []);
    this.organizations.set(orgs.ok ? (orgs.data?.items ?? []) : []);
    this.status.set('ready');
  }

  addItem(): void {
    this.items.update((rows) => [...rows, { productId: '', quantity: 1 }]);
  }

  removeItem(index: number): void {
    this.items.update((rows) => rows.filter((_, i) => i !== index));
  }

  setItemProduct(index: number, productId: string): void {
    this.items.update((rows) => rows.map((row, i) => (i === index ? { ...row, productId } : row)));
  }

  setItemQty(index: number, qty: string): void {
    const parsed = Number.parseInt(qty, 10);
    this.items.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, quantity: Number.isNaN(parsed) ? 0 : parsed } : row)),
    );
  }

  canSubmit(): boolean {
    return (
      this.customerId().length > 0
      && this.items().some((row) => row.productId.length > 0 && row.quantity > 0)
      && !this.saving()
    );
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
    void this.save();
  }

  async save(): Promise<void> {
    if (!this.canSubmit()) return; // нет клиента / пустые позиции — не POST
    const customerId = this.customerId();
    this.saving.set(true);
    this.error.set('');
    const site = await firstValueFrom(this.sitesApi.ensureDefault(customerId));
    if (!site.ok) {
      this.error.set('Не удалось определить объект заказчика. Заказ не создан.');
      this.saving.set(false);
      return;
    }
    const items: OrderItemPayload[] = this.items()
      .filter((row) => row.productId.length > 0 && row.quantity > 0)
      .map((row) => ({ productId: row.productId, quantity: row.quantity }));
    const result = await firstValueFrom(
      this.ordersApi.create({
        counterpartyId: customerId,
        siteId: site.data?._id ?? '',
        items,
        status: 'draft',
        ...(this.organizationId() ? { organizationId: this.organizationId() } : {}),
        ...(this.isPaid() ? { isPaid: true } : {}),
      }),
    );
    this.saving.set(false);
    if (!result.ok) {
      this.error.set(extractErrorMessage(result.error));
      return;
    }
    if (result.data) void this.router.navigate(['/orders', result.data._id]);
  }
}