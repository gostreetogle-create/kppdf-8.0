import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { AccordionComponent } from '../../shared/ui/pi-accordion.component';
import { AccordionItemComponent } from '../../shared/ui/pi-accordion-item.component';
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import {
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import {
  ProductModulePhoto,
  ProductModulePhotosService,
} from '../../shared/services/pi-product-module-photos.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import { ProductBomPanelComponent } from '../products/product-bom-panel.component';

/** TZ-COST-302: shape of GET /modules/:id/cost-preview. */
interface ModuleCostPreview {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  currency: 'RUB';
  infos?: string[];
}

/**
 * TZ-CATALOG-336: module detail = product detail A+ layout.
 * Left: passport + accordion (Фото / Себестоимость / Виды работ).
 * Right: shared ProductBomPanel with rootKind=module.
 *
 * Docs: docs/pages/module-detail.page.md
 */
@Component({
  selector: 'app-module-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageChromeComponent,
    ButtonComponent,
    AccordionComponent,
    AccordionItemComponent,
    PiEmptyTileComponent,
    ProductBomPanelComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" data-test="module-detail-nav">
      <span actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          ← К модулям
        </app-pi-button>
        <app-pi-button variant="default" type="button" (click)="openEdit()" data-test="edit-button">
          Редактировать
        </app-pi-button>
        <app-pi-button variant="ghost" type="button" (click)="onDelete()" data-test="delete-button">
          Удалить
        </app-pi-button>
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
        Модуль не найден.
        <button
          type="button"
          class="block mt-2 mx-auto text-ink hover:text-sunrise-warm underline"
          (click)="onBack()"
        >
          ← К модулям
        </button>
      </div>
    }

    @if (module(); as m) {
      <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] gap-5 items-start"
        data-test="module-detail-layout"
      >
        <div class="space-y-4 xl:sticky xl:top-3" data-test="module-detail-aside">
          <section class="hairline rounded-sm bg-paper overflow-hidden" data-test="module-hero">
            <div
              class="bg-paper-2 flex items-center justify-center aspect-[4/3] max-h-52"
              data-test="module-hero-photo"
            >
              @if (coverPhotoSrc(); as cover) {
                <img
                  [src]="cover"
                  [alt]="m.name"
                  class="block w-full h-full object-cover"
                  loading="lazy"
                />
              } @else {
                <span class="text-xs text-muted-foreground px-3 text-center">Нет фото</span>
              }
            </div>
            <div class="p-4 space-y-3">
              <div class="space-y-1.5">
                <p class="eyebrow m-0">модуль</p>
                <h1
                  class="font-display text-lg sm:text-xl tracking-tight text-ink leading-snug break-words"
                  data-test="module-title"
                >
                  {{ m.name }}
                </h1>
                <p class="text-xs text-muted-foreground font-mono m-0">
                  {{ m.article ? 'арт. ' + m.article : 'без артикула' }}
                </p>
              </div>

              <dl class="grid grid-cols-2 gap-2 text-sm" data-test="module-hero-cost">
                <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0 col-span-2">
                  <dt class="eyebrow truncate">Себест. (расчёт)</dt>
                  <dd
                    class="font-mono font-medium text-sm truncate empty-cell"
                    data-test="module-cost-total"
                  >
                    @if (costPreview(); as cp) {
                      {{ formatRuble(cp.totalCost) }}
                    } @else if (costPreviewError()) {
                      —
                    } @else {
                      …
                    }
                  </dd>
                </div>
                <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                  <dt class="eyebrow truncate">Материалы</dt>
                  <dd
                    class="font-mono text-sm truncate empty-cell"
                    data-test="module-cost-material"
                  >
                    {{ costPreview() != null ? formatRuble(costPreview()!.materialCost) : '—' }}
                  </dd>
                </div>
                <div class="hairline rounded-sm bg-paper-2 px-2.5 py-2 min-w-0">
                  <dt class="eyebrow truncate">Труд</dt>
                  <dd class="font-mono text-sm truncate empty-cell" data-test="module-cost-labor">
                    {{ costPreview() != null ? formatRuble(costPreview()!.laborCost) : '—' }}
                  </dd>
                </div>
              </dl>

              <dl
                class="flex flex-col gap-1 text-xs text-muted-foreground"
                data-test="module-hero-dims"
              >
                <div class="flex justify-between gap-2">
                  <span class="eyebrow shrink-0">Ш×В×Г</span>
                  <span class="font-mono text-ink text-right empty-cell">{{
                    dimensionsLabel(m)
                  }}</span>
                </div>
                <div class="flex justify-between gap-2">
                  <span class="eyebrow shrink-0">Вес</span>
                  <span class="font-mono text-ink text-right empty-cell">{{
                    m.weight != null ? m.weight + ' кг' : '—'
                  }}</span>
                </div>
              </dl>
            </div>
          </section>

          <app-pi-accordion [multi]="true" data-test="module-cascade">
            <app-pi-accordion-item
              title="Фото"
              index="01"
              [meta]="photoMeta()"
              [expanded]="openPhotos()"
              (expandedChange)="openPhotos.set($event)"
            >
              <div class="flex flex-wrap gap-3" data-test="module-photo-gallery">
                @for (p of photos(); track p._id) {
                  <figure class="relative m-0">
                    @if (photoSrc(p); as src) {
                      <img
                        [src]="src"
                        [alt]="p.caption ?? 'фото модуля'"
                        class="block w-full max-w-[9rem] aspect-square object-cover hairline rounded-sm bg-paper-2"
                        loading="lazy"
                      />
                    } @else {
                      <app-pi-empty-tile [sizePx]="144" />
                    }
                    <figcaption class="mt-2 flex items-center gap-2 text-xs">
                      @if (p.isMain) {
                        <span class="eyebrow text-sunrise-warm">★ главное</span>
                      } @else {
                        <button
                          type="button"
                          (click)="setMain(p)"
                          class="eyebrow text-muted-foreground hover:text-sunrise-warm"
                          aria-label="Сделать главным"
                        >
                          сделать главным
                        </button>
                      }
                      <button
                        type="button"
                        (click)="removePhoto(p)"
                        class="eyebrow text-destructive hover:underline"
                        aria-label="Удалить фото"
                      >
                        удалить
                      </button>
                    </figcaption>
                  </figure>
                } @empty {
                  <p class="text-sm text-muted-foreground">Нет фото. Добавьте по URL ниже.</p>
                }
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <input
                  #photoUrl
                  placeholder="https://…"
                  class="pi-input w-full sm:w-72 font-mono text-sm"
                />
                <app-pi-button
                  variant="default"
                  type="button"
                  (click)="addPhotoByUrl(photoUrl.value); photoUrl.value = ''"
                >
                  Добавить по URL
                </app-pi-button>
              </div>
            </app-pi-accordion-item>

            <app-pi-accordion-item
              title="Себестоимость"
              index="02"
              [meta]="costMeta()"
              [expanded]="openCost()"
              (expandedChange)="openCost.set($event)"
            >
              @if (costPreview(); as cp) {
                <dl
                  class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm"
                  data-test="module-cost-preview"
                >
                  <dt class="eyebrow">Материалы</dt>
                  <dd class="font-mono">{{ formatRuble(cp.materialCost) }}</dd>
                  <dt class="eyebrow">Труд</dt>
                  <dd class="font-mono">{{ formatRuble(cp.laborCost) }}</dd>
                  <dt class="eyebrow">Итого</dt>
                  <dd class="font-mono font-medium">{{ formatRuble(cp.totalCost) }}</dd>
                </dl>
                @if (cp.infos?.length) {
                  <p
                    class="mt-2 text-xs text-muted-foreground"
                    data-test="module-cost-preview-infos"
                  >
                    {{ cp.infos?.join(' · ') }}
                  </p>
                }
              } @else if (costPreviewError()) {
                <p class="text-sm text-destructive" role="alert">{{ costPreviewError() }}</p>
              } @else {
                <p class="text-sm text-muted-foreground">Загрузка расчёта…</p>
              }
            </app-pi-accordion-item>

            <app-pi-accordion-item
              title="Виды работ"
              index="03"
              [meta]="workMeta()"
              [expanded]="openWork()"
              (expandedChange)="openWork.set($event)"
            >
              <div class="hairline rounded-sm overflow-x-auto">
                <table class="w-full text-sm min-w-[280px]" data-test="module-work-types">
                  <thead class="hairline-b">
                    <tr>
                      <th class="pi-cell eyebrow text-left">Вид работы</th>
                      <th class="pi-cell-numeric eyebrow w-24">Норма, ч</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (w of m.workTypes; track $index) {
                      <tr class="pi-table-row pi-table-row-odd last:border-0">
                        <td class="pi-cell align-top">{{ workTypeName(w.workTypeId) }}</td>
                        <td class="pi-cell-numeric align-top font-mono">{{ w.estimatedHours }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="2" class="pi-cell text-sm text-muted-foreground">
                          Нет видов работ. Добавьте в «Редактировать».
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-pi-accordion-item>
          </app-pi-accordion>
        </div>

        <div class="min-w-0">
          <app-product-bom-panel
            [productId]="m._id"
            rootKind="module"
            (changed)="onBomChanged()"
            data-test="module-composition-panel"
          />
        </div>
      </div>
    }
  `,
})
export class ModuleDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly photosSvc = inject(ProductModulePhotosService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly bomPanel = viewChild(ProductBomPanelComponent);

  private readonly id = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly idString = computed<string>(() => this.id().get('id') ?? '');

  protected readonly moduleRes = httpResource<ProductModule>(() => ({
    url: `${this.baseUrl}/modules/${this.idString()}`,
  }));

  protected readonly costPreviewRes = httpResource<ModuleCostPreview>(() => {
    const id = this.idString();
    if (!id) return undefined;
    return { url: `${this.baseUrl}/modules/${id}/cost-preview` };
  });

  protected readonly module = computed<ProductModule | null>(() => this.moduleRes.value() ?? null);
  protected readonly costPreview = computed<ModuleCostPreview | null>(
    () => this.costPreviewRes.value() ?? null,
  );
  protected readonly costPreviewError = computed<string | null>(() => {
    const err = this.costPreviewRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });
  protected readonly loadError = computed<string | null>(() => {
    const err = this.moduleRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });

  protected readonly openPhotos = signal(false);
  protected readonly openCost = signal(false);
  protected readonly openWork = signal(false);
  protected readonly photos = signal<ProductModulePhoto[]>([]);

  protected readonly detailCrumbs = computed<PageCrumb[]>(() => [
    { label: 'Каталог', link: '/modules' },
    { label: 'Модули', link: '/modules' },
    { label: this.module()?.name ?? 'Модуль' },
  ]);

  protected readonly photoMeta = computed(() => {
    const n = this.photos().length;
    return n ? `${n}` : 'нет';
  });

  protected readonly costMeta = computed(() => {
    const cp = this.costPreview();
    if (!cp) return this.costPreviewError() ? 'ошибка' : '…';
    return this.formatRuble(cp.totalCost);
  });

  protected readonly workMeta = computed(() => {
    const n = this.module()?.workTypes?.length ?? 0;
    return n ? `${n}` : 'нет';
  });

  protected readonly coverPhotoSrc = computed(() => {
    const list = this.photos();
    const main = list.find((p) => p.isMain) ?? list[0];
    return main ? this.photoSrc(main) : null;
  });

  constructor() {
    this.reloadPhotos();
  }

  protected onBack(): void {
    this.router.navigate(['/modules']);
  }

  protected onBomChanged(): void {
    this.moduleRes.reload();
    this.costPreviewRes.reload();
  }

  protected dimensionsLabel(m: ProductModule): string {
    const d = m.dimensions;
    if (!d || (d.width == null && d.height == null && d.depth == null)) return '—';
    const unit = d.unit ? ` ${d.unit}` : '';
    return `${d.width ?? '—'}×${d.height ?? '—'}×${d.depth ?? '—'}${unit}`;
  }

  protected openEdit(): void {
    const m = this.module();
    if (!m) return;
    const ref = this.dialog.open(ModuleFormDialogComponent, {
      data: m,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.moduleRes.reload();
      this.costPreviewRes.reload();
    });
  }

  protected onDelete(): void {
    const m = this.module();
    if (!m) return;
    const ref = this.dialog.open(AlertDialogComponent, {
      data: {
        title: 'Удалить модуль?',
        description: `Удалить «${m.name}»?`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (confirmed: unknown) => {
      if (!confirmed) return;
      this.modulesSvc.remove(m._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Модуль удалён');
          this.router.navigate(['/modules']);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  protected photoSrc(p: ProductModulePhoto): string | null {
    if (p.url) return p.url;
    if (typeof p.photoId === 'string') return null;
    if (p.photoId && typeof p.photoId === 'object' && 'storageUrl' in p.photoId) {
      return p.photoId.storageUrl as string;
    }
    return null;
  }

  protected setMain(p: ProductModulePhoto): void {
    this.photosSvc.setMain(p._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Главное фото обновлено');
        this.reloadPhotos();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected removePhoto(p: ProductModulePhoto): void {
    this.photosSvc.remove(p._id).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Фото удалено');
        this.reloadPhotos();
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  protected addPhotoByUrl(url: string): void {
    const mid = this.idString();
    if (!url?.trim() || !mid) return;
    this.photosSvc
      .attach({
        productModuleId: mid,
        url: url.trim(),
        sortOrder: 0,
        isMain: this.photos().length === 0,
      })
      .subscribe((res) => {
        if (res.ok) {
          this.toast.success('Фото добавлено');
          this.reloadPhotos();
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
  }

  protected workTypeName(wtId: unknown): string {
    if (typeof wtId === 'string') return `(id ${wtId})`;
    if (wtId && typeof wtId === 'object' && 'name' in wtId) {
      return (wtId as { name: string }).name;
    }
    return '—';
  }

  protected formatRuble(amount: number): string {
    return amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  }

  private reloadPhotos(): void {
    const mid = this.idString();
    if (!mid) return;
    this.photosSvc.list(mid).subscribe((res) => {
      if (res.ok) this.photos.set(res.data);
    });
  }
}
