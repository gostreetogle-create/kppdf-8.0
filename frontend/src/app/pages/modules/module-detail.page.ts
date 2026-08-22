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
import { PiPhotoDropzoneComponent, PiPhotoLightboxComponent } from '../../shared/ui/photo';
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
import { ProductBomPanelComponent } from '../../shared/ui/composition/product-bom-panel.component';
import { PiFactCardComponent, PiFactStackComponent } from '../../shared/ui/fact-card';
import { CatalogReturnStore, catalogBackLabel } from '../../shared/navigation/catalog-return.util';
import {
  PhotosService,
  uploadPhotosWithProgress,
  type Photo,
} from '../../shared/services/photos.service';
import { forkJoin } from 'rxjs';

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
    PiPhotoDropzoneComponent,
    ProductBomPanelComponent,
    PiFactCardComponent,
    PiFactStackComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" data-test="module-detail-nav">
      <span actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          {{ backLabel() }}
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
          data-test="back-button-error"
        >
          {{ backLabel() }}
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
              class="relative w-full aspect-[4/3] bg-paper-2 flex items-center justify-center"
              data-test="module-hero-photo"
            >
              @if (coverPhotoSrc(); as cover) {
                <button
                  type="button"
                  class="absolute inset-0 block w-full h-full cursor-zoom-in pi-focus-ring"
                  [attr.aria-label]="'Открыть фото: ' + m.name"
                  (click)="openPhotoUrl(cover, m.name)"
                  data-test="module-hero-photo-button"
                >
                  <img
                    [src]="cover"
                    [alt]="m.name"
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

              <app-pi-fact-stack title="Паспорт" dataTest="module-hero-dims">
                <app-pi-fact-card
                  label="Ш×В×Г"
                  [value]="dimensionsLabel(m)"
                  [mono]="true"
                  dataTest="module-dim"
                />
                <app-pi-fact-card
                  label="Вес"
                  [value]="m.weight != null ? m.weight + ' кг' : '—'"
                  [mono]="true"
                  dataTest="module-weight"
                />
              </app-pi-fact-stack>
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
                      <button
                        type="button"
                        class="block w-full max-w-[9rem] aspect-square cursor-zoom-in pi-focus-ring"
                        [attr.aria-label]="'Открыть фото: ' + (p.caption ?? m.name)"
                        (click)="openPhotoUrl(src, p.caption ?? m.name)"
                        data-test="module-gallery-photo-button"
                      >
                        <img
                          [src]="src"
                          [alt]="p.caption ?? 'фото модуля'"
                          class="block w-full h-full object-cover hairline rounded-sm bg-paper-2"
                          loading="lazy"
                        />
                      </button>
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
                  <p class="text-sm text-muted-foreground">
                    Нет фото. Загрузите файл или добавьте по ссылке.
                  </p>
                }
              </div>
              <div class="mt-3" data-test="module-photo-upload">
                <app-pi-photo-dropzone
                  [photos]="dropzonePhotos()"
                  [uploading]="photosUploading()"
                  [progressPercent]="photoUploadProgress()"
                  [errorMessage]="photoErrorMessage()"
                  (uploadRequest)="onPhotoUpload($event)"
                  (deleteRequest)="onPhotoDelete($event)"
                />
              </div>
              <details class="mt-3 hairline rounded-sm p-2">
                <summary class="cursor-pointer text-xs text-muted-foreground">
                  Добавить по ссылке
                </summary>
                <div class="mt-2 flex flex-wrap gap-2">
                  <input
                    #photoUrl
                    placeholder="https://…"
                    class="pi-input w-full sm:w-72 font-mono text-sm"
                  />
                  <app-pi-button
                    variant="outline"
                    type="button"
                    (click)="addPhotoByUrl(photoUrl.value); photoUrl.value = ''"
                  >
                    Добавить по ссылке
                  </app-pi-button>
                </div>
              </details>
            </app-pi-accordion-item>

            <app-pi-accordion-item
              title="Себестоимость"
              index="02"
              [meta]="costMeta()"
              [expanded]="openCost()"
              (expandedChange)="openCost.set($event)"
            >
              <div class="space-y-3" data-test="module-cost-panel">
                @if (costPreview(); as cp) {
                  <app-pi-fact-stack title="Расчёт" dataTest="module-cost-preview">
                    <app-pi-fact-card
                      label="Итого"
                      [value]="formatRuble(cp.totalCost)"
                      caption="Себестоимость модуля (rollup)"
                      [mono]="true"
                      variant="emphasis"
                      dataTest="module-cost-total"
                    />
                    <app-pi-fact-card
                      label="Материалы"
                      [value]="formatRuble(cp.materialCost)"
                      caption="Сумма материалов в составе"
                      [mono]="true"
                      dataTest="module-cost-material"
                    />
                    <app-pi-fact-card
                      label="Труд"
                      [value]="formatRuble(cp.laborCost)"
                      caption="Часы × ставка видов работ"
                      [mono]="true"
                      dataTest="module-cost-labor"
                    />
                  </app-pi-fact-stack>
                  @if (cp.infos?.length) {
                    <p
                      class="text-xs text-muted-foreground m-0"
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
              </div>
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
                      <th class="pi-cell pi-label text-muted-foreground text-left">Вид работы</th>
                      <th class="pi-cell-numeric pi-label text-muted-foreground w-24">Норма, ч</th>
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
  private readonly catalogReturn = inject(CatalogReturnStore);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly photosSvc = inject(ProductModulePhotosService);
  private readonly photosService = inject(PhotosService);
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
  protected readonly photosUploading = signal(false);
  protected readonly photoUploadProgress = signal<number | null>(null);
  protected readonly photoErrorMessage = signal<string | null>(null);
  protected readonly dropzonePhotos = computed<Photo[]>(() =>
    this.photos().flatMap((photo) =>
      photo.photoId && typeof photo.photoId === 'object' ? [photo.photoId] : [],
    ),
  );

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

  /** TZ-UX-313: «← Назад» when referrer known, else list label. */
  protected readonly backLabel = computed(() =>
    catalogBackLabel(
      this.catalogReturn.previousUrlSignal(),
      this.catalogReturn.currentUrlSignal(),
      '← К модулям',
    ),
  );

  protected onBack(): void {
    this.catalogReturn.navigateBackOr('/modules');
  }

  protected openPhotoUrl(src: string, label: string): void {
    if (!src) return;
    this.dialog.open(PiPhotoLightboxComponent, {
      data: { src, alt: label, filename: label },
      parentDestroyRef: this.destroyRef,
    });
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

  protected onPhotoUpload(files: File[]): void {
    if (files.length === 0) return;
    const moduleId = this.idString();
    if (!moduleId) return;
    const makeMain = this.photos().length === 0;
    this.photosUploading.set(true);
    this.photoUploadProgress.set(null);
    this.photoErrorMessage.set(null);
    uploadPhotosWithProgress(this.photosService, files, (percent) =>
      this.photoUploadProgress.set(percent),
    ).subscribe((results) => {
      const uploaded: Photo[] = [];
      const failed: string[] = [];
      results.forEach((result, index) => {
        if (result.ok) uploaded.push(result.data);
        else failed.push(files[index].name);
      });
      if (failed.length > 0) {
        this.photoErrorMessage.set(`Не удалось загрузить: ${failed.join(', ')}`);
      }
      if (uploaded.length === 0) {
        this.photosUploading.set(false);
        this.photoUploadProgress.set(null);
        return;
      }
      forkJoin(
        uploaded.map((photo, index) =>
          this.photosSvc.attach({
            productModuleId: moduleId,
            photoId: photo._id,
            isMain: makeMain && index === 0,
            sortOrder: this.photos().length + index,
          }),
        ),
      ).subscribe((attachResults) => {
        const attachFailed = attachResults.filter((result) => !result.ok).length;
        if (attachFailed > 0) {
          this.photoErrorMessage.set(`Не удалось привязать фото: ${attachFailed}`);
          this.toast.error(`Не удалось привязать фото: ${attachFailed}`);
        } else {
          this.toast.success(`Загружено фото: ${uploaded.length}`);
        }
        this.photosUploading.set(false);
        this.photoUploadProgress.set(null);
        this.reloadPhotos();
      });
    });
  }

  protected onPhotoDelete(photoId: string): void {
    const linked = this.photos().find(
      (photo) => typeof photo.photoId === 'object' && photo.photoId?._id === photoId,
    );
    if (linked) this.removePhoto(linked);
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
