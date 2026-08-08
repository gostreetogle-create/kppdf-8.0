import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiFactCardComponent, PiFactStackComponent } from '../../shared/ui/fact-card';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  Material,
  MATERIAL_KIND_LABELS,
  type MaterialDimension,
  type MaterialKind,
} from '../../shared/services/materials.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';
import { CatalogReturnStore, catalogBackLabel } from '../../shared/navigation/catalog-return.util';

/** Where-used item contract from GET /materials/:id/where-used (TZ-CATALOG-310). */
interface WhereUsedItem {
  id: string;
  kind: 'product' | 'module';
  name: string;
  relation: string;
  quantity: number;
  unit?: string;
  sortOrder?: number;
}

interface WhereUsedPage {
  items: WhereUsedItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * TZ-CATALOG-312: MaterialDetailPage — карточка материала /materials/:id.
 *
 * Паттерн: product-detail.page.ts / module-detail.page.ts.
 * Структура:
 *   I.   Основное       — name, article, SKU, unit, kind, assortment,
 *                         standardRef, materialGrade, pricePerUnit, weightKg, description
 *   II.  Габариты       — dimensions[]
 *   III. Склад           — ссылка на /storage-items?materialId=:id
 *   IV.  Где используется — where-used backlinks (API 310)
 */
@Component({
  selector: 'app-material-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    RouterLink,
    PiFactCardComponent,
    PiFactStackComponent,
  ],
  template: `
    <app-pi-page-header
      [eyebrow]="'материал'"
      [title]="material()?.name ?? 'Загрузка…'"
      [description]="materialDescription()"
    >
      <span header-actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          {{ backLabel() }}
        </app-pi-button>
        @if (material()) {
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
    </app-pi-page-header>

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ loadError() }}
      </div>
      <div class="py-12 text-center text-muted-foreground text-sm">
        Материал не найден. Вернитесь к списку материалов.
        <button
          type="button"
          (click)="onBack()"
          class="block mx-auto mt-2 text-ink hover:text-sunrise-warm underline"
          data-test="back-button-error"
        >
          {{ backLabel() }}
        </button>
      </div>
    }

    @if (material(); as m) {
      <!-- Passport: shared FactStack keeps material facts readable without a dense dl. -->
      <app-pi-section title="Паспорт" eyebrow="I">
        <div class="space-y-4" data-test="material-passport">
          <app-pi-fact-stack title="Идентификация" dataTest="material-identity-facts">
            <app-pi-fact-card label="Название" [value]="m.name" dataTest="material-name" />
            <app-pi-fact-card
              label="Артикул"
              [value]="m.article ?? '—'"
              [mono]="true"
              dataTest="material-article"
            />
            <app-pi-fact-card
              label="Внутренний код"
              [value]="m.sku ?? '—'"
              [mono]="true"
              dataTest="material-sku"
            />
            <app-pi-fact-card label="Единица" [value]="m.unit || '—'" dataTest="material-unit" />
            <app-pi-fact-card
              label="Категория"
              [value]="m.categoryId ?? '—'"
              [mono]="true"
              dataTest="material-category"
            />
            <app-pi-fact-card
              label="Тип"
              [value]="kindLabel(m.materialKind)"
              dataTest="material-kind"
            />
            <app-pi-fact-card
              label="Профиль"
              [value]="m.assortment ?? '—'"
              dataTest="material-assortment"
            />
            <app-pi-fact-card
              label="Стандарт"
              [value]="m.standardRef ?? '—'"
              dataTest="material-standard"
            />
            <app-pi-fact-card
              label="Марка"
              [value]="m.materialGrade ?? '—'"
              dataTest="material-grade"
            />
          </app-pi-fact-stack>

          <app-pi-fact-stack title="Параметры" dataTest="material-physical-facts">
            <app-pi-fact-card
              label="Вес"
              [value]="m.weightKg != null ? m.weightKg + ' кг' : '—'"
              [mono]="true"
              dataTest="material-weight"
            />
            <app-pi-fact-card
              label="Габариты"
              [value]="dimensionsLabel(m.dimensions)"
              [mono]="true"
              dataTest="material-dimensions"
            />
          </app-pi-fact-stack>

          <app-pi-fact-stack title="Цена" dataTest="material-price-facts">
            <app-pi-fact-card
              label="Цена за ед."
              [value]="formatPrice(m.pricePerUnit)"
              caption="Закупочная / учётная цена материала"
              [mono]="true"
              variant="emphasis"
              dataTest="material-price"
            />
          </app-pi-fact-stack>

          <p class="text-sm text-ink whitespace-pre-wrap">{{ m.description ?? '—' }}</p>
        </div>
      </app-pi-section>

      <!-- II. Габариты -->
      <app-pi-section title="Габариты" eyebrow="II">
        @if (m.dimensions?.length) {
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[320px]">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Тип</th>
                  <th class="pi-cell-numeric eyebrow w-32">Значение</th>
                </tr>
              </thead>
              <tbody>
                @for (d of m.dimensions; track $index) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell">{{ dimTypeLabel(d.type) }}</td>
                    <td class="pi-cell-numeric font-mono">{{ formatDimValue(d.value) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="eyebrow text-muted-foreground">Габариты не указаны.</p>
        }
      </app-pi-section>

      <!-- III. Склад -->
      <app-pi-section title="Склад" eyebrow="III" hint="остатки и движения по этому материалу">
        <a
          [routerLink]="['/storage-items']"
          [queryParams]="{ materialId: m._id }"
          class="inline-flex items-center gap-1.5 text-sm text-primary underline decoration-dotted underline-offset-4 hover:text-sunrise-warm transition-colors"
          data-test="stock-link"
        >
          Открыть остатки на складе →
        </a>
      </app-pi-section>

      <!-- IV. Где используется -->
      <app-pi-section
        title="Где используется"
        eyebrow="IV"
        [hint]="whereUsedTotal() ? 'модули и товары, в составе которых есть этот материал' : ''"
      >
        @if (whereUsedLoading()) {
          <p class="text-sm text-muted-foreground">Загрузка…</p>
        } @else if (whereUsedError()) {
          <p class="text-sm text-destructive" role="alert">{{ whereUsedError() }}</p>
        } @else if (whereUsedItems().length > 0) {
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[480px]">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Тип</th>
                  <th class="pi-cell eyebrow text-left">Название</th>
                  <th class="pi-cell-numeric eyebrow w-20">Кол-во</th>
                  <th class="pi-cell eyebrow w-24">Ед.</th>
                </tr>
              </thead>
              <tbody>
                @for (item of whereUsedItems(); track item.id + item.kind) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell">
                      <span class="inline-flex items-center gap-1 text-xs font-medium">
                        {{ item.kind === 'product' ? 'Товар' : 'Модуль' }}
                      </span>
                    </td>
                    <td class="pi-cell">
                      <a
                        [routerLink]="
                          item.kind === 'product' ? ['/products', item.id] : ['/modules', item.id]
                        "
                        class="text-primary underline decoration-dotted underline-offset-4 hover:text-sunrise-warm"
                      >
                        {{ item.name }}
                      </a>
                    </td>
                    <td class="pi-cell-numeric font-mono">{{ item.quantity }}</td>
                    <td class="pi-cell">{{ item.unit || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (whereUsedTotal() > whereUsedItems().length) {
            <p class="mt-2 text-xs text-muted-foreground">
              Показано {{ whereUsedItems().length }} из {{ whereUsedTotal() }}
            </p>
          }
        } @else {
          <p class="eyebrow text-muted-foreground">
            Этот материал пока не используется ни в одном модуле или товаре.
          </p>
        }
      </app-pi-section>
    }
  `,
})
export class MaterialDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogReturn = inject(CatalogReturnStore);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly id = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly idString = computed<string>(() => this.id().get('id') ?? '');

  // ── Material GET ──────────────────────────────────────────────────

  protected readonly materialRes = httpResource<Material>(() => ({
    url: `${this.baseUrl}/materials/${this.idString()}`,
  }));

  protected readonly material = computed<Material | null>(() => this.materialRes.value() ?? null);
  protected readonly loadError = computed<string | null>(() => {
    const err = this.materialRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly materialDescription = computed<string>(() => {
    const m = this.material();
    if (!m) return '';
    const parts: string[] = [];
    if (m.article) parts.push(`Арт. ${m.article}`);
    if (m.sku) parts.push(`SKU ${m.sku}`);
    return parts.length ? `Материал · ${parts.join(' · ')}` : 'Материал';
  });

  // ── Where-used ────────────────────────────────────────────────────

  protected readonly whereUsedRes = httpResource<WhereUsedPage>(() => ({
    url: `${this.baseUrl}/materials/${this.idString()}/where-used`,
    params: { page: 1, limit: 50 },
  }));

  protected readonly whereUsedItems = computed<WhereUsedItem[]>(
    () => this.whereUsedRes.value()?.items ?? [],
  );
  protected readonly whereUsedTotal = computed<number>(() => this.whereUsedRes.value()?.total ?? 0);
  protected readonly whereUsedLoading = computed<boolean>(() => this.whereUsedRes.isLoading());
  protected readonly whereUsedError = computed<string | null>(() => {
    const err = this.whereUsedRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  // ── Actions ───────────────────────────────────────────────────────

  /** TZ-UX-313: «← Назад» when referrer known, else list label. */
  protected readonly backLabel = computed(() =>
    catalogBackLabel(
      this.catalogReturn.previousUrlSignal(),
      this.catalogReturn.currentUrlSignal(),
      '← К материалам',
    ),
  );

  protected onBack(): void {
    this.catalogReturn.navigateBackOr('/materials');
  }

  /** TZ-CATALOG-DEDUP-304: same MaterialFormDialog as materials list. */
  protected openEdit(): void {
    const m = this.material();
    if (!m) return;
    const ref = this.dialog.open(MaterialFormDialogComponent, {
      data: m,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.materialRes.reload();
      this.whereUsedRes.reload();
    });
  }

  // ── Formatters ────────────────────────────────────────────────────

  protected kindLabel(k: MaterialKind | null | undefined): string {
    if (!k) return '—';
    return MATERIAL_KIND_LABELS[k] ?? k;
  }

  protected formatPrice(n: number | undefined): string {
    if (n == null) return '—';
    return `${n.toLocaleString('ru-RU')} ₽`;
  }

  protected dimTypeLabel(t: string): string {
    switch (t) {
      case 'length':
        return 'Длина';
      case 'width':
        return 'Ширина';
      case 'height':
        return 'Высота';
      case 'thickness':
        return 'Толщина';
      case 'diameter':
        return 'Диаметр';
      case 'depth':
        return 'Глубина';
      default:
        return t;
    }
  }

  protected dimensionsLabel(dimensions: MaterialDimension[] | undefined): string {
    if (!dimensions?.length) return '—';
    return dimensions
      .map(
        (dimension) =>
          `${this.dimTypeLabel(dimension.type)} ${this.formatDimValue(dimension.value)}`,
      )
      .join(' · ');
  }

  protected formatDimValue(n: number): string {
    if (n >= 1) return `${n} мм`;
    return `${(n * 1000).toFixed(0)} мкм`;
  }
}
