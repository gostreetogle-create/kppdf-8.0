import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
import { AccordionComponent } from '../../shared/ui/pi-accordion.component';
import { AccordionItemComponent } from '../../shared/ui/pi-accordion-item.component';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  CompositionLine,
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import {
  CostCalculation,
  CostCalculationsService,
} from '../../shared/services/pi-cost-calculations.service';
import {
  Material,
  MATERIAL_KIND_LABELS,
  MaterialsService,
} from '../../shared/services/materials.service';
import { CostCalculationDetailDialogComponent } from './cost-calculation-detail-dialog.component';
import { Photo } from '../../shared/services/photos.service';
import { ProductBomPanelComponent } from './product-bom-panel.component';
import { ProductKind, ProductStatus } from '../../shared/services/products.service';

const STATUS_LABELS: Record<ProductStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архив',
  draft: 'Черновик',
};

const KIND_LABELS: Record<ProductKind, string> = {
  good: 'Товар',
  service: 'Услуга',
  work: 'Работа',
};

/**
 * TZ-83 Phase D + TZ-CATALOG-317: ProductDetailPage.
 *
 * Структура:
 *   I.   Основное       — name, sku, kind, status, цены, описание
 *   II.  Габариты и вес — dimensions, weightKg, ralCode
 *   III. Фотогалерея    — галерея из product.photoIds[]
 *   IV.  Модули ⭐      — таблица модулей в составе (dual-read:
 *                        непустой `composition` → строки состава,
 *                        иначе legacy `productModuleIds`);
 *                        кнопки «+ Модуль» (picker) и «Убрать»
 *
 * Writes идут через composition API (TZ-CATALOG-302/317):
 *   POST   /products/:id/composition  { lineType:'module', refId, quantity }
 *   DELETE /products/:id/composition/:lineId
 * Legacy attach/detach (/products/:id/modules) deprecated → throw.
 */
@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PiEmptyStateComponent,
    ButtonComponent,
    ProductBomPanelComponent,
    AccordionComponent,
    AccordionItemComponent,
    PiPageChromeComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" data-test="product-detail-nav" />

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ loadError() }}
      </div>
      <div class="py-8 text-center text-muted-foreground text-sm">
        Товар не найден.
        <a routerLink="/products" class="block mt-2 text-ink hover:text-sunrise-warm underline"
          >← К каталогу</a
        >
      </div>
    }

    @if (product(); as p) {
      <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] gap-5 items-start"
        data-test="product-detail-layout"
      >
        <!-- Левая колонка: карточка товара -->
        <section
          class="hairline rounded-sm bg-paper overflow-hidden xl:sticky xl:top-3"
          data-test="product-hero"
        >
          <div
            class="bg-paper-2 flex items-center justify-center aspect-[4/3] max-h-52"
            data-test="product-hero-photo"
          >
            @if (mainPhotos()[0]; as cover) {
              <img
                [src]="cover.storageUrl"
                [alt]="cover.originalFilename ?? p.name"
                class="block w-full h-full object-cover"
                loading="lazy"
              />
            } @else {
              <span class="text-xs text-muted-foreground px-3 text-center">Нет фото</span>
            }
          </div>
          <div class="p-4 space-y-3">
            <div class="space-y-1.5">
              <p class="eyebrow m-0">товар</p>
              <h1
                class="font-display text-lg sm:text-xl tracking-tight text-ink leading-snug break-words"
                data-test="product-title"
              >
                {{ p.name }}
              </h1>
              <p class="text-xs text-muted-foreground font-mono m-0">
                {{ p.sku ? 'SKU ' + p.sku : 'без SKU' }}
                · {{ kindLabel(p.kind) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5">
              @if (isComplex()) {
                <span
                  class="inline-flex items-center px-2 py-0.5 text-[11px] hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
                  data-test="complex-badge"
                  >Комплекс</span
                >
              }
              <span
                class="inline-flex items-center px-2 py-0.5 text-[11px] hairline rounded-sm"
                [class.bg-sunrise-warm/10]="p.isActive"
                [class.text-sunrise-warm]="p.isActive"
                [class.text-muted-foreground]="!p.isActive"
                data-test="product-active-badge"
              >
                {{ p.isActive ? 'Активен' : 'Неактивен' }}
              </span>
              @if (p.status) {
                <span
                  class="inline-flex items-center px-2 py-0.5 text-[11px] hairline rounded-sm text-muted-foreground"
                  data-test="product-status-badge"
                  >{{ statusLabel(p.status) }}</span
                >
              }
            </div>

            <dl class="grid grid-cols-2 gap-2 text-sm" data-test="product-hero-prices">
              <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                <dt class="eyebrow truncate">Прайс</dt>
                <dd
                  class="font-mono font-medium text-sm truncate empty-cell"
                  data-test="product-list-price"
                >
                  {{ p.listPrice != null ? formatRuble(p.listPrice) : '—' }}
                </dd>
              </div>
              <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                <dt class="eyebrow truncate">Себест.</dt>
                <dd class="font-mono text-sm truncate empty-cell" data-test="product-cost-price">
                  {{ p.costPrice != null ? formatRuble(p.costPrice) : '—' }}
                </dd>
              </div>
              <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                <dt class="eyebrow truncate">База</dt>
                <dd class="font-mono text-sm truncate empty-cell">
                  {{ p.basePrice != null ? formatRuble(p.basePrice) : '—' }}
                </dd>
              </div>
              <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                <dt class="eyebrow truncate">В составе</dt>
                <dd class="font-mono font-medium text-sm" data-test="product-module-count">
                  {{ compositionSummary() }}
                </dd>
              </div>
            </dl>

            <dl
              class="flex flex-col gap-1 text-xs text-muted-foreground"
              data-test="product-hero-dims"
            >
              <div class="flex justify-between gap-2">
                <span class="eyebrow shrink-0">Д×Ш×В</span>
                <span class="font-mono text-ink text-right empty-cell">{{
                  dimensionsLabel(p)
                }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="eyebrow shrink-0">Вес</span>
                <span class="font-mono text-ink text-right empty-cell">{{
                  p.weightKg != null ? p.weightKg + ' кг' : '—'
                }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="eyebrow shrink-0">RAL</span>
                <span class="font-mono text-ink text-right empty-cell">{{ p.ralCode ?? '—' }}</span>
              </div>
            </dl>
          </div>
        </section>

        <!-- Правая колонка: состав (BOM) + вторичные блоки -->
        <div class="min-w-0 space-y-4">
          <app-product-bom-panel
            [productId]="p._id"
            (changed)="onBomChanged()"
            data-test="product-composition-panel"
          />

          <app-pi-accordion [multi]="true" data-test="product-cascade">
            <app-pi-accordion-item
              title="Фото"
              index="01"
              [meta]="photoMeta()"
              [expanded]="openPhotos()"
              (expandedChange)="openPhotos.set($event)"
            >
              <div class="flex flex-wrap gap-3" data-test="product-photo-gallery">
                @for (ph of mainPhotos(); track ph._id) {
                  <figure class="m-0">
                    <img
                      [src]="ph.storageUrl"
                      [alt]="ph.originalFilename ?? 'фото'"
                      class="block w-36 h-36 object-cover hairline rounded-sm bg-paper-2"
                      loading="lazy"
                    />
                  </figure>
                } @empty {
                  <p class="text-sm text-muted-foreground">Нет фото у этого товара.</p>
                }
              </div>
            </app-pi-accordion-item>

            <app-pi-accordion-item
              title="Себестоимость"
              index="02"
              [meta]="costMeta()"
              [expanded]="openCost()"
              (expandedChange)="openCost.set($event)"
            >
              <div class="flex justify-end mb-3">
                <app-pi-button
                  variant="default"
                  type="button"
                  (click)="recalculate()"
                  [disabled]="recalculating()"
                  data-test="recalculate-button"
                >
                  {{ recalculating() ? 'Расчёт…' : 'Пересчитать' }}
                </app-pi-button>
              </div>

              @if (costList().length > 0) {
                <div class="hairline rounded-sm overflow-x-auto">
                  <table class="w-full text-sm min-w-[640px]">
                    <thead class="hairline-b">
                      <tr>
                        <th class="pi-cell eyebrow text-left">Дата</th>
                        <th class="pi-cell-numeric eyebrow w-32">Материалы</th>
                        <th class="pi-cell-numeric eyebrow w-32">Работы</th>
                        <th class="pi-cell-numeric eyebrow w-32">Накладные</th>
                        <th class="pi-cell-numeric eyebrow w-40">Итого</th>
                        <th class="pi-cell eyebrow w-24">Статус</th>
                        <th class="pi-cell eyebrow w-32 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (cc of costList(); track cc._id) {
                        <tr
                          class="pi-table-row pi-table-row-odd last:border-0"
                          [class.bg-sunrise-warm/10]="cc.isActive"
                        >
                          <td class="pi-cell align-top">
                            {{ formatDate(cc.calculatedAt || cc.createdAt) }}
                          </td>
                          <td class="pi-cell-numeric align-top font-mono">
                            {{ formatRuble(cc.totalMaterialCost) }}
                          </td>
                          <td class="pi-cell-numeric align-top font-mono">
                            {{ formatRuble(cc.totalLaborCost) }}
                          </td>
                          <td class="pi-cell-numeric align-top font-mono text-muted-foreground">
                            {{ cc.overheadPercent }}% → {{ formatRuble(cc.overheadCost) }}
                          </td>
                          <td class="pi-cell-numeric align-top font-mono font-medium">
                            {{ formatRuble(cc.totalCost) }}
                          </td>
                          <td class="pi-cell align-top">
                            @if (cc.isActive) {
                              <span
                                class="inline-flex items-center gap-1 text-xs font-medium text-sunrise-warm"
                                >● Активен</span
                              >
                            } @else {
                              <span class="text-xs text-muted-foreground">—</span>
                            }
                          </td>
                          <td class="pi-cell align-top text-right">
                            <button
                              type="button"
                              (click)="openBreakdown(cc)"
                              class="eyebrow text-ink hover:text-sunrise-warm mr-3"
                            >
                              Детали
                            </button>
                            @if (!cc.isActive) {
                              <button
                                type="button"
                                (click)="activateSnapshot(cc)"
                                class="eyebrow text-muted-foreground hover:text-ink mr-3"
                              >
                                Активировать
                              </button>
                            }
                            <button
                              type="button"
                              (click)="onDeleteCalc(cc)"
                              class="eyebrow text-destructive hover:underline"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <app-pi-empty-state
                  [colspan]="7"
                  message="Нет расчётов себестоимости. Нажмите «Пересчитать»."
                  state="empty"
                />
              }
            </app-pi-accordion-item>
          </app-pi-accordion>
        </div>
      </div>
    }
  `,
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly costSvc = inject(CostCalculationsService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly id = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly idString = computed<string>(() => this.id().get('id') ?? '');

  /**
   * Используем GET /products/:id — backend уже populate categoryId,
   * photoIds[], и productModuleIds[] (top-level). Nested populate
   * workTypes.workTypeId + materials.materialId НЕ пробрасывается
   * для productModuleIds в findById — это оптимизация по запросу.
   * Для Materials/Работ counts используем .length на attached Modules.
   */
  protected readonly productRes = httpResource<{
    _id: string;
    name: string;
    sku?: string;
    kind?: string;
    status?: string;
    listPrice?: number;
    basePrice?: number;
    costPrice?: number;
    isActive: boolean;
    dimensions?: { length?: number; width?: number; height?: number; unit?: string };
    weightKg?: number;
    ralCode?: string;
    photoIds?: Array<string | Photo>;
    productModuleIds?: ProductModule[];
    composition?: CompositionLine[];
  }>(() => ({
    url: `${this.baseUrl}/products/${this.idString()}`,
  }));

  protected readonly product = computed(() => this.productRes.value() ?? null);
  protected readonly loadError = computed<string | null>(() => {
    const err = this.productRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  /** Cascade accordion: фото/себестоимость свёрнуты; состав всегда на виду. */
  protected readonly openPhotos = signal(false);
  protected readonly openCost = signal(false);

  protected readonly detailCrumbs = computed<PageCrumb[]>(() => [
    { label: 'Каталог', link: '/products' },
    { label: this.product()?.name ?? 'Товар' },
  ]);

  protected readonly photoMeta = computed(() => {
    const n = this.mainPhotos().length;
    return n ? `${n}` : 'нет';
  });

  protected compositionSummary(): string {
    const n = this.compositionLines().length || this.attachedModules().length;
    return n ? String(n) : '0';
  }

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status as ProductStatus] ?? status;
  }

  protected kindLabel(kind?: string): string {
    if (!kind) return '—';
    return KIND_LABELS[kind as ProductKind] ?? kind;
  }

  protected dimensionsLabel(p: {
    dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  }): string {
    const d = p.dimensions;
    if (!d || (d.length == null && d.width == null && d.height == null)) return '—';
    const unit = d.unit ? ` ${d.unit}` : '';
    return `${d.length ?? '—'}×${d.width ?? '—'}×${d.height ?? '—'}${unit}`;
  }

  protected readonly mainPhotos = computed<Photo[]>(() => {
    const p = this.product();
    if (!p?.photoIds) return [];
    return p.photoIds.filter((id): id is Photo => typeof id !== 'string');
  });

  /** Каталог модулей — для резолва имён composition-линий (refId → module). */
  protected readonly moduleCatalog = signal<ProductModule[]>([]);

  /**
   * Dual-read список модулей в составе (TZ-CATALOG-317):
   *  - непустой `product.composition` (lineType=module) → резолвим refId
   *    через каталог модулей (линии без каталога скрываем — нет имени);
   *  - иначе legacy `productModuleIds` (populated объекты).
   * Строки содержат module + (если из состава) lineId и quantity.
   */
  protected readonly isComplex = computed(() =>
    (this.product()?.composition ?? []).some((line) => line.lineType === 'product'),
  );

  protected readonly compositionLines = computed(() => this.product()?.composition ?? []);
  protected readonly materialCatalog = signal<Material[]>([]);

  protected readonly attachedModules = computed<
    { module: ProductModule; lineId?: string; quantity: number }[]
  >(() => {
    const p = this.product();
    if (!p) return [];
    const moduleLines = (p.composition ?? []).filter((l) => l.lineType === 'module');
    if (moduleLines.length > 0) {
      const byId = new Map(this.moduleCatalog().map((m) => [m._id, m]));
      return moduleLines
        .map((l) => {
          const module = byId.get(l.refId);
          return module ? { module, lineId: l._id, quantity: l.quantity ?? 1 } : null;
        })
        .filter((r): r is { module: ProductModule; lineId: string; quantity: number } => r != null);
    }
    return (p.productModuleIds ?? [])
      .filter((m): m is ProductModule => typeof m === 'object' && m !== null && '_id' in m)
      .map((module) => ({ module, quantity: 1 }));
  });

  /** Карта lineId по moduleId для удаления линии состава. */
  private readonly compositionLineByModule = computed<Map<string, string>>(() => {
    const p = this.product();
    const lines = p?.composition ?? [];
    const map = new Map<string, string>();
    lines.forEach((l) => {
      if (l.lineType === 'module') map.set(l.refId, l._id);
    });
    return map;
  });

  protected readonly costRes = httpResource<CostCalculation[]>(() => ({
    url: `${this.baseUrl}/products/${this.idString()}/cost-calculations`,
  }));

  constructor() {
    this.loadModuleCatalog();
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialCatalog.set(res.data.items);
    });
  }

  private loadModuleCatalog(): void {
    this.modulesSvc.list().subscribe((res) => {
      if (res.ok) this.moduleCatalog.set(res.data);
    });
  }
  protected readonly costList = computed<CostCalculation[]>(() => this.costRes.value() ?? []);
  protected readonly costMeta = computed(() => {
    const n = this.costList().length;
    return n ? `${n}` : 'нет';
  });
  protected readonly recalculating = signal<boolean>(false);

  protected onBack(): void {
    this.router.navigate(['/products']);
  }

  protected materialKindLabel(kind: Material['materialKind']): string {
    return kind ? (MATERIAL_KIND_LABELS[kind] ?? kind) : 'тип не указан';
  }

  protected productLinePrice(line: CompositionLine): number | string {
    return line.lineType === 'product' ? (line.unitPriceOverride ?? '—') : '—';
  }

  protected compositionRefLabel(line: CompositionLine): string {
    if (line.lineType !== 'material')
      return line.lineType === 'product' ? `Изделие · ${line.refId}` : `Модуль · ${line.refId}`;
    const material = this.materialCatalog().find((item) => item._id === line.refId);
    return material
      ? `${material.name} · ${this.materialKindLabel(material.materialKind)}`
      : `Материал · ${line.refId} · тип не указан`;
  }

  protected onBomChanged(): void {
    this.productRes.reload();
  }

  protected openModuleDetail(m: ProductModule): void {
    this.router.navigate(['/modules', m._id]);
  }

  // ── TZ-85 Phase C: Себестоимость ──────────────────────────────────────

  protected recalculate(): void {
    const pid = this.idString();
    if (!pid || this.recalculating()) return;
    this.recalculating.set(true);
    this.costSvc.create(pid).subscribe((res) => {
      this.recalculating.set(false);
      if (res.ok) {
        this.toast.success('Себестоимость рассчитана');
        this.costRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected openBreakdown(cc: CostCalculation): void {
    this.dialog.open(CostCalculationDetailDialogComponent, {
      data: { costCalculation: cc },
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
  }

  protected activateSnapshot(cc: CostCalculation): void {
    this.costSvc.activate(cc._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Снимок активирован');
        this.costRes.reload();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected onDeleteCalc(cc: CostCalculation): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить расчёт?',
        description: `Удалить расчёт от ${this.formatDate(cc.calculatedAt || cc.createdAt)}? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.costSvc.remove(cc._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Расчёт удалён');
          this.costRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected formatRuble(amount: number): string {
    return amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  }
}
