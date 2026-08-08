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
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { AccordionComponent } from '../../shared/ui/pi-accordion.component';
import { AccordionItemComponent } from '../../shared/ui/pi-accordion-item.component';
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
import { Photo } from '../../shared/services/photos.service';
import { MaterialFormDialogComponent } from './material-form-dialog.component';
import { CatalogReturnStore, catalogBackLabel } from '../../shared/navigation/catalog-return.util';

/** GET /materials/:id populates photoIds/mainPhotoId while the shared list contract stays string-based. */
type MaterialDetail = Omit<Material, 'photoIds' | 'mainPhotoId'> & {
  photoIds?: Array<string | Photo>;
  mainPhotoId?: string | Photo;
};

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
 * TZ-CATALOG-337: MaterialDetailPage — material A+ sibling of product/module detail.
 *
 * Left: sticky hero, FACT-304 passport, photo/price accordion, dimensions detail.
 * Right: where-used workspace and the live stock link. Material has no BOM.
 */
@Component({
  selector: 'app-material-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageChromeComponent,
    ButtonComponent,
    RouterLink,
    AccordionComponent,
    AccordionItemComponent,
    PiFactCardComponent,
    PiFactStackComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" data-test="material-detail-nav">
      <span actions>
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
    </app-pi-page-chrome>

    @if (loadError()) {
      <div
        role="alert"
        class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
      >
        {{ loadError() }}
      </div>
      <div class="py-8 text-center text-muted-foreground text-sm">
        Материал не найден.
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
      <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] gap-5 items-start"
        data-test="material-detail-layout"
      >
        <div class="space-y-4 xl:sticky xl:top-3" data-test="material-detail-aside">
          <section class="hairline rounded-sm bg-paper overflow-hidden" data-test="material-hero">
            <div
              class="relative w-full aspect-[4/3] bg-paper-2 flex items-center justify-center"
              data-test="material-hero-photo"
            >
              @if (coverPhoto(); as cover) {
                <img
                  [src]="cover.storageUrl"
                  [alt]="cover.alt ?? cover.originalFilename ?? m.name"
                  class="absolute inset-0 block w-full h-full object-cover"
                  loading="lazy"
                />
              } @else {
                <span class="text-xs text-muted-foreground px-3 text-center">Нет фото</span>
              }
            </div>
            <div class="p-4 space-y-3">
              <div class="space-y-1.5">
                <p class="eyebrow m-0">материал</p>
                <h1
                  class="font-display text-lg sm:text-xl tracking-tight text-ink leading-snug break-words"
                  data-test="material-title"
                >
                  {{ m.name }}
                </h1>
                <p class="text-xs text-muted-foreground font-mono m-0">
                  {{ materialIdentityLine(m) }}
                </p>
              </div>

              @if (m.materialKind) {
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs hairline rounded-sm text-muted-foreground"
                  data-test="material-kind-badge"
                >
                  {{ kindLabel(m.materialKind) }}
                </span>
              }

              <app-pi-fact-stack title="Паспорт" dataTest="material-passport">
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
                <app-pi-fact-card
                  label="Единица"
                  [value]="m.unit || '—'"
                  dataTest="material-unit"
                />
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

              @if (m.description) {
                <p class="text-sm text-muted-foreground whitespace-pre-wrap m-0">
                  {{ m.description }}
                </p>
              }
            </div>
          </section>

          <app-pi-accordion [multi]="true" data-test="material-cascade">
            <app-pi-accordion-item
              title="Фото"
              index="01"
              [meta]="photoMeta()"
              [expanded]="openPhotos()"
              (expandedChange)="openPhotos.set($event)"
            >
              <div class="flex flex-wrap gap-3" data-test="material-photo-gallery">
                @for (photo of photos(); track photo._id) {
                  <figure class="m-0">
                    <img
                      [src]="photo.storageUrl"
                      [alt]="photo.alt ?? photo.originalFilename ?? 'фото материала'"
                      class="block w-full max-w-[9rem] aspect-square object-cover hairline rounded-sm bg-paper-2"
                      loading="lazy"
                    />
                  </figure>
                } @empty {
                  <p class="text-sm text-muted-foreground">Нет фото у этого материала.</p>
                }
              </div>
            </app-pi-accordion-item>

            <app-pi-accordion-item
              title="Цена"
              index="02"
              [meta]="priceMeta()"
              [expanded]="openPrice()"
              (expandedChange)="openPrice.set($event)"
            >
              <app-pi-fact-stack title="Цена материала" dataTest="material-price-facts">
                <app-pi-fact-card
                  label="Цена за ед."
                  [value]="formatPrice(m.pricePerUnit)"
                  caption="Закупочная / учётная цена материала"
                  [mono]="true"
                  variant="emphasis"
                  dataTest="material-price"
                />
              </app-pi-fact-stack>
            </app-pi-accordion-item>
          </app-pi-accordion>

          @if (m.dimensions?.length) {
            <section class="hairline rounded-sm bg-paper" data-test="material-dimensions-detail">
              <div class="px-3 py-2 hairline-b">
                <h2 class="pi-label text-ink m-0">Габариты</h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm min-w-[320px]">
                  <thead class="hairline-b">
                    <tr>
                      <th class="pi-cell pi-label text-left">Тип</th>
                      <th class="pi-cell-numeric pi-label w-32">Значение</th>
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
            </section>
          }
        </div>

        <div class="min-w-0 space-y-4" data-test="material-detail-main">
          <section class="hairline rounded-sm bg-paper" data-test="material-where-used">
            <div class="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3 hairline-b">
              <div>
                <p class="pi-label text-ink m-0">Где используется</p>
                <p class="text-xs text-muted-foreground m-0 mt-1">
                  Модули и товары, в составе которых есть этот материал.
                </p>
              </div>
              @if (whereUsedTotal()) {
                <span class="font-mono text-xs text-muted-foreground">{{ whereUsedTotal() }}</span>
              }
            </div>

            @if (whereUsedLoading()) {
              <p class="px-4 py-6 text-sm text-muted-foreground">Загрузка…</p>
            } @else if (whereUsedError()) {
              <p class="px-4 py-6 text-sm text-destructive" role="alert">{{ whereUsedError() }}</p>
            } @else if (whereUsedItems().length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm min-w-[480px]">
                  <thead class="hairline-b">
                    <tr>
                      <th class="pi-cell pi-label text-left">Тип</th>
                      <th class="pi-cell pi-label text-left">Название</th>
                      <th class="pi-cell-numeric pi-label w-20">Кол-во</th>
                      <th class="pi-cell pi-label w-24">Ед.</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of whereUsedItems(); track item.id + item.kind) {
                      <tr class="pi-table-row pi-table-row-odd last:border-0">
                        <td class="pi-cell">
                          {{ item.kind === 'product' ? 'Товар' : 'Модуль' }}
                        </td>
                        <td class="pi-cell">
                          <a
                            [routerLink]="
                              item.kind === 'product'
                                ? ['/products', item.id]
                                : ['/modules', item.id]
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
                <p class="px-4 py-2 text-xs text-muted-foreground">
                  Показано {{ whereUsedItems().length }} из {{ whereUsedTotal() }}
                </p>
              }
            } @else {
              <p class="px-4 py-6 text-sm text-muted-foreground">
                Этот материал пока не используется ни в одном модуле или товаре.
              </p>
            }
          </section>

          <section class="hairline rounded-sm bg-paper" data-test="material-stock">
            <div class="px-4 py-3">
              <p class="pi-label text-ink m-0">Склад</p>
              <p class="text-xs text-muted-foreground m-0 mt-1">
                Остатки и движения по этому материалу.
              </p>
              <a
                [routerLink]="['/storage-items']"
                [queryParams]="{ materialId: m._id }"
                class="inline-flex items-center gap-1.5 mt-3 text-sm text-primary underline decoration-dotted underline-offset-4 hover:text-sunrise-warm transition-colors"
                data-test="stock-link"
              >
                Открыть остатки на складе →
              </a>
            </div>
          </section>
        </div>
      </div>
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

  protected readonly materialRes = httpResource<MaterialDetail>(() => ({
    url: `${this.baseUrl}/materials/${this.idString()}`,
  }));

  protected readonly material = computed<MaterialDetail | null>(
    () => this.materialRes.value() ?? null,
  );
  protected readonly loadError = computed<string | null>(() => {
    const err = this.materialRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly detailCrumbs = computed<PageCrumb[]>(() => [
    { label: 'Каталог', link: '/materials' },
    { label: 'Материалы', link: '/materials' },
    { label: this.material()?.name ?? 'Материал' },
  ]);

  protected readonly openPhotos = signal(false);
  protected readonly openPrice = signal(false);

  protected readonly photos = computed<Photo[]>(() => {
    const list = this.material()?.photoIds ?? [];
    return list.filter((photo): photo is Photo => typeof photo !== 'string');
  });

  protected readonly coverPhoto = computed<Photo | null>(() => {
    const main = this.material()?.mainPhotoId;
    if (main && typeof main !== 'string') return main;
    return this.photos()[0] ?? null;
  });

  protected readonly photoMeta = computed(() => {
    const count = this.photos().length;
    return count ? `${count}` : 'нет';
  });

  protected readonly priceMeta = computed(() => this.formatPrice(this.material()?.pricePerUnit));

  protected readonly materialDescription = computed<string>(() => {
    const m = this.material();
    if (!m) return '';
    const parts: string[] = [];
    if (m.article) parts.push(`Арт. ${m.article}`);
    if (m.sku) parts.push(`SKU ${m.sku}`);
    return parts.length ? `Материал · ${parts.join(' · ')}` : 'Материал';
  });

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

  protected materialIdentityLine(m: MaterialDetail): string {
    const parts: string[] = [];
    if (m.article) parts.push(`арт. ${m.article}`);
    if (m.sku) parts.push(`SKU ${m.sku}`);
    parts.push(kindLabelFor(m.materialKind));
    if (m.unit) parts.push(m.unit);
    return parts.join(' · ');
  }

  protected kindLabel(k: MaterialKind | null | undefined): string {
    return kindLabelFor(k);
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

function kindLabelFor(k: MaterialKind | null | undefined): string {
  if (!k) return '—';
  return MATERIAL_KIND_LABELS[k] ?? k;
}
