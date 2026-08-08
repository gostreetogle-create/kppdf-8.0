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
import { PiPageChromeComponent, type PageCrumb } from '../../shared/page/pi-page-chrome.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiEmptyStateComponent } from '../../shared/ui/pi-empty-state/pi-empty-state.component';
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

/** TZ-COST-302: shape of GET /modules/:id/cost-preview (local; no service dep). */
interface ModuleCostPreview {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  currency: 'RUB';
  infos?: string[];
}
import {
  MATERIAL_KIND_LABELS,
  Material,
  MaterialsService,
} from '../../shared/services/materials.service';
import {
  ProductModulePhoto,
  ProductModulePhotosService,
} from '../../shared/services/pi-product-module-photos.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import { ModuleMaterialsFormDialogComponent } from './module-materials-form-dialog.component';
import { PiShowcaseCardComponent } from '../../shared/ui/card';
import { CompositionEditorComponent } from '../../shared/ui/composition/composition-editor.component';

/**
 * Полная документация страницы: docs/pages/module-detail.page.md
 *
 * TZ-83 Phase C: ModuleDetailPage — 4 sections.
 *
 *   I.   Основное       — name/article/dimensions/weight/notes
 *   II.  Фотогалерея    — gallery из ProductModulePhoto, add / setMain / remove
 *   III. Материалы      — table из module.materials[] с override-габаритами;
 *                        кнопка «Изменить состав» → ModuleMaterialsFormDialog
 *   IV.  Виды работ     — table из module.workTypes[]
 *
 * ActivatedRoute id → httpResource GET /product-modules/:id
 * (популятит workTypes.workTypeId + materials.materialId на стороне бэкенда).
 */
@Component({
  selector: 'app-module-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageChromeComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
    PiEmptyTileComponent,
    ButtonComponent,
    PiShowcaseCardComponent,
    CompositionEditorComponent,
  ],
  template: `
    <app-pi-page-chrome [crumbs]="detailCrumbs()" [title]="module()?.name ?? 'Загрузка…'">
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

    <app-pi-showcase-card size="lg" data-test="module-showcase">
      @if (loadError()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ loadError() }}
        </div>
      }

      <!-- I. Основное -->
      @if (module(); as m) {
        <app-pi-section title="Основное" eyebrow="I">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt class="eyebrow">Название</dt>
              <dd class="font-medium">{{ m.name }}</dd>
              <dt class="eyebrow">Артикул</dt>
              <dd class="font-mono empty-cell">{{ m.article ?? '—' }}</dd>
              <dt class="eyebrow">Ширина</dt>
              <dd class="font-mono empty-cell">
                {{ m.dimensions?.width ?? '—' }} {{ m.dimensions?.unit ?? '' }}
              </dd>
              <dt class="eyebrow">Высота</dt>
              <dd class="font-mono empty-cell">
                {{ m.dimensions?.height ?? '—' }} {{ m.dimensions?.unit ?? '' }}
              </dd>
              <dt class="eyebrow">Глубина</dt>
              <dd class="font-mono empty-cell">
                {{ m.dimensions?.depth ?? '—' }} {{ m.dimensions?.unit ?? '' }}
              </dd>
              <dt class="eyebrow">Вес (кг)</dt>
              <dd class="font-mono empty-cell">{{ m.weight ?? '—' }}</dd>
              <dt class="eyebrow">Сортировка</dt>
              <dd class="font-mono empty-cell">{{ m.sortOrder ?? '—' }}</dd>
            </dl>
          </div>
        </app-pi-section>

        <!-- II. Фотогалерея -->
        <app-pi-section
          title="Фотогалерея"
          [hint]="photos().length ? 'главное фото отмечено звёздочкой' : 'пока пусто'"
          eyebrow="II"
        >
          <div class="flex flex-wrap gap-3">
            @for (p of photos(); track p._id) {
              <figure class="relative">
                @if (photoSrc(p); as src) {
                  <img
                    [src]="src"
                    [alt]="p.caption ?? 'фото модуля'"
                    class="block w-32 h-32 object-cover hairline rounded-sm"
                    loading="lazy"
                  />
                } @else {
                  <app-pi-empty-tile [sizePx]="128" />
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
              <p class="eyebrow text-muted-foreground">Нет фото. В Phase E добавим upload UI.</p>
            }
          </div>
          <div class="mt-3 flex gap-2">
            <input #photoUrl placeholder="https://…" class="pi-input w-72 font-mono text-sm" />
            <app-pi-button
              variant="default"
              type="button"
              (click)="addPhotoByUrl(photoUrl.value); photoUrl.value = ''"
            >
              Добавить по URL
            </app-pi-button>
          </div>
        </app-pi-section>

        <!-- III. Материалы -->
        <app-pi-section
          title="Материалы"
          [hint]="materialRows().length ? 'Override-габариты показаны курсивом' : ''"
          eyebrow="III"
        >
          <app-composition-editor
            [parentId]="m._id"
            parentKind="module"
            data-test="module-composition-editor"
          />
          <div class="mt-3 flex justify-end">
            <app-pi-button
              variant="ghost"
              type="button"
              (click)="openMaterialsEditor()"
              data-test="quick-composition-edit"
            >
              Быстрое редактирование
            </app-pi-button>
          </div>
          <div class="hidden">
            <table class="w-full text-sm min-w-[640px]">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Материал / kind</th>
                  <th class="pi-cell-numeric eyebrow w-20">Кол-во</th>
                  <th class="pi-cell eyebrow w-16">Ед.</th>
                  <th class="pi-cell eyebrow w-32 text-left">Габариты (override)</th>
                  <th class="pi-cell eyebrow w-20 text-center">Закупка</th>
                </tr>
              </thead>
              <tbody>
                @for (row of materialRows(); track $index) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell align-top">
                      {{ materialName(row.materialId) }}
                      @if (materialKind(row.materialId); as kind) {
                        <span class="ml-1 text-xs text-muted-foreground">· {{ kind }}</span>
                      }
                    </td>
                    <td class="pi-cell-numeric align-top font-mono">{{ row.quantity }}</td>
                    <td class="pi-cell align-top">{{ row.unit ?? 'шт' }}</td>
                    <td class="pi-cell align-top text-xs italic empty-cell">
                      {{ overrideDims(row) }}
                    </td>
                    <td class="pi-cell align-top text-center">{{ row.isPurchased ? '✓' : '—' }}</td>
                  </tr>
                } @empty {
                  <app-pi-empty-state
                    [colspan]="5"
                    message="Нет материалов в составе."
                    state="empty"
                  />
                }
              </tbody>
            </table>
          </div>
        </app-pi-section>

        <!-- IV. Виды работ -->
        <app-pi-section title="Виды работ" eyebrow="IV">
          <div class="hairline rounded-sm overflow-x-auto">
            <table class="w-full text-sm min-w-[480px]">
              <thead class="hairline-b">
                <tr>
                  <th class="pi-cell eyebrow text-left">Вид работы</th>
                  <th class="pi-cell-numeric eyebrow w-32">Норма (часов)</th>
                  <th class="pi-cell-numeric eyebrow w-20">Сорт.</th>
                </tr>
              </thead>
              <tbody>
                @for (w of m.workTypes; track $index) {
                  <tr class="pi-table-row pi-table-row-odd last:border-0">
                    <td class="pi-cell align-top">{{ workTypeName(w.workTypeId) }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ w.estimatedHours }}</td>
                    <td class="pi-cell-numeric align-top font-mono">{{ w.sortOrder }}</td>
                  </tr>
                } @empty {
                  <app-pi-empty-state
                    [colspan]="3"
                    message="Нет видов работ в составе."
                    state="empty"
                  />
                }
              </tbody>
            </table>
          </div>
        </app-pi-section>

        <!-- V. Себестоимость (расчёт) — TZ-COST-302 read-only -->
        <app-pi-section
          title="Себестоимость (расчёт)"
          hint="сумма материалов и труда по составу; не прайс"
          eyebrow="V"
        >
          @if (costPreview(); as cp) {
            <dl
              class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm max-w-md"
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
              <p class="mt-2 text-xs text-muted-foreground" data-test="module-cost-preview-infos">
                {{ cp.infos.join(' · ') }}
              </p>
            }
          } @else if (costPreviewError()) {
            <p class="text-sm text-destructive" role="alert">{{ costPreviewError() }}</p>
          } @else {
            <p class="eyebrow text-muted-foreground">Загрузка расчёта…</p>
          }
        </app-pi-section>
      }
    </app-pi-showcase-card>
  `,
})
export class ModuleDetailPage {
  protected readonly detailCrumbs = computed<PageCrumb[]>(() => [
    { label: 'Каталог', link: '/modules' },
    { label: this.module()?.name ?? 'Модуль' },
  ]);
  constructor() {
    this.reloadPhotos();
    this.materialsSvc.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialCatalog.set(res.data.items);
    });
  }
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
  private readonly materialsSvc = inject(MaterialsService);
  private readonly photosSvc = inject(ProductModulePhotosService);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * URL-derived id. ActivatedRoute → toSignal показано в html через :id;
   * `listRes` срабатывает через computed(() => id-string).
   */
  private readonly id = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly idString = computed<string>(() => this.id().get('id') ?? '');

  protected readonly moduleRes = httpResource<ProductModule>(() => ({
    url: `${this.baseUrl}/modules/${this.idString()}`,
  }));

  /** TZ-COST-302: read-only cost preview (same URL as modulesSvc.getCostPreview). */
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
  protected readonly moduleDescription = computed<string>(() => {
    const m = this.module();
    if (!m) return '';
    const dims = m.dimensions;
    if (!dims || (dims.width == null && dims.height == null && dims.depth == null)) {
      return `Модуль — ${m.workTypes?.length ?? 0} работ, ${this.materialRows().length} материалов`;
    }
    const parts: string[] = [];
    if (dims.width != null) parts.push(`W ${dims.width}`);
    if (dims.height != null) parts.push(`H ${dims.height}`);
    if (dims.depth != null) parts.push(`D ${dims.depth}`);
    return `Модуль ${parts.join(' × ')} ${dims.unit ?? ''}`;
  });

  /**
   * Dual-read материалов модуля (TZ-CATALOG-317): непустой composition
   * (lineType=material) имеет приоритет над legacy materials[].
   */
  protected readonly materialRows = computed<
    {
      materialId: unknown;
      quantity: number;
      unit?: string;
      isPurchased?: boolean;
      overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string };
    }[]
  >(() => {
    const m = this.module();
    if (!m) return [];
    const lines = (m.composition ?? []).filter((l) => l.lineType === 'material');
    if (lines.length > 0) {
      return lines.map((l) => ({
        materialId: l.refId,
        quantity: l.quantity ?? 1,
        unit: l.unit,
        isPurchased: l.lineType === 'material' ? (l.isPurchased ?? true) : true,
        overrideDimensions: l.lineType === 'material' ? l.overrideDimensions : undefined,
      }));
    }
    return m.materials ?? [];
  });

  /** photos отдельным сигналом, обновляется через reloadPhotos(). */
  protected readonly photos = signal<ProductModulePhoto[]>([]);
  protected readonly materialCatalog = signal<Material[]>([]);

  private reloadPhotos(): void {
    const mid = this.idString();
    if (!mid) return;
    this.photosSvc.list(mid).subscribe((res) => {
      if (res.ok) {
        // server returns isMain desc → sortOrder asc; trust server order
        this.photos.set(res.data);
      }
    });
  }

  // ── Основное ─────────────────────────────────────────────────────
  protected onBack(): void {
    this.router.navigate(['/modules']);
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

  // ── Фотогалерея ──────────────────────────────────────────────────
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

  // ── Материалы ────────────────────────────────────────────────────
  protected materialKind(materialId: unknown): string {
    const id =
      typeof materialId === 'string'
        ? materialId
        : materialId && typeof materialId === 'object' && '_id' in materialId
          ? String((materialId as { _id: string })._id)
          : null;
    const material = id
      ? this.materialCatalog().find((item) => item._id === id)
      : materialId && typeof materialId === 'object' && 'materialKind' in materialId
        ? (materialId as Material)
        : undefined;
    return material?.materialKind
      ? (MATERIAL_KIND_LABELS[material.materialKind] ?? material.materialKind)
      : 'тип не указан';
  }

  protected materialName(materialId: unknown): string {
    if (typeof materialId === 'string') return `(id ${materialId})`;
    if (materialId && typeof materialId === 'object' && 'name' in materialId) {
      return (materialId as { name: string }).name;
    }
    return '—';
  }
  protected overrideDims(m: {
    overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string };
  }): string {
    const d = m.overrideDimensions;
    if (!d) return '';
    const parts: string[] = [];
    if (d.length != null) parts.push(`L ${d.length}`);
    if (d.width != null) parts.push(`W ${d.width}`);
    if (d.height != null) parts.push(`H ${d.height}`);
    return parts.length ? `${parts.join(' × ')} ${d.unit ?? ''}` : '';
  }
  protected openMaterialsEditor(): void {
    const m = this.module();
    if (!m) return;
    const ref = this.dialog.open(ModuleMaterialsFormDialogComponent, {
      data: {
        moduleId: m._id,
        materials: m.materials ?? [],
        composition: m.composition ?? [],
      },
      width: 'xl',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.moduleRes.reload();
      this.costPreviewRes.reload();
    });
  }

  // ── Виды работ ───────────────────────────────────────────────────
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
}
