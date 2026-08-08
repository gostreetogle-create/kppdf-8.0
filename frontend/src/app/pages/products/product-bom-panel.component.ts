import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  CompositionLine,
  CompositionLineUpsertDto,
  CompositionTreeNode,
  ModuleCostPreview,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import { MaterialsService } from '../../shared/services/materials.service';
import { ProductsService } from '../../shared/services/products.service';
import { extractErrorMessage } from '../../core/silent-http';
import { PiToastService } from '../../shared/ui/toast';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import {
  CompositionTreeComponent,
  type CompositionTreeSelectEvent,
} from '../../shared/ui/composition/composition-tree.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import {
  ProductCompositionPickerDialogComponent,
  type ProductCompositionPickerResult,
} from './product-composition-picker-dialog.component';
import { catalogKindOklch } from '../../shared/ui/catalog/catalog-kind-oklch';
import { formatPrice } from '../../shared/util/format';

/** TZ-COST-303: read-only line contribution shown in BOM inspector. */
interface LineCostHint {
  loading: boolean;
  /** e.g. «1 200,00 ₽» or «—» */
  totalLabel: string;
  /** e.g. «цена × кол-во» */
  formula: string;
  error?: string;
}
@Component({
  selector: 'app-product-bom-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CompositionTreeComponent, RouterLink],
  template: `
    <section
      class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] gap-3 items-start"
      data-test="product-bom-panel"
    >
      <div class="hairline rounded-sm bg-paper min-w-0 overflow-hidden">
        <div
          class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 hairline-b bg-paper-2/50"
        >
          <div>
            <h2 class="font-display text-base tracking-tight m-0">Состав</h2>
            <p class="text-[11px] text-muted-foreground m-0">
              Кликни строку — выбрать и раскрыть · справа — действия
            </p>
          </div>
          @if (isComplex()) {
            <span
              class="inline-flex items-center px-2 py-0.5 text-[11px] hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
              data-test="composition-complex-badge"
              >Комплекс</span
            >
          }
        </div>

        @if (warning()) {
          <p class="px-3 py-2 text-xs text-sunrise-warm" role="status">{{ warning() }}</p>
        }
        @if (error()) {
          <p class="px-3 py-2 text-sm text-destructive" role="alert">{{ error() }}</p>
        }
        @if (loading()) {
          <p class="py-3 text-center text-xs text-muted-foreground">Обновление состава…</p>
        }

        <ul
          class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 hairline-b text-[11px] text-muted-foreground m-0 list-none"
          data-test="bom-kind-legend"
          aria-label="Легенда видов"
        >
          @for (item of kindLegend(); track item.label) {
            <li class="inline-flex items-center gap-1.5">
              <span
                class="inline-block w-2 h-2 rounded-full shrink-0"
                [style.background]="item.color"
                aria-hidden="true"
              ></span>
              <span>{{ item.label }}</span>
            </li>
          }
        </ul>

        <div class="p-2" data-test="bom-tree-scroll">
          <app-composition-tree
            [root]="tree()"
            [selectedId]="selectedNodeId()"
            (expandedChange)="onExpand($event)"
            (selectedChange)="onSelect($event)"
          />
        </div>
      </div>

      <aside
        class="hairline rounded-sm bg-paper p-3 space-y-3 lg:sticky lg:top-3"
        data-test="bom-inspector"
      >
        @if (selected(); as sel) {
          <div class="space-y-1">
            <p class="eyebrow m-0 flex items-center gap-2">
              <span
                class="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                [style.background]="inspectorAccent(sel.node)"
                aria-hidden="true"
                data-test="bom-inspector-kind-dot"
              ></span>
              Выбрано
            </p>
            <p class="font-medium text-sm m-0 break-words" data-test="bom-inspector-name">
              {{ sel.node.name }}
            </p>
            <p class="text-xs text-muted-foreground m-0">{{ kindLabel(sel.node) }}</p>
          </div>

          @if (sel.depth > 0) {
            <label class="block">
              <span class="eyebrow block mb-1">Количество</span>
              <input
                class="pi-input w-full"
                type="number"
                min="0.0001"
                [value]="sel.node.quantity"
                (change)="onQtyChange($event)"
                data-test="bom-inspector-qty"
              />
            </label>
          }

          @if (lineCostHint(); as hint) {
            <div
              class="hairline rounded-sm bg-paper-2 px-2.5 py-2 space-y-0.5"
              data-test="bom-line-cost"
            >
              <p class="eyebrow m-0">Вклад в себест.</p>
              @if (hint.loading) {
                <p class="text-xs text-muted-foreground m-0" data-test="bom-line-cost-loading">
                  Считаем…
                </p>
              } @else if (hint.error) {
                <p
                  class="text-xs text-destructive m-0"
                  role="alert"
                  data-test="bom-line-cost-error"
                >
                  {{ hint.error }}
                </p>
              } @else {
                <p
                  class="font-mono text-sm font-medium m-0 tabular-nums"
                  data-test="bom-line-cost-total"
                >
                  {{ hint.totalLabel }}
                </p>
                <p class="text-[11px] text-muted-foreground m-0" data-test="bom-line-cost-formula">
                  {{ hint.formula }}
                </p>
              }
            </div>
          }

          @if (canAddInto(sel.node)) {
            <div class="space-y-2">
              <p class="eyebrow m-0">Добавить внутрь</p>
              <p class="text-[11px] text-muted-foreground m-0">{{ addHint(sel.node) }}</p>
              <app-pi-button
                variant="default"
                size="sm"
                type="button"
                class="w-full"
                (click)="openAddPicker()"
                data-test="bom-add-into"
              >
                + Из каталога
              </app-pi-button>
            </div>
          } @else if (sel.node.kind === 'material') {
            <p class="text-xs text-muted-foreground m-0">
              Материал — конечный узел. Добавлять внутрь нельзя.
            </p>
          }

          <div class="flex flex-col gap-1.5 pt-1 hairline-t">
            @if (sel.node.kind === 'module') {
              <a
                [routerLink]="['/modules', sel.node._id]"
                class="text-xs text-ink hover:text-sunrise-warm underline decoration-dotted"
                data-test="bom-open-module"
                >Открыть карточку модуля</a
              >
            }
            @if (sel.node.kind === 'product' && sel.depth > 0) {
              <a
                [routerLink]="['/products', sel.node._id]"
                class="text-xs text-ink hover:text-sunrise-warm underline decoration-dotted"
                data-test="bom-open-product"
                >Открыть карточку изделия</a
              >
            }
            @if (sel.depth > 0) {
              <button
                type="button"
                class="text-left text-xs text-destructive hover:underline"
                (click)="removeSelected()"
                data-test="bom-remove"
              >
                Убрать из состава
              </button>
            }
          </div>
        } @else {
          <p class="eyebrow m-0">Инспектор</p>
          <p class="text-sm text-muted-foreground m-0">
            Выбери узел в дереве — здесь появятся добавление и количество.
          </p>
          <app-pi-button
            variant="default"
            size="sm"
            type="button"
            class="w-full"
            (click)="selectRootAndAdd()"
            data-test="bom-add-root"
          >
            {{ rootAddLabel() }}
          </app-pi-button>
        }

        <button
          type="button"
          class="text-xs text-muted-foreground hover:text-ink underline decoration-dotted"
          (click)="reload()"
          data-test="bom-reload"
        >
          Обновить дерево
        </button>
      </aside>
    </section>
  `,
})
export class ProductBomPanelComponent {
  /**
   * Root entity id. Kept as `productId` for product-detail consumers;
   * for module root pass the module id + rootKind="module" (TZ-CATALOG-336).
   */
  readonly productId = input.required<string>();
  /** TZ-CATALOG-336: product | module root for shared BOM panel. */
  readonly rootKind = input<'product' | 'module'>('product');
  readonly changed = output<void>();

  private readonly service = inject(ProductModulesService);
  private readonly materials = inject(MaterialsService);
  private readonly products = inject(ProductsService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly tree = signal<CompositionTreeNode | null>(null);
  protected readonly rootLines = signal<CompositionLine[]>([]);
  protected readonly loading = signal(false);
  protected readonly warning = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly selected = signal<CompositionTreeSelectEvent | null>(null);
  /** TZ-COST-303: material price×qty / module preview×qty (read-only). */
  protected readonly lineCostHint = signal<LineCostHint | null>(null);
  private lineCostSeq = 0;
  private readonly requestedDepth = signal(2);
  private readonly moduleLinesCache = signal(new Map<string, CompositionLine[]>());

  protected readonly isComplex = computed(
    () =>
      this.rootKind() === 'product' &&
      (this.tree()?.children ?? []).some((c) => c.kind === 'product'),
  );
  protected readonly selectedNodeId = computed(() => this.selected()?.node?._id ?? null);

  protected readonly rootAddLabel = computed(() =>
    this.rootKind() === 'module' ? '+ В корень модуля' : '+ В корень изделия',
  );

  /** Compact kind legend — colors = catalogKindOklch (not sketch hues). */
  protected readonly kindLegend = computed(() => {
    const items = [
      { label: 'Модуль', color: catalogKindOklch('module') },
      { label: 'Деталь/мат', color: catalogKindOklch('material', 'part') },
      { label: 'Сырьё', color: catalogKindOklch('material', 'raw') },
    ];
    if (this.rootKind() === 'product') {
      return [{ label: 'Изделие', color: catalogKindOklch('product') }, ...items];
    }
    return items;
  });

  constructor() {
    effect(() => {
      const id = this.productId();
      this.rootKind();
      if (!id) return;
      untracked(() => this.load());
    });
  }

  reload(): void {
    this.load();
  }

  protected onSelect(event: CompositionTreeSelectEvent): void {
    this.selected.set(event);
    if (event.node.kind === 'module') this.ensureModuleLines(event.node._id);
    if (event.parent?.kind === 'module') this.ensureModuleLines(event.parent._id);
    this.refreshLineCost(event);
  }

  protected onExpand(event: { node: CompositionTreeNode; expanded: boolean }): void {
    if (!event.expanded) return;
    const depth = this.depthOf(event.node);
    if (depth < 0) return;
    if (depth > 5) {
      this.warning.set('Глубина больше 5 уровней — проверьте структуру.');
    }
    const nextDepth = Math.min(8, Math.max(2, depth + 2));
    if (nextDepth > this.requestedDepth()) {
      this.requestedDepth.set(nextDepth);
      this.load();
    }
  }

  protected kindLabel(node: CompositionTreeNode): string {
    if (node.kind === 'product') return 'Изделие';
    if (node.kind === 'module') return 'Модуль';
    if (node.materialKind === 'part') return 'Деталь';
    if (node.materialKind === 'fastener') return 'Метиз';
    if (node.materialKind === 'purchased') return 'Покупное';
    if (node.materialKind === 'raw') return 'Сырьё';
    return 'Материал';
  }

  protected inspectorAccent(node: CompositionTreeNode): string {
    return catalogKindOklch(node.kind, node.materialKind);
  }

  protected canAddInto(node: CompositionTreeNode): boolean {
    if (this.rootKind() === 'module') return node.kind === 'module';
    return node.kind === 'product' || node.kind === 'module';
  }

  protected addHint(node: CompositionTreeNode): string {
    if (node.kind === 'product') {
      return 'Модуль, деталь/метиз/покупное или другое изделие (комплекс).';
    }
    return 'Дочерний модуль или материал (в т.ч. сырьё).';
  }

  protected selectRootAndAdd(): void {
    const root = this.tree();
    if (!root) return;
    this.selected.set({ node: root, parent: null, depth: 0 });
    this.openAddPicker();
  }

  protected openAddPicker(): void {
    const sel = this.selected();
    if (!sel || !this.canAddInto(sel.node)) return;
    const parentKind: 'product' | 'module' =
      sel.node.kind === 'module' || this.rootKind() === 'module' ? 'module' : 'product';
    const parentId = sel.node._id;
    const restrictToModule = parentKind === 'module' || this.rootKind() === 'module';

    const ref = this.dialog.open<ProductCompositionPickerResult | null>(
      ProductCompositionPickerDialogComponent,
      {
        data: {
          productId: parentKind === 'product' ? parentId : this.productId(),
          restrictToModule,
        },
        width: 'xl',
        parentDestroyRef: this.destroyRef,
      },
    );

    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      if (restrictToModule && result.lineType === 'product') {
        this.toast.error('Изделие нельзя добавить в состав модуля.');
        return;
      }
      const dto: CompositionLineUpsertDto =
        result.lineType === 'product'
          ? {
              lineType: 'product',
              refId: result.refId,
              quantity: 1,
              ...(result.unitPriceOverride != null
                ? { unitPriceOverride: result.unitPriceOverride }
                : {}),
            }
          : { lineType: result.lineType, refId: result.refId, quantity: 1 };

      const req =
        parentKind === 'product'
          ? this.service.addProductCompositionLine(parentId, dto)
          : this.service.addModuleCompositionLine(parentId, dto);

      req.subscribe((res) => {
        if (res.ok) {
          this.toast.success('Добавлено в состав');
          this.moduleLinesCache.set(new Map());
          this.load();
          this.changed.emit();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected onQtyChange(event: Event): void {
    const sel = this.selected();
    if (!sel || sel.depth === 0 || !sel.parent) return;
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.toast.error('Количество должно быть положительным.');
      return;
    }
    this.withLine(sel, (line, parent) => {
      const req =
        parent.kind === 'product'
          ? this.service.updateProductCompositionLine(parent._id, line._id, { quantity })
          : this.service.updateModuleCompositionLine(parent._id, line._id, { quantity });
      req.subscribe((res) => {
        if (res.ok) {
          this.load();
          this.changed.emit();
        } else this.toast.error(extractErrorMessage(res.error));
      });
    });
  }

  protected removeSelected(): void {
    const sel = this.selected();
    if (!sel || sel.depth === 0 || !sel.parent) return;
    this.withLine(sel, (line, parent) => {
      const req =
        parent.kind === 'product'
          ? this.service.removeProductCompositionLine(parent._id, line._id)
          : this.service.removeModuleCompositionLine(parent._id, line._id);
      req.subscribe((res) => {
        if (res.ok) {
          this.selected.set(null);
          this.lineCostHint.set(null);
          this.moduleLinesCache.set(new Map());
          this.load();
          this.changed.emit();
          this.toast.success('Убрано из состава');
        } else this.toast.error(extractErrorMessage(res.error));
      });
    });
  }

  private withLine(
    sel: CompositionTreeSelectEvent,
    run: (line: CompositionLine, parent: CompositionTreeNode) => void,
  ): void {
    const parent = sel.parent;
    if (!parent) return;
    const apply = (lines: CompositionLine[]): void => {
      const wantType =
        sel.node.kind === 'product'
          ? 'product'
          : sel.node.kind === 'module'
            ? 'module'
            : 'material';
      const line = lines.find((l) => l.refId === sel.node._id && l.lineType === wantType);
      if (!line) {
        this.toast.error('Не найдена строка состава.');
        return;
      }
      run(line, parent);
    };

    if (parent.kind === 'product') {
      apply(this.rootLines());
      return;
    }
    const cached = this.moduleLinesCache().get(parent._id);
    if (cached) {
      apply(cached);
      return;
    }
    this.service.getModuleComposition(parent._id).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        return;
      }
      const next = new Map(this.moduleLinesCache());
      next.set(parent._id, res.data);
      this.moduleLinesCache.set(next);
      apply(res.data);
    });
  }

  private ensureModuleLines(moduleId: string): void {
    if (this.moduleLinesCache().has(moduleId)) return;
    this.service.getModuleComposition(moduleId).subscribe((res) => {
      if (!res.ok) return;
      const next = new Map(this.moduleLinesCache());
      next.set(moduleId, res.data);
      this.moduleLinesCache.set(next);
    });
  }

  /**
   * TZ-COST-303/305: read-only contribution of the selected BOM line.
   * material → pricePerUnit × qty; module → cost-preview.totalCost × qty;
   * nested product → unitPriceOverride×qty else child.costPrice×qty.
   * Root product: no hint (passport cost).
   */
  private refreshLineCost(sel: CompositionTreeSelectEvent | null): void {
    const seq = ++this.lineCostSeq;
    if (!sel || sel.depth === 0) {
      this.lineCostHint.set(null);
      return;
    }

    const qty = sel.node.quantity;
    this.lineCostHint.set({
      loading: true,
      totalLabel: '—',
      formula: '',
    });

    if (sel.node.kind === 'product') {
      this.resolveProductLineCost(sel, qty, seq);
      return;
    }

    if (sel.node.kind === 'material') {
      this.materials
        .findById(sel.node._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (seq !== this.lineCostSeq) return;
          if (!res.ok) {
            this.lineCostHint.set({
              loading: false,
              totalLabel: '—',
              formula: '',
              error: extractErrorMessage(res.error),
            });
            return;
          }
          const unit = res.data.pricePerUnit ?? 0;
          const total = unit * qty;
          this.lineCostHint.set({
            loading: false,
            totalLabel: formatPrice(total) || '—',
            formula: `${formatPrice(unit) || '0.00 ₽'} × ${qty}`,
          });
        });
      return;
    }

    if (sel.node.kind === 'module') {
      this.service
        .getCostPreview(sel.node._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (seq !== this.lineCostSeq) return;
          if (!res.ok) {
            this.lineCostHint.set({
              loading: false,
              totalLabel: '—',
              formula: '',
              error: extractErrorMessage(res.error),
            });
            return;
          }
          const preview: ModuleCostPreview = res.data;
          const unit = preview.totalCost ?? 0;
          const total = unit * qty;
          this.lineCostHint.set({
            loading: false,
            totalLabel: formatPrice(total) || '—',
            formula: `расчёт ${formatPrice(unit) || '0.00 ₽'} × ${qty}`,
          });
        });
    }
  }

  /** TZ-COST-305 D1=b — inspector hint for product-in-product line. */
  private resolveProductLineCost(sel: CompositionTreeSelectEvent, qty: number, seq: number): void {
    const finishOverrideOrFetch = (override: number | undefined): void => {
      if (seq !== this.lineCostSeq) return;
      if (override != null && Number.isFinite(override)) {
        this.lineCostHint.set({
          loading: false,
          totalLabel: formatPrice(override * qty) || '—',
          formula: `цена в составе ${formatPrice(override) || '0.00 ₽'} × ${qty}`,
        });
        return;
      }
      this.products
        .findById(sel.node._id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
          if (seq !== this.lineCostSeq) return;
          if (!res.ok) {
            this.lineCostHint.set({
              loading: false,
              totalLabel: '—',
              formula: '',
              error: extractErrorMessage(res.error),
            });
            return;
          }
          const cost = res.data.costPrice;
          if (cost != null && Number.isFinite(cost)) {
            this.lineCostHint.set({
              loading: false,
              totalLabel: formatPrice(cost * qty) || '—',
              formula: `себест. ребёнка ${formatPrice(cost) || '0.00 ₽'} × ${qty}`,
            });
            return;
          }
          this.lineCostHint.set({
            loading: false,
            totalLabel: formatPrice(0) || '0.00 ₽',
            formula: 'нет цены в составе и нет себест. ребёнка',
          });
        });
    };

    const fromLines = (lines: CompositionLine[]): void => {
      const line = lines.find((l) => l.refId === sel.node._id && l.lineType === 'product');
      const override =
        line && 'unitPriceOverride' in line && line.unitPriceOverride != null
          ? line.unitPriceOverride
          : undefined;
      finishOverrideOrFetch(override);
    };

    const parent = sel.parent;
    if (!parent) {
      finishOverrideOrFetch(undefined);
      return;
    }
    if (parent.kind === 'product') {
      fromLines(this.rootLines());
      return;
    }
    const cached = this.moduleLinesCache().get(parent._id);
    if (cached) {
      fromLines(cached);
      return;
    }
    this.service.getModuleComposition(parent._id).subscribe((res) => {
      if (seq !== this.lineCostSeq) return;
      if (!res.ok) {
        finishOverrideOrFetch(undefined);
        return;
      }
      const next = new Map(this.moduleLinesCache());
      next.set(parent._id, res.data);
      this.moduleLinesCache.set(next);
      fromLines(res.data);
    });
  }

  private load(): void {
    const id = this.productId();
    const kind = this.rootKind();
    this.loading.set(true);
    this.error.set(null);
    let treeDone = false;
    let lineDone = false;
    const finish = (): void => {
      if (treeDone && lineDone) this.loading.set(false);
    };
    const tree$ =
      kind === 'module'
        ? this.service.getModuleTree(id, this.requestedDepth())
        : this.service.getProductTree(id, this.requestedDepth());
    const lines$ =
      kind === 'module'
        ? this.service.getModuleComposition(id)
        : this.service.getProductComposition(id);

    tree$.subscribe((res) => {
      treeDone = true;
      if (res.ok) {
        this.tree.set(res.data);
        const prevId = this.selected()?.node?._id;
        let nextSel: CompositionTreeSelectEvent;
        if (prevId) {
          const restored = this.findSelectEvent(res.data, prevId);
          nextSel = restored ?? { node: res.data, parent: null, depth: 0 };
        } else {
          nextSel = { node: res.data, parent: null, depth: 0 };
        }
        this.selected.set(nextSel);
        this.refreshLineCost(nextSel);
        if (kind === 'module') this.ensureModuleLines(id);
      } else {
        this.tree.set(null);
        this.error.set(extractErrorMessage(res.error));
        this.lineCostHint.set(null);
      }
      finish();
    });
    lines$.subscribe((res) => {
      lineDone = true;
      if (res.ok) {
        this.rootLines.set(res.data);
        if (kind === 'module') {
          const next = new Map(this.moduleLinesCache());
          next.set(id, res.data);
          this.moduleLinesCache.set(next);
        }
      } else this.rootLines.set([]);
      finish();
    });
  }

  private findSelectEvent(
    root: CompositionTreeNode,
    id: string,
    parent: CompositionTreeNode | null = null,
    depth = 0,
  ): CompositionTreeSelectEvent | null {
    if (root._id === id) return { node: root, parent, depth };
    for (const child of root.children) {
      const found = this.findSelectEvent(child, id, root, depth + 1);
      if (found) return found;
    }
    return null;
  }

  private depthOf(target: CompositionTreeNode, node = this.tree(), depth = 0): number {
    if (!node) return -1;
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const r = this.depthOf(target, child, depth + 1);
      if (r !== -1) return r;
    }
    return -1;
  }
}
