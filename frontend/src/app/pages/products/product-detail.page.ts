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
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
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
import { ProductModulePickerDialogComponent } from './product-module-picker-dialog.component';
import {
  ProductCompositionPickerDialogComponent,
  ProductCompositionPickerResult,
} from './product-composition-picker-dialog.component';
import {
  Material,
  MATERIAL_KIND_LABELS,
  MaterialsService,
} from '../../shared/services/materials.service';
import { CostCalculationDetailDialogComponent } from './cost-calculation-detail-dialog.component';
import { Photo } from '../../shared/services/photos.service';
import { CompositionEditorComponent } from '../../shared/ui/composition/composition-editor.component';

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
    PiPageHeaderComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
    ButtonComponent,
    CompositionEditorComponent,
  ],
  template: `
    <app-pi-page-header
      [eyebrow]="'товар'"
      [title]="product()?.name ?? 'Загрузка…'"
      [description]="productDescription()"
    >
      <span header-actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          ← К продукции
        </app-pi-button>
      </span>
    </app-pi-page-header>

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ loadError() }}
      </div>
      <div class="py-12 text-center text-muted-foreground text-sm">
        Товар не найден. Вернитесь к списку продукции.
        <button
          type="button"
          (click)="onBack()"
          class="block mx-auto mt-2 text-ink hover:text-sunrise-warm underline"
        >
          ← К продукции
        </button>
      </div>
    }

    <!-- I. Основное -->
    @if (product(); as p) {
      <app-pi-section title="Основное" eyebrow="I">
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt class="eyebrow">SKU</dt>
          <dd class="font-mono empty-cell">{{ p.sku ?? '—' }}</dd>
          <dt class="eyebrow">Тип</dt>
          <dd class="empty-cell">{{ p.kind ?? '—' }}</dd>
          <dt class="eyebrow">Статус</dt>
          <dd class="empty-cell">{{ p.status ?? '—' }}</dd>
          <dt class="eyebrow">Цена прайс</dt>
          <dd class="font-mono empty-cell">{{ p.listPrice ?? '—' }} ₽</dd>
          <dt class="eyebrow">Цена база</dt>
          <dd class="font-mono empty-cell">{{ p.basePrice ?? '—' }} ₽</dd>
          <dt class="eyebrow">Себестоимость</dt>
          <dd class="font-mono empty-cell">{{ p.costPrice ?? '—' }} ₽</dd>
          <dt class="eyebrow">Активен</dt>
          <dd>{{ p.isActive ? '✓' : '—' }}</dd>
        </dl>
      </app-pi-section>

      <!-- II. Габариты -->
      <app-pi-section title="Габариты и вес" eyebrow="II">
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt class="eyebrow">Длина</dt>
          <dd class="font-mono empty-cell">
            {{ p.dimensions?.length ?? '—' }} {{ p.dimensions?.unit ?? '' }}
          </dd>
          <dt class="eyebrow">Ширина</dt>
          <dd class="font-mono empty-cell">
            {{ p.dimensions?.width ?? '—' }} {{ p.dimensions?.unit ?? '' }}
          </dd>
          <dt class="eyebrow">Высота</dt>
          <dd class="font-mono empty-cell">
            {{ p.dimensions?.height ?? '—' }} {{ p.dimensions?.unit ?? '' }}
          </dd>
          <dt class="eyebrow">Вес (кг)</dt>
          <dd class="font-mono empty-cell">{{ p.weightKg ?? '—' }}</dd>
          <dt class="eyebrow">RAL</dt>
          <dd class="font-mono empty-cell">{{ p.ralCode ?? '—' }}</dd>
        </dl>
      </app-pi-section>

      <!-- III. Фотогалерея -->
      <app-pi-section title="Фотогалерея" eyebrow="III">
        <div class="flex flex-wrap gap-3">
          @for (ph of mainPhotos(); track ph._id) {
            <figure>
              <img
                [src]="ph.storageUrl"
                [alt]="ph.originalFilename ?? 'фото'"
                class="block w-32 h-32 object-cover hairline rounded-sm"
                loading="lazy"
              />
            </figure>
          } @empty {
            <p class="eyebrow text-muted-foreground">Нет фото. В Phase E добавим загрузку.</p>
          }
        </div>
      </app-pi-section>

      <!-- IV. Модули -->
      <app-pi-section
        title="Состав"
        [hint]="
          attachedModules().length
            ? 'один модуль может использоваться в нескольких товарах (M:N)'
            : ''
        "
        eyebrow="IV"
      >
        <app-composition-editor
          [parentId]="p._id"
          parentKind="product"
          data-test="product-composition-editor"
        />
        <div class="mt-3 flex justify-end">
          <app-pi-button
            variant="ghost"
            type="button"
            (click)="openCompositionPicker()"
            data-test="quick-composition-edit"
          >
            Быстрое добавление
          </app-pi-button>
        </div>
        <div class="hidden">
          @if (isComplex()) {
            <span
              class="inline-flex items-center mb-2 px-2 py-1 text-xs hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
              data-test="complex-badge"
              >Комплекс</span
            >
          }
          @if (compositionLines().length > 0) {
            <div class="mb-3 hairline rounded-sm overflow-x-auto">
              <table class="w-full text-sm min-w-[560px]">
                <thead class="hairline-b">
                  <tr>
                    <th class="pi-cell eyebrow text-left">Тип</th>
                    <th class="pi-cell eyebrow text-left">Элемент</th>
                    <th class="pi-cell-numeric eyebrow">Кол-во</th>
                    <th class="pi-cell-numeric eyebrow">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  @for (line of compositionLines(); track line._id) {
                    <tr class="pi-table-row pi-table-row-odd">
                      <td class="pi-cell">
                        {{
                          line.lineType === 'product'
                            ? 'Изделие'
                            : line.lineType === 'material'
                              ? 'Материал'
                              : 'Модуль'
                        }}
                      </td>
                      <td class="pi-cell font-medium">{{ compositionRefLabel(line) }}</td>
                      <td class="pi-cell-numeric font-mono">{{ line.quantity }}</td>
                      <td class="pi-cell-numeric font-mono">{{ productLinePrice(line) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[640px]">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Модуль</th>
                  <th class="pi-cell eyebrow text-left">Артикул</th>
                  <th class="pi-cell-numeric eyebrow w-24">Кол-во</th>
                  <th class="pi-cell-numeric eyebrow w-32">Материалов</th>
                  <th class="pi-cell-numeric eyebrow w-32">Работ</th>
                  <th class="pi-cell eyebrow w-40 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                @for (row of attachedModules(); track row.module._id) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell align-top font-medium">{{ row.module.name }}</td>
                    <td class="pi-cell align-top font-mono text-xs empty-cell">
                      {{ row.module.article ?? '—' }}
                    </td>
                    <td class="pi-cell-numeric align-top font-mono">{{ row.quantity }}</td>
                    <td class="pi-cell-numeric align-top">{{ row.module.materials.length }}</td>
                    <td class="pi-cell-numeric align-top">{{ row.module.workTypes.length }}</td>
                    <td class="pi-cell align-top text-right">
                      <button
                        type="button"
                        (click)="openModuleDetail(row.module)"
                        class="eyebrow text-ink hover:text-sunrise-warm mr-3"
                      >
                        Открыть
                      </button>
                      <button
                        type="button"
                        (click)="onDetach(row)"
                        class="eyebrow text-destructive hover:underline"
                      >
                        Убрать
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <app-pi-empty-state
                    [colspan]="6"
                    message="Нет модулей в составе. Нажмите «+ Модуль в состав»."
                    state="empty"
                  />
                }
              </tbody>
            </table>
          </div>
        </div>
      </app-pi-section>

      <!-- V. Себестоимость -->
      <app-pi-section
        title="Себестоимость"
        eyebrow="V"
        hint="снимки расчёта: материалы × кол-во + работы × часы + накладные"
      >
        <div class="flex justify-end mb-2">
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
      </app-pi-section>
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

  protected readonly productDescription = computed<string>(() => {
    const p = this.product();
    if (!p) return '';
    return p.sku ? `Товар · SKU ${p.sku}` : 'Товар';
  });

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

  protected openCompositionPicker(): void {
    const pid = this.idString();
    if (!pid) return;
    const ref = this.dialog.open<ProductCompositionPickerResult | null>(
      ProductCompositionPickerDialogComponent,
      {
        data: { productId: pid },
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      const payload =
        result.lineType === 'product'
          ? {
              lineType: 'product' as const,
              refId: result.refId,
              quantity: 1,
              ...(result.unitPriceOverride != null
                ? { unitPriceOverride: result.unitPriceOverride }
                : {}),
            }
          : { lineType: result.lineType, refId: result.refId, quantity: 1 };
      this.modulesSvc.addProductCompositionLine(pid, payload).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Строка добавлена в состав');
          this.productRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected openModuleDetail(m: ProductModule): void {
    this.router.navigate(['/modules', m._id]);
  }

  protected openPicker(): void {
    const pid = this.idString();
    if (!pid) return;
    const ref = this.dialog.open<string | null>(ProductModulePickerDialogComponent, {
      data: {
        productId: pid,
        excludeIds: this.attachedModules().map((r) => r.module._id),
      },
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (chosenId) => {
      this.addCompositionModule(chosenId);
    });
  }

  private addCompositionModule(moduleId: string): void {
    this.modulesSvc
      .addProductCompositionLine(this.idString(), {
        lineType: 'module',
        refId: moduleId,
        quantity: 1,
      })
      .subscribe((res) => {
        if (res.ok) {
          this.toast.success('Модуль добавлен в состав');
          this.productRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
  }

  protected onDetach(row: { module: ProductModule; lineId?: string; quantity: number }): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Убрать модуль из состава?',
        description: `Убрать «${row.module.name}» из состава этого товара? Модуль останется в каталоге.`,
        confirmLabel: 'Убрать',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      const lineId = row.lineId ?? this.compositionLineByModule().get(row.module._id);
      if (!lineId) {
        // legacy-привязка без composition-линии: детач невозможен до миграции 304
        this.toast.error('Состав ещё в legacy-формате — обновите состав через форму товара');
        return;
      }
      this.modulesSvc.removeProductCompositionLine(this.idString(), lineId).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Модуль убран из состава');
          this.productRes.reload();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
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
