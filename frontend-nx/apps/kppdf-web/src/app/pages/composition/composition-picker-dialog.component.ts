import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiModulesService,
  PiProductsService,
  type CompositionLineType,
  type CompositionParentKind,
  type Material,
  type Product,
  type ProductModule,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { PiOverflowSelectComponent, type PiOverflowSelectItem } from '@kppdf/ui/overflow-select';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  allowedLineTypes,
  isMaterialKindAllowedForParent,
  lineTypeLabel,
} from './composition-tree.contract';

export interface CompositionPickerResult {
  lineType: CompositionLineType;
  refId: string;
  quantity: number;
  unit?: string;
}

export interface CompositionPickerDialogData {
  parentKind: CompositionParentKind;
  parentId: string;
  onAdded?: (result: CompositionPickerResult) => void | Promise<void>;
}

type PickerTab = CompositionLineType;

@Component({
  selector: 'pi-composition-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, ButtonComponent, PiOverflowSelectComponent],
  template: `
    <app-pi-dialog title="Добавить в состав" variant="content" [maxWidth]="'min(1120px, calc(100vw - 2rem))'">
      <div body class="space-y-4" data-test="composition-picker">
        <div class="grid gap-1 hairline rounded-sm p-1" [style.grid-template-columns]="'repeat(' + visibleKinds().length + ', 1fr)'" role="tablist">
          @for (kind of visibleKinds(); track kind) {
            <button
              type="button"
              role="tab"
              class="px-2 py-2 text-sm rounded-sm transition-colors text-center"
              [class.bg-paper-2]="activeKind() === kind"
              [class.font-medium]="activeKind() === kind"
              [attr.aria-selected]="activeKind() === kind"
              (click)="selectKind(kind)"
              [attr.data-test]="'composition-picker-tab-' + kind"
            >
              {{ lineTypeLabel(kind) }}
            </button>
          }
        </div>

        @if (loading()) {
          <p role="status" class="text-xs text-muted-foreground py-4 text-center">Загрузка каталога…</p>
        }
        @if (error()) {
          <p role="alert" class="text-sm text-destructive" data-test="composition-picker-error">{{ error() }}</p>
          <app-pi-button type="button" variant="outline" size="sm" (click)="loadCatalog()">Повторить</app-pi-button>
        }

        @if (!loading() && !error()) {
          @if (activeKind() === 'material') {
            <div class="flex flex-wrap gap-1" role="group" aria-label="Фильтр материалов">
              @for (f of materialFilters(); track f.key) {
                <button
                  type="button"
                  class="px-2 py-1 text-xs rounded-sm hairline transition-colors"
                  [class.bg-paper-2]="materialFilter() === f.key"
                  [class.font-medium]="materialFilter() === f.key"
                  (click)="materialFilter.set(f.key)"
                  [attr.data-test]="'composition-picker-mat-filter-' + f.key"
                >
                  {{ f.label }}
                </button>
              }
            </div>
          }

          <label class="block">
            <span class="eyebrow block mb-1.5">Поиск</span>
            <input
              class="pi-input w-full"
              type="search"
              [value]="query()"
              (input)="onQuery($event)"
              placeholder="Название или артикул"
              data-test="composition-picker-search"
            />
          </label>

          <app-pi-overflow-select
            [items]="filteredItems()"
            [value]="selectedId() ?? ''"
            (valueChange)="selectedId.set($event)"
            searchable="auto"
            placeholder="— выбрать —"
            ariaLabel="Что добавить"
            dataTest="composition-picker-select"
          />

          <label class="block max-w-[10rem]">
            <span class="eyebrow block mb-1.5">Кол-во</span>
            <input
              class="pi-input w-full"
              type="number"
              min="0.001"
              step="0.001"
              [value]="quantity()"
              (input)="onQuantity($event)"
              data-test="composition-picker-quantity"
            />
          </label>

          <label class="block max-w-[10rem]">
            <span class="eyebrow block mb-1.5">Единица</span>
            <input
              class="pi-input w-full"
              type="text"
              [value]="unit()"
              (input)="onUnit($event)"
              data-test="composition-picker-unit"
            />
          </label>

          @if (validationError()) {
            <p role="alert" class="text-xs text-destructive" data-test="composition-picker-validation">{{ validationError() }}</p>
          }
        }
      </div>

      <div footer class="flex gap-3 justify-end">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onAdd(false)" data-test="composition-picker-add">
          {{ submitting() ? 'Добавление…' : 'Добавить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" [disabled]="submitting()" (click)="onAdd(true)" data-test="composition-picker-add-continue">
          Добавить и ещё
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="composition-picker-cancel">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class CompositionPickerDialogComponent implements OnInit {
  protected readonly lineTypeLabel = lineTypeLabel;

  private readonly data = inject<CompositionPickerDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<CompositionPickerResult | null>>(PI_DIALOG_REF);
  private readonly modulesService = inject(PiModulesService);
  private readonly materialsService = inject(PiMaterialsService);
  private readonly productsService = inject(PiProductsService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly query = signal('');
  protected readonly quantity = signal(1);
  protected readonly unit = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly validationError = signal<string | null>(null);
  protected readonly activeKind = signal<PickerTab>('module');
  protected readonly materialFilter = signal<'all' | 'raw' | 'part'>('all');

  private modules: ProductModule[] = [];
  private materials: Material[] = [];
  private products: Product[] = [];

  protected visibleKinds(): CompositionLineType[] {
    return allowedLineTypes(this.data.parentKind);
  }

  ngOnInit(): void {
    const kinds = this.visibleKinds();
    this.activeKind.set(kinds[0] ?? 'module');
    void this.loadCatalog();
  }

  protected selectKind(kind: PickerTab): void {
    this.activeKind.set(kind);
    this.materialFilter.set('all');
    this.selectedId.set(null);
    this.validationError.set(null);
  }

  protected materialFilters(): { key: 'all' | 'raw' | 'part'; label: string }[] {
    return [
      { key: 'all', label: 'Все' },
      { key: 'part', label: 'Детали' },
      { key: 'raw', label: 'Сырьё' },
    ];
  }

  protected async loadCatalog(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const [mods, mats, prods] = await Promise.all([
      firstValueFrom(this.modulesService.list()),
      firstValueFrom(this.materialsService.list({ limit: 100 })),
      this.data.parentKind === 'product'
        ? firstValueFrom(this.productsService.list({ limit: 100 }))
        : Promise.resolve({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 100 } }),
    ]);
    this.loading.set(false);
    if (!mods.ok) {
      this.error.set(extractErrorMessage(mods.error));
      return;
    }
    if (!mats.ok) {
      this.error.set(extractErrorMessage(mats.error));
      return;
    }
    if (!prods.ok) {
      this.error.set(extractErrorMessage(prods.error));
      return;
    }
    this.modules = mods.data;
    this.materials = mats.data.items;
    this.products = prods.ok ? prods.data.items : [];
  }

  protected filteredItems(): PiOverflowSelectItem[] {
    const q = this.query().trim().toLowerCase();
    const kind = this.activeKind();
    let items: PiOverflowSelectItem[] = [];
    if (kind === 'module') {
      items = this.modules
        .filter((m) => m._id !== this.data.parentId)
        .map((m) => ({ id: m._id, label: m.name, meta: m.article }));
    } else if (kind === 'material') {
      const filter = this.materialFilter();
      items = this.materials
        .filter((m) => isMaterialKindAllowedForParent(this.data.parentKind, m.materialKind))
        .filter((m) => {
          if (filter === 'all') return true;
          if (filter === 'raw') return m.materialKind === 'raw' || m.materialKind == null;
          return m.materialKind === 'part' || m.materialKind === 'fastener' || m.materialKind === 'purchased' || m.materialKind === 'other';
        })
        .map((m) => ({
          id: m._id,
          label: m.name,
          meta: `${m.materialKind === 'part' || m.materialKind === 'fastener' ? 'дет.' : 'мат.'} · ${m.article ?? m.unit}`,
        }));
    } else {
      items = this.products
        .filter((p) => p._id !== this.data.parentId)
        .map((p) => ({ id: p._id, label: p.name, meta: p.sku ?? p.unit }));
    }
    if (!q) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || (i.meta?.toLowerCase().includes(q) ?? false),
    );
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onQuantity(event: Event): void {
    this.quantity.set(Number((event.target as HTMLInputElement).value));
  }

  protected onUnit(event: Event): void {
    this.unit.set((event.target as HTMLInputElement).value);
  }

  protected onCancel(): void {
    this.ref.close(null);
  }

  protected async onAdd(continueAdding: boolean): Promise<void> {
    this.validationError.set(null);
    const refId = this.selectedId();
    const qty = this.quantity();
    if (!refId) {
      this.validationError.set('Выберите позицию из каталога');
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      this.validationError.set('Укажите количество больше нуля');
      return;
    }
    const result: CompositionPickerResult = {
      lineType: this.activeKind(),
      refId,
      quantity: qty,
      unit: this.unit().trim() || undefined,
    };
    this.submitting.set(true);
    try {
      await this.data.onAdded?.(result);
    } catch (e) {
      this.validationError.set(e instanceof Error ? e.message : 'Не удалось добавить строку');
      this.submitting.set(false);
      return;
    }
    this.submitting.set(false);
    if (continueAdding) {
      this.selectedId.set(null);
      this.quantity.set(1);
      return;
    }
    this.ref.close(result);
  }
}
