import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
  CompositionTreeComponent,
  type CompositionTreeExpandEvent,
  type CompositionTreeSelectEvent,
  type CompositionTreeEditEvent,
} from '../../shared/ui/composition/composition-tree.component';
import {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { extractErrorMessage } from '../../core/silent-http';
import { formatDate } from '../../shared/util/format';
import { Order, OrdersService } from '../../shared/services/orders.service';
import { SupplyTaskService } from '../../shared/services/pi-supply.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { PiFactCardComponent, PiFactStackComponent } from '../../shared/ui/fact-card';
import { PiStatusBannerComponent, type PiStatusBannerTone } from '../../shared/ui/status-banner';
import { ProductsService } from '../../shared/services/products.service';
import { MaterialsService } from '../../shared/services/materials.service';
import {
  loadOrderCompositionForest,
  ORDER_TREE_INITIAL_DEPTH,
  ORDER_TREE_MAX_DEPTH,
} from '../../shared/orders/order-composition-forest';
import {
  openCatalogEditFromTree,
  type CatalogCompositionEditDeps,
} from '../../shared/orders/open-catalog-composition-edit';

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

type PopulatedRef = string | { _id: string; name?: string; address?: string };
type PopulatedOwner =
  string | { _id: string; displayName?: string; username?: string; fullName?: string };

/**
 * TZ-ORDERS-302/303 — карточка заказа с live BOM + мета заказчик/объект/линии.
 * Корни = линии заказа (изделия); дети = GET /products/:id/tree.
 * Прайс КП / unitPrice линии в дерево не попадают (rails D4).
 */
@Component({
  selector: 'app-order-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PiPageChromeComponent,
    ButtonComponent,
    CompositionTreeComponent,
    PiFactCardComponent,
    PiFactStackComponent,
    PiStatusBannerComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="crumbs()" data-test="order-detail-nav" />

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        data-test="order-detail-error"
      >
        {{ loadError() }}
      </div>
      <div class="py-8 text-center text-muted-foreground text-sm">
        Заказ не найден.
        <a routerLink="/orders" class="block mt-2 text-ink hover:text-sunrise-warm underline"
          >← К заказам</a
        >
      </div>
    }

    @if (order(); as o) {
      <header class="mb-5 space-y-3" data-test="order-detail-header">
        <div>
          <p class="eyebrow m-0">заказ</p>
          <h1
            class="font-display text-xl sm:text-2xl tracking-tight text-ink leading-snug m-0"
            data-test="order-detail-title"
          >
            Заказ №{{ o.number }}
          </h1>
        </div>
        @if (statusBannerTone(o.status); as tone) {
          <app-pi-status-banner
            [tone]="tone"
            [message]="statusBannerMessage(o.status)"
            data-test="order-detail-status-banner"
          />
        }
        <app-pi-fact-stack title="Заказ" headingId="order-facts" dataTest="order-detail-facts">
          <app-pi-fact-card label="Номер" [value]="'№' + o.number" [mono]="true" />
          <app-pi-fact-card label="Клиент" [value]="partyLine() ?? '—'" />
          <app-pi-fact-card label="Объект" [value]="siteLine() ?? '—'" />
          <app-pi-fact-card label="Статус" [value]="statusLabel(o.status)" />
          <app-pi-fact-card
            label="Дата заказа"
            [value]="formatOrderDate(o.date) || '—'"
            [mono]="true"
          />
          <app-pi-fact-card label="КП" [value]="proposalLine()" data-test="order-proposal-fact">
            <span actions>
              @if (proposalId()) {
                <a
                  routerLink="/proposals"
                  class="text-xs underline underline-offset-2 hover:text-ink"
                  data-test="order-proposal-link"
                >
                  Открыть КП
                </a>
              } @else {
                <span class="text-xs text-muted-foreground" data-test="order-no-stub-proposal">
                  КП не обязателен. Нужен бланк — создайте КП в студии документов.
                </span>
              }
            </span>
          </app-pi-fact-card>
          <app-pi-fact-card
            label="Источник материалов"
            [value]="(o.materialsSource ?? 'own') === 'customer' ? 'Заказчика' : 'Наши'"
          >
            <span actions>
              <select
                class="pi-input py-1 text-xs"
                [value]="o.materialsSource ?? 'own'"
                (change)="onMaterialsSourceChange($event)"
                aria-label="Источник материалов"
              >
                <option value="own">Наши</option>
                <option value="customer">Заказчика</option>
              </select>
            </span>
          </app-pi-fact-card>
        </app-pi-fact-stack>
        @if (materialsWarning(); as warning) {
          <div
            class="border hairline border-sunrise-warm rounded-sm px-3 py-2 text-sm text-sunrise-warm"
            role="status"
            data-test="materials-warning"
          >
            {{ warning }}
          </div>
        }
      </header>

      @if (lineMetaRows().length > 0) {
        <section class="mb-5 space-y-1" data-test="order-line-meta">
          <p class="eyebrow m-0">Позиции</p>
          @for (row of lineMetaRows(); track row.key) {
            <p class="text-xs text-muted-foreground m-0">
              {{ row.title }}
              @if (row.owner) {
                <span> · Ответственный: {{ row.owner }}</span>
              }
              @if (row.ship) {
                <span> · Отгрузка: {{ row.ship }}</span>
              }
              <button
                type="button"
                class="ml-2 underline underline-offset-2 hover:text-ink"
                [disabled]="readyBusy() === row.index"
                (click)="toggleLineReady(row.index)"
                [attr.data-test]="'order-line-ready-' + row.index"
              >
                {{ row.ready ? 'Готово к работе' : 'Отметить готовым' }}
              </button>
            </p>
          }
        </section>
      }

      <section class="space-y-3" data-test="order-composition">
        <div class="flex items-baseline justify-between gap-3">
          <div>
            <h2 class="font-display text-base text-ink m-0">Состав</h2>
            <p class="text-[11px] text-muted-foreground m-0 mt-0.5">
              Кликни строку — выбрать и раскрыть · карандаш — изменить в каталоге
            </p>
          </div>
          <a routerLink="/orders" class="text-xs text-muted-foreground hover:text-ink underline"
            >← Список</a
          >
        </div>

        @if (treeLoading()) {
          <p class="text-sm text-muted-foreground py-6" data-test="order-tree-loading">
            Загрузка состава…
          </p>
        } @else if (!hasLines()) {
          <div class="pi-dashed-panel p-8 text-center" role="status" data-test="order-tree-empty">
            <p class="eyebrow text-sunrise-warm m-0 mb-1">00</p>
            <p class="text-sm text-muted-foreground m-0">В заказе нет изделий</p>
          </div>
        } @else {
          <div class="space-y-3 p-2 hairline rounded-sm bg-paper" data-test="order-tree-scroll">
            @for (root of lineRoots(); track trackRoot($index, root)) {
              <app-composition-tree
                [root]="root"
                [selectedId]="selectedId()"
                [showEdit]="true"
                ariaLabel="Состав изделия в заказе"
                (expandedChange)="onExpand($event)"
                (selectedChange)="onSelect($event)"
                (editClick)="onEdit($event)"
              />
            }
          </div>
        }
      </section>

      <div class="mt-6">
        <app-pi-button variant="ghost" size="sm" href="/orders">К списку заказов</app-pi-button>
      </div>
    }
  `,
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly orders = inject(OrdersService);
  private readonly catalog = inject(ProductModulesService);
  private readonly products = inject(ProductsService);
  private readonly materials = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly supply = inject(SupplyTaskService, { optional: true });
  private readonly toast = inject(PiToastService, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly order = signal<Order | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly lineRoots = signal<CompositionTreeNode[]>([]);
  protected readonly treeLoading = signal(false);
  protected readonly selectedId = signal<string | null>(null);
  private readonly requestedDepth = signal(ORDER_TREE_INITIAL_DEPTH);
  private loadSeq = 0;
  protected readonly readyBusy = signal<number | null>(null);
  private readonly catalogEditBusy = signal(false);

  protected readonly hasLines = computed(() => (this.order()?.items?.length ?? 0) > 0);
  protected readonly confirmedSupply = signal(false);
  protected readonly materialsWarning = computed(() => {
    const order = this.order();
    if (!order || (order.materialsSource ?? 'own') !== 'own') return null;
    return (order.items ?? []).some((item) => item.readyForWork) && !this.confirmedSupply()
      ? 'Материалы: наши. Для готовых линий нет подтверждённых задач снабжения — это мягкое предупреждение, не блокировка.'
      : null;
  });

  protected readonly partyLine = computed(() => {
    const o = this.order();
    if (!o) return null;
    const name = this.refName(o.counterpartyId);
    return name || null;
  });

  protected readonly siteLine = computed(() => {
    const o = this.order();
    if (!o) return null;
    return this.siteLabel(o.siteId);
  });

  /** MASTER-CORE (S38): прямой заказ живёт без КП; заглушка из UI не создаётся. */
  protected readonly proposalId = computed(() => this.refId(this.proposalRef()));

  protected readonly proposalLine = computed(() => {
    const proposal = this.proposalRef();
    if (!proposal) return 'Нет — прямой заказ';
    if (typeof proposal === 'string') return 'Есть';
    const number = (proposal.number ?? '').trim();
    const label = number ? `№${number}` : 'Есть';
    return proposal.isStub ? `${label} · черновик-заглушка` : label;
  });

  private readonly proposalRef = computed(() => this.order()?.quotationId ?? null);

  protected readonly lineMetaRows = computed(() => {
    const items = this.order()?.items ?? [];
    return items.map((it, index) => {
      const owner = this.ownerDisplay(it.ownerUserId);
      const ship = it.plannedShipDate ? formatDate(it.plannedShipDate) : '';
      const title =
        (it.productName ?? '').trim() ||
        (it.productId ? `Изделие ${it.productId.slice(0, 8)}…` : `Позиция ${index + 1}`);
      return {
        key: `${index}:${it.productId ?? 'x'}`,
        title,
        owner,
        ship,
        index,
        ready: Boolean(it.readyForWork),
      };
    });
  });

  /** TZ-UI-405 B-02: two-level crumbs («Раздел → номер»), no duplicate-route segment. */
  protected readonly crumbs = computed<PageCrumb[]>(() => {
    const o = this.order();
    return [{ label: 'Сделки', link: '/orders' }, { label: o ? `Заказ №${o.number}` : 'Заказ' }];
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id') ?? ''),
        switchMap((id) => {
          this.loadError.set(null);
          this.order.set(null);
          this.lineRoots.set([]);
          this.selectedId.set(null);
          this.requestedDepth.set(ORDER_TREE_INITIAL_DEPTH);
          if (!id) {
            this.loadError.set('Не указан идентификатор заказа.');
            return of(null);
          }
          return this.orders.findById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res == null) return;
        if (!res.ok) {
          this.loadError.set(extractErrorMessage(res.error));
          return;
        }
        this.order.set(res.data);
        this.loadConfirmedSupply(res.data._id);
        this.reloadForest(res.data);
      });
  }

  /** Unwrap populated ObjectId ref → id string. */
  protected refId(value: PopulatedRef | undefined | null): string {
    if (!value) return '';
    return typeof value === 'string' ? value : (value._id ?? '');
  }

  /** Unwrap populated counterparty/site → display name. */
  protected refName(value: PopulatedRef | undefined | null): string {
    if (!value || typeof value === 'string') return '';
    return (value.name ?? '').trim();
  }

  protected siteLabel(value: PopulatedRef | undefined | null): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value ? value : null;
    const name = (value.name ?? '').trim();
    const address = (value.address ?? '').trim();
    if (name && address) return `${name} · ${address}`;
    return name || address || null;
  }

  protected ownerDisplay(value: PopulatedOwner | undefined | null): string {
    if (!value) return '';
    if (typeof value === 'string') return '';
    return (value.displayName || value.fullName || value.username || '').trim();
  }

  protected statusLabel(status: Order['status']): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  protected statusBannerTone(status: Order['status']): PiStatusBannerTone | null {
    switch (status) {
      case 'draft':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'confirmed':
      case 'in_production':
      case 'ready':
        return 'info';
      case 'shipped':
      case 'delivered':
        return null;
      default:
        return null;
    }
  }

  protected statusBannerMessage(status: Order['status']): string {
    switch (status) {
      case 'draft':
        return 'Черновик — заказ ещё не подтверждён';
      case 'cancelled':
        return 'Заказ отменён';
      default:
        return this.statusLabel(status);
    }
  }

  protected formatOrderDate(date: string | undefined): string {
    return formatDate(date);
  }

  private loadConfirmedSupply(orderId: string): void {
    this.confirmedSupply.set(false);
    if (!this.supply) return;
    this.supply
      .list({ orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.confirmedSupply.set((res.data ?? []).some((task) => task.status === 'confirmed'));
        }
      });
  }

  protected onMaterialsSourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'own' | 'customer';
    const current = this.order();
    if (!current || !['own', 'customer'].includes(value)) return;
    this.orders
      .update(current._id, { materialsSource: value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.ok) {
          this.order.set(res.data);
        } else {
          this.toast?.error('Не удалось сохранить источник материалов');
        }
      });
  }

  protected toggleLineReady(index: number): void {
    const current = this.order();
    if (!current || this.readyBusy() !== null) return;
    const item = current.items?.[index];
    if (!item) return;
    this.readyBusy.set(index);
    this.orders
      .setLineReady(current._id, index, !item.readyForWork)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.readyBusy.set(null);
        if (res.ok) this.order.set(res.data);
      });
  }

  /** TZ-QA-445F: row = select/expand only; catalog edit only via pencil. */
  protected onSelect(ev: CompositionTreeSelectEvent): void {
    this.selectedId.set(ev.node._id);
  }

  protected onEdit(ev: CompositionTreeEditEvent): void {
    this.selectedId.set(ev.node._id);
    openCatalogEditFromTree(this.catalogEditDeps(), ev);
  }

  protected trackRoot(index: number, root: CompositionTreeNode): string {
    return `${index}:${root._id}`;
  }

  protected onExpand(ev: CompositionTreeExpandEvent): void {
    if (!ev.expanded) return;
    const depth = this.depthOf(ev.node);
    if (depth < 0) return;
    const need = Math.min(depth + 2, ORDER_TREE_MAX_DEPTH);
    if (need <= this.requestedDepth()) return;
    this.requestedDepth.set(need);
    const o = this.order();
    if (o) this.reloadForest(o);
  }

  private catalogEditDeps(): CatalogCompositionEditDeps {
    return {
      dialog: this.dialog,
      products: this.products,
      modules: this.catalog,
      materials: this.materials,
      toast: this.toast,
      injector: this.injector,
      destroyRef: this.destroyRef,
      busy: this.catalogEditBusy,
      onSaved: () => {
        const o = this.order();
        if (o) this.reloadForest(o);
      },
    };
  }

  private reloadForest(order: Order): void {
    const items = order.items ?? [];
    if (items.length === 0) {
      this.lineRoots.set([]);
      this.treeLoading.set(false);
      return;
    }
    const seq = ++this.loadSeq;
    const depth = this.requestedDepth();
    this.treeLoading.set(true);

    loadOrderCompositionForest(this.catalog, items, depth).subscribe((roots) => {
      if (seq !== this.loadSeq) return;
      this.treeLoading.set(false);
      this.lineRoots.set(roots);
    });
  }

  private depthOf(
    target: CompositionTreeNode,
    roots: CompositionTreeNode[] = this.lineRoots(),
  ): number {
    for (const root of roots) {
      const found = this.depthInTree(target, root, 0);
      if (found !== -1) return found;
    }
    return -1;
  }

  private depthInTree(
    target: CompositionTreeNode,
    node: CompositionTreeNode,
    depth: number,
  ): number {
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const found = this.depthInTree(target, child, depth + 1);
      if (found !== -1) return found;
    }
    return -1;
  }
}
