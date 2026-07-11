import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
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
import { PiEmptyTileComponent } from '../../shared/ui/pi-empty-tile/pi-empty-tile.component';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { ProductModule, ProductModulesService } from '../../shared/services/pi-product-modules.service';
import {
  ProductModulePhoto,
  ProductModulePhotosService,
} from '../../shared/services/pi-product-module-photos.service';
import { ModuleFormDialogComponent } from './module-form-dialog.component';
import { ModuleMaterialsFormDialogComponent } from './module-materials-form-dialog.component';

/**
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
    PiPageHeaderComponent,
    PiSectionComponent,
    PiEmptyStateComponent,
    PiEmptyTileComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      [eyebrow]="'модуль'"
      [title]="module()?.name ?? 'Загрузка…'"
      [description]="moduleDescription()"
    >
      <span header-actions>
        <app-pi-button variant="ghost" type="button" (click)="onBack()" data-test="back-button">
          ← Назад
        </app-pi-button>
        <app-pi-button variant="default" type="button" (click)="openEdit()" data-test="edit-button">
          Редактировать
        </app-pi-button>
        <app-pi-button variant="ghost" type="button" (click)="onDelete()" data-test="delete-button">
          Удалить
        </app-pi-button>
      </span>
    </app-pi-page-header>

    @if (loadError()) {
      <div role="alert" class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive">
        {{ loadError() }}
      </div>
    }

    <!-- I. Основное -->
    @if (module(); as m) {
      <app-pi-section title="Основное" eyebrow="I">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="eyebrow">Название</dt><dd class="font-medium">{{ m.name }}</dd>
            <dt class="eyebrow">Артикул</dt>
            <dd class="font-mono empty-cell">{{ m.article ?? '—' }}</dd>
            <dt class="eyebrow">Ширина</dt>
            <dd class="font-mono empty-cell">{{ m.dimensions?.width ?? '—' }} {{ m.dimensions?.unit ?? '' }}</dd>
            <dt class="eyebrow">Высота</dt>
            <dd class="font-mono empty-cell">{{ m.dimensions?.height ?? '—' }} {{ m.dimensions?.unit ?? '' }}</dd>
            <dt class="eyebrow">Глубина</dt>
            <dd class="font-mono empty-cell">{{ m.dimensions?.depth ?? '—' }} {{ m.dimensions?.unit ?? '' }}</dd>
            <dt class="eyebrow">Вес (кг)</dt>
            <dd class="font-mono empty-cell">{{ m.weight ?? '—' }}</dd>
            <dt class="eyebrow">Сортировка</dt>
            <dd class="font-mono empty-cell">{{ m.sortOrder ?? '—' }}</dd>
          </dl>
        </div>
      </app-pi-section>

      <!-- II. Фотогалерея -->
      <app-pi-section title="Фотогалерея"
        [hint]="photos().length ? 'главное фото отмечено звёздочкой' : 'пока пусто'"
        eyebrow="II">
        <div class="flex flex-wrap gap-3">
          @for (p of photos(); track p._id) {
            <figure class="relative">
              @if (photoSrc(p); as src) {
                <img [src]="src" [alt]="p.caption ?? 'фото модуля'"
                  class="block w-32 h-32 object-cover hairline rounded-sm" loading="lazy" />
              } @else {
                <app-pi-empty-tile [sizePx]="128" />
              }
              <figcaption class="mt-2 flex items-center gap-2 text-xs">
                @if (p.isMain) {
                  <span class="eyebrow text-sunrise-warm">★ главное</span>
                } @else {
                  <button type="button" (click)="setMain(p)"
                    class="eyebrow text-muted-foreground hover:text-sunrise-warm"
                    aria-label="Сделать главным">сделать главным</button>
                }
                <button type="button" (click)="removePhoto(p)"
                  class="eyebrow text-destructive hover:underline" aria-label="Удалить фото">удалить</button>
              </figcaption>
            </figure>
          } @empty {
            <p class="eyebrow text-muted-foreground">Нет фото. В Phase E добавим upload UI.</p>
          }
        </div>
        <div class="mt-3 flex gap-2">
          <input #photoUrl placeholder="https://…" class="pi-input w-72 font-mono text-sm" />
          <app-pi-button variant="default" type="button" (click)="addPhotoByUrl(photoUrl.value); photoUrl.value=''">
            Добавить по URL
          </app-pi-button>
        </div>
      </app-pi-section>

      <!-- III. Материалы -->
      <app-pi-section title="Материалы"
        [hint]="m.materials.length ? 'Override-габариты показаны курсивом' : ''"
        eyebrow="III">
        <div class="flex justify-end mb-2">
          <app-pi-button variant="default" type="button" (click)="openMaterialsEditor()" data-test="edit-materials">
            Изменить состав
          </app-pi-button>
        </div>
        <div class="hairline rounded-sm overflow-x-auto">
          <table class="w-full text-sm min-w-[640px]">
            <thead class="hairline-b">
              <tr>
                <th class="pi-cell eyebrow text-left">Материал</th>
                <th class="pi-cell-numeric eyebrow w-20">Кол-во</th>
                <th class="pi-cell eyebrow w-16">Ед.</th>
                <th class="pi-cell eyebrow w-32 text-left">Габариты (override)</th>
                <th class="pi-cell eyebrow w-20 text-center">Закупка</th>
              </tr>
            </thead>
            <tbody>
              @for (m2 of m.materials; track $index) {
                <tr class="pi-table-row pi-table-row-odd last:border-0">
                  <td class="pi-cell align-top">
                    {{ materialName(m2.materialId) }}
                  </td>
                  <td class="pi-cell-numeric align-top font-mono">{{ m2.quantity }}</td>
                  <td class="pi-cell align-top">{{ m2.unit ?? 'шт' }}</td>
                  <td class="pi-cell align-top text-xs italic empty-cell">{{ overrideDims(m2) }}</td>
                  <td class="pi-cell align-top text-center">{{ m2.isPurchased ? '✓' : '—' }}</td>
                </tr>
              } @empty {
                <app-pi-empty-state [colspan]="5" message="Нет материалов в составе." state="empty" />
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
                <app-pi-empty-state [colspan]="3" message="Нет видов работ в составе." state="empty" />
              }
            </tbody>
          </table>
        </div>
      </app-pi-section>
    }
  `,
})
export class ModuleDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly modulesSvc = inject(ProductModulesService);
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
    url: `${this.baseUrl}/product-modules/${this.idString()}`,
  }));

  protected readonly module = computed<ProductModule | null>(() => this.moduleRes.value() ?? null);
  protected readonly loadError = computed<string | null>(() => {
    const err = this.moduleRes.error() as import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });
  protected readonly moduleDescription = computed<string>(() => {
    const m = this.module();
    if (!m) return '';
    const dims = m.dimensions;
    if (!dims || (dims.width == null && dims.height == null && dims.depth == null)) {
      return `Модуль — ${m.workTypes?.length ?? 0} работ, ${m.materials?.length ?? 0} материалов`;
    }
    const parts: string[] = [];
    if (dims.width != null) parts.push(`W ${dims.width}`);
    if (dims.height != null) parts.push(`H ${dims.height}`);
    if (dims.depth != null) parts.push(`D ${dims.depth}`);
    return `Модуль ${parts.join(' × ')} ${dims.unit ?? ''}`;
  });

  /** photos отдельным сигналом, обновляется через reloadPhotos(). */
  protected readonly photos = signal<ProductModulePhoto[]>([]);

  ngOnInit(): void {
    this.reloadPhotos();
  }

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
    const ref = this.dialog.open(ModuleFormDialogComponent, { data: m, width: 'lg' });
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
      .attach({ productModuleId: mid, url: url.trim(), sortOrder: 0, isMain: this.photos().length === 0 })
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
  protected materialName(materialId: unknown): string {
    if (typeof materialId === 'string') return `(id ${materialId})`;
    if (materialId && typeof materialId === 'object' && 'name' in materialId) {
      return (materialId as { name: string }).name;
    }
    return '—';
  }
  protected overrideDims(m: { overrideDimensions?: { length?: number; width?: number; height?: number; unit?: string } }): string {
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
      data: { moduleId: m._id, materials: m.materials ?? [] },
      width: 'xl',
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.moduleRes.reload();
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
}
