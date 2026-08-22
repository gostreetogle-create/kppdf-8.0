import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Material, MaterialsService } from '../../shared/services/materials.service';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';
import { CostCalculationDetailDialogComponent } from './cost-calculation-detail-dialog.component';
import { Photo } from '../../shared/services/photos.service';
import { ProductBomPanelComponent } from '../../shared/ui/composition/product-bom-panel.component';
import { PiPhotoLightboxComponent } from '../../shared/ui/photo';
import { ProductFormDialogComponent } from './product-form-dialog.component';
import { Product, ProductStatus } from '../../shared/services/products.service';
import { PiFactCardComponent, PiFactStackComponent } from '../../shared/ui/fact-card';
import { CatalogReturnStore, catalogBackLabel } from '../../shared/navigation/catalog-return.util';

const STATUS_LABELS: Record<ProductStatus, string> = {
  new: 'Новый',
  active: 'Активный',
  archived: 'Архив',
  draft: 'Черновик',
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
    PiEmptyStateComponent,
    ButtonComponent,
    ProductBomPanelComponent,
    AccordionComponent,
    AccordionItemComponent,
    PiPageChromeComponent,
    PiFactCardComponent,
    PiFactStackComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" data-test="product-detail-nav">
      <span actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          {{ backLabel() }}
        </app-pi-button>
        @if (product()) {
          <app-pi-button
            variant="default"
            type="button"
            (click)="openEdit()"
            data-test="edit-button"
          >
            Редактировать
          </app-pi-button>
        }
      </span>
    </app-pi-page-chrome>

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ loadError() }}
      </div>
      <div class="py-8 text-center text-muted-foreground text-sm">
        Товар не найден.
        <button
          type="button"
          class="block mt-2 mx-auto text-ink hover:text-sunrise-warm underline"
          (click)="onBack()"
          data-test="back-button-error"
        >
          {{ backLabel() }}
        </button>
      </div>
    }

    @if (product(); as p) {
      <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] gap-5 items-start"
        data-test="product-detail-layout"
      >
        <div class="space-y-4 xl:sticky xl:top-3" data-test="product-detail-aside">
          <!-- Левая колонка: карточка товара -->
          <section class="hairline rounded-sm bg-paper overflow-hidden" data-test="product-hero">
            <div
              class="relative w-full aspect-[4/3] bg-paper-2 flex items-center justify-center"
              data-test="product-hero-photo"
            >
              @if (mainPhotos()[0]; as cover) {
                <button
                  type="button"
                  class="absolute inset-0 block w-full h-full cursor-zoom-in pi-focus-ring"
                  [attr.aria-label]="'Открыть фото: ' + (cover.originalFilename ?? p.name)"
                  (click)="openPhoto(cover, p.name)"
                  data-test="product-hero-photo-button"
                >
                  <img
                    [src]="cover.storageUrl"
                    [alt]="cover.originalFilename ?? p.name"
                    class="block w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
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

              <div class="flex flex-wrap gap-1.5 items-center">
                @if (isComplex()) {
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
                    data-test="complex-badge"
                    >Комплекс</span
                  >
                }
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs hairline rounded-sm"
                  [class.bg-sunrise-warm/10]="p.isActive"
                  [class.text-sunrise-warm]="p.isActive"
                  [class.text-muted-foreground]="!p.isActive"
                  data-test="product-active-badge"
                >
                  {{ p.isActive ? 'Активен' : 'Неактивен' }}
                </span>
                @if (p.status) {
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs hairline rounded-sm text-muted-foreground"
                    data-test="product-status-badge"
                    >{{ statusLabel(p.status) }}</span
                  >
                }
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs hairline rounded-sm text-muted-foreground font-mono"
                  data-test="product-module-count"
                >
                  В составе: {{ compositionSummary() }}
                </span>
              </div>

              <app-pi-fact-stack title="Паспорт" dataTest="product-hero-dims">
                <app-pi-fact-card
                  label="Д×Ш×В"
                  [value]="dimensionsLabel(p)"
                  [mono]="true"
                  dataTest="product-dim-hwl"
                />
                <app-pi-fact-card
                  label="Вес"
                  [value]="p.weightKg != null ? p.weightKg + ' кг' : '—'"
                  [mono]="true"
                  dataTest="product-weight"
                />
                <app-pi-fact-card
                  label="RAL"
                  [value]="p.ralCode ?? '—'"
                  [mono]="true"
                  dataTest="product-ral"
                />
              </app-pi-fact-stack>
            </div>
          </section>

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
                    <button
                      type="button"
                      class="block w-full max-w-[9rem] aspect-square cursor-zoom-in pi-focus-ring"
                      [attr.aria-label]="'Открыть фото: ' + (ph.originalFilename ?? p.name)"
                      (click)="openPhoto(ph, p.name)"
                      data-test="product-gallery-photo-button"
                    >
                      <img
                        [src]="ph.storageUrl"
                        [alt]="ph.originalFilename ?? 'фото'"
                        class="block w-full h-full object-cover hairline rounded-sm bg-paper-2"
                        loading="lazy"
                      />
                    </button>
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
              <div class="space-y-4" data-test="product-cost-panel">
                <app-pi-fact-stack title="Цены" dataTest="product-price-facts">
                  <app-pi-fact-card
                    label="Прайс"
                    [value]="p.listPrice != null ? formatRuble(p.listPrice) : '—'"
                    caption="Цена витрины / для КП"
                    [mono]="true"
                    variant="emphasis"
                    dataTest="product-list-price"
                  />
                  <app-pi-fact-card
                    label="Себест."
                    [value]="p.costPrice != null ? formatRuble(p.costPrice) : '—'"
                    caption="Сколько изделие стоит цеху (rollup)"
                    [mono]="true"
                    dataTest="product-cost-price"
                  />
                  <app-pi-fact-card
                    label="База"
                    [value]="p.basePrice != null ? formatRuble(p.basePrice) : '—'"
                    caption="Базовая цена учёта (до коммерции)"
                    [mono]="true"
                    dataTest="product-base-price"
                  />
                </app-pi-fact-stack>

                <div class="flex justify-end">
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
                  <div class="space-y-2" data-test="product-cost-snapshots">
                    @for (cc of costList(); track cc._id) {
                      <div
                        class="hairline rounded-sm px-2.5 py-2 space-y-2"
                        [class.bg-sunrise-warm/10]="cc.isActive"
                        [attr.data-test]="'cost-snapshot-' + cc._id"
                      >
                        <div class="flex flex-wrap items-baseline justify-between gap-2">
                          <span class="text-sm font-medium font-mono">{{
                            formatRuble(cc.totalCost)
                          }}</span>
                          <span class="text-xs text-muted-foreground">{{
                            formatDate(cc.calculatedAt || cc.createdAt)
                          }}</span>
                        </div>
                        <p class="text-xs text-muted-foreground m-0">
                          Материалы {{ formatRuble(cc.totalMaterialCost) }} · Работы
                          {{ formatRuble(cc.totalLaborCost) }} · Накладные {{ cc.overheadPercent }}%
                          → {{ formatRuble(cc.overheadCost) }}
                        </p>
                        <div class="flex flex-wrap items-center gap-2">
                          @if (cc.isActive) {
                            <span class="text-xs font-medium text-sunrise-warm">● Активен</span>
                          }
                          <app-pi-button
                            variant="outline"
                            size="sm"
                            type="button"
                            (click)="openBreakdown(cc)"
                          >
                            Детали
                          </app-pi-button>
                          @if (!cc.isActive) {
                            <app-pi-button
                              variant="ghost"
                              size="sm"
                              type="button"
                              (click)="activateSnapshot(cc)"
                            >
                              Активировать
                            </app-pi-button>
                          }
                          <app-pi-button
                            variant="ghost"
                            size="sm"
                            type="button"
                            (click)="onDeleteCalc(cc)"
                          >
                            Удалить
                          </app-pi-button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <app-pi-empty-state
                    [colspan]="1"
                    message="Нет расчётов себестоимости. Нажмите «Пересчитать»."
                    state="empty"
                  />
                }
              </div>
            </app-pi-accordion-item>
          </app-pi-accordion>
        </div>

        <!-- Центр: состав на всю высоту -->
        <div class="min-w-0">
          <app-product-bom-panel
            [productId]="p._id"
            (changed)="onBomChanged()"
            data-test="product-composition-panel"
          />
        </div>
      </div>
    }
  `,
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogReturn = inject(CatalogReturnStore);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly costSvc = inject(CostCalculationsService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly dictionaryLabels = inject(PiDictionaryLabelsService, { optional: true });
  private readonly baseUrl = inject(API_BASE_URL);
  protected readonly productKindLabels = signal<Record<string, string>>(
    Object.fromEntries(dictionaryLabelOptions('productKind').map((item) => [item.key, item.label])),
  );
  protected readonly materialKindLabels = signal<Record<string, string>>(
    Object.fromEntries(
      dictionaryLabelOptions('materialKind').map((item) => [item.key, item.label]),
    ),
  );

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
    return this.productKindLabels()[kind] ?? kind;
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
    this.loadKindLabels();
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
  private recalcTimer: ReturnType<typeof setTimeout> | null = null;
  private recalcDirty = false;

  /** TZ-UX-313: «← Назад» when referrer known, else list label. */
  protected readonly backLabel = computed(() =>
    catalogBackLabel(
      this.catalogReturn.previousUrlSignal(),
      this.catalogReturn.currentUrlSignal(),
      '← К каталогу',
    ),
  );

  protected onBack(): void {
    this.catalogReturn.navigateBackOr('/products');
  }

  protected openPhoto(photo: Photo, productName: string): void {
    this.dialog.open(PiPhotoLightboxComponent, {
      data: {
        src: photo.storageUrl,
        alt: photo.originalFilename ?? productName,
        filename: photo.originalFilename ?? productName,
      },
      parentDestroyRef: this.destroyRef,
    });
  }

  /** TZ-CATALOG-DEDUP-304: same FullEditor as products list. */
  protected openEdit(): void {
    const p = this.product();
    if (!p) return;
    const ref = this.dialog.open(ProductFormDialogComponent, {
      data: p as Product,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.productRes.reload();
      this.costRes.reload();
    });
  }

  protected materialKindLabel(kind: Material['materialKind']): string {
    return kind ? (this.materialKindLabels()[kind] ?? kind) : 'тип не указан';
  }

  private loadKindLabels(): void {
    this.dictionaryLabels?.active('productKind').subscribe((labels) => {
      this.productKindLabels.set(Object.fromEntries(labels.map((item) => [item.key, item.label])));
    });
    this.dictionaryLabels?.active('materialKind').subscribe((labels) => {
      this.materialKindLabels.set(Object.fromEntries(labels.map((item) => [item.key, item.label])));
    });
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
    this.scheduleAutoRecalc();
  }

  /** DETAIL-302: debounce auto cost recalc after composition mutate. */
  private scheduleAutoRecalc(): void {
    this.recalcDirty = true;
    if (this.recalcTimer) clearTimeout(this.recalcTimer);
    this.recalcTimer = setTimeout(() => {
      this.recalcTimer = null;
      if (!this.recalcDirty) return;
      this.recalcDirty = false;
      this.recalculate({ quiet: true });
    }, 400);
  }

  protected openModuleDetail(m: ProductModule): void {
    this.router.navigate(['/modules', m._id]);
  }

  // ── TZ-85 Phase C: Себестоимость ──────────────────────────────────────

  protected recalculate(opts?: { quiet?: boolean }): void {
    const pid = this.idString();
    if (!pid || this.recalculating()) {
      if (this.recalculating()) this.recalcDirty = true;
      return;
    }
    this.recalculating.set(true);
    this.costSvc.create(pid).subscribe((res) => {
      this.recalculating.set(false);
      if (res.ok) {
        if (!opts?.quiet) this.toast.success('Себестоимость рассчитана');
        this.costRes.reload();
        this.productRes.reload();
        if (this.recalcDirty) {
          this.recalcDirty = false;
          this.scheduleAutoRecalc();
        }
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
    onDialogCloseOnce(ref, this.injector, (confirmed) => {
      if (!confirmed) return;
      this.costSvc.remove(cc._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Расчёт удалён');
          this.costRes.reload();
          this.productRes.reload();
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
