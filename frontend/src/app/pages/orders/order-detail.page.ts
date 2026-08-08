import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
  CompositionTreeComponent,
  type CompositionTreeExpandEvent,
  type CompositionTreeSelectEvent,
} from '../../shared/ui/composition/composition-tree.component';
import {
  CompositionTreeNode,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { extractErrorMessage } from '../../core/silent-http';
import { formatDate } from '../../shared/util/format';
import { Order, OrderItem, OrdersService } from './orders.service';

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const MAX_TREE_DEPTH = 8;
const INITIAL_TREE_DEPTH = 2;

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
  imports: [RouterLink, PiPageChromeComponent, ButtonComponent, CompositionTreeComponent],
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
      <header class="mb-5 space-y-1" data-test="order-detail-header">
        <p class="eyebrow m-0">заказ</p>
        <h1
          class="font-display text-xl sm:text-2xl tracking-tight text-ink leading-snug m-0"
          data-test="order-detail-title"
        >
          Заказ №{{ o.number }}
        </h1>
        <p class="text-xs text-muted-foreground m-0" data-test="order-detail-meta">
          {{ statusLabel(o.status) }}
          @if (formatOrderDate(o.date); as d) {
            <span> · {{ d }}</span>
          }
        </p>
        @if (partyLine(); as party) {
          <p class="text-sm text-ink m-0 pt-1" data-test="order-detail-party">
            <span class="text-muted-foreground">Заказчик:</span> {{ party }}
          </p>
        }
        @if (siteLine(); as site) {
          <p class="text-sm text-ink m-0" data-test="order-detail-site">
            <span class="text-muted-foreground">Объект:</span> {{ site }}
          </p>
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
            </p>
          }
        </section>
      }

      <section class="space-y-3" data-test="order-composition">
        <div class="flex items-baseline justify-between gap-3">
          <h2 class="font-display text-base text-ink m-0">Состав</h2>
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
                ariaLabel="Состав изделия в заказе"
                (expandedChange)="onExpand($event)"
                (selectedChange)="onSelect($event)"
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly order = signal<Order | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly lineRoots = signal<CompositionTreeNode[]>([]);
  protected readonly treeLoading = signal(false);
  protected readonly selectedId = signal<string | null>(null);
  private readonly requestedDepth = signal(INITIAL_TREE_DEPTH);
  private loadSeq = 0;

  protected readonly hasLines = computed(() => (this.order()?.items?.length ?? 0) > 0);

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

  protected readonly lineMetaRows = computed(() => {
    const items = this.order()?.items ?? [];
    return items
      .map((it, index) => {
        const owner = this.ownerDisplay(it.ownerUserId);
        const ship = it.plannedShipDate ? formatDate(it.plannedShipDate) : '';
        if (!owner && !ship) return null;
        const title =
          (it.productName ?? '').trim() ||
          (it.productId ? `Изделие ${it.productId.slice(0, 8)}…` : `Позиция ${index + 1}`);
        return {
          key: `${index}:${it.productId ?? 'x'}`,
          title,
          owner,
          ship,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
  });

  protected readonly crumbs = computed<PageCrumb[]>(() => {
    const o = this.order();
    return [
      { label: 'Сделки', link: '/orders' },
      { label: 'Заказы', link: '/orders' },
      { label: o ? `Заказ №${o.number}` : 'Заказ' },
    ];
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
          this.requestedDepth.set(INITIAL_TREE_DEPTH);
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

  protected formatOrderDate(date: string | undefined): string {
    return formatDate(date);
  }

  protected onSelect(ev: CompositionTreeSelectEvent): void {
    this.selectedId.set(ev.node._id);
  }

  protected trackRoot(index: number, root: CompositionTreeNode): string {
    return `${index}:${root._id}`;
  }

  protected onExpand(ev: CompositionTreeExpandEvent): void {
    if (!ev.expanded) return;
    const depth = this.depthOf(ev.node);
    if (depth < 0) return;
    const need = Math.min(depth + 2, MAX_TREE_DEPTH);
    if (need <= this.requestedDepth()) return;
    this.requestedDepth.set(need);
    const o = this.order();
    if (o) this.reloadForest(o);
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

    const loads = items.map((item, index) => this.loadLineRoot(item, index, depth));
    forkJoin(loads).subscribe((roots) => {
      if (seq !== this.loadSeq) return;
      this.treeLoading.set(false);
      this.lineRoots.set(roots);
    });
  }

  private loadLineRoot(item: OrderItem, index: number, depth: number) {
    const productId = (item.productId ?? '').trim();
    const snapshotName = (item.productName ?? '').trim();
    const qty = item.quantity > 0 ? item.quantity : 1;
    const fallbackId = `line:${index}:${productId || 'missing'}`;

    if (!productId) {
      return of({
        _id: fallbackId,
        name: snapshotName || 'Изделие без ссылки на каталог',
        kind: 'product' as const,
        quantity: qty,
        unit: item.unit,
        children: [] as CompositionTreeNode[],
      });
    }

    return this.catalog.getProductTree(productId, depth).pipe(
      map((res) => {
        if (!res.ok) {
          return {
            _id: productId,
            name: snapshotName
              ? `${snapshotName} — не найдено в каталоге`
              : 'Изделие не найдено в каталоге',
            kind: 'product' as const,
            quantity: qty,
            unit: item.unit,
            children: [] as CompositionTreeNode[],
          };
        }
        const tree = res.data;
        return {
          ...tree,
          name: snapshotName || tree.name,
          quantity: qty,
          unit: item.unit ?? tree.unit,
        };
      }),
    );
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
