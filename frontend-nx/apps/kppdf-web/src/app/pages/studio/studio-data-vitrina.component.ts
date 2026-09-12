import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, input, OnInit, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiMaterialsService,
  PiModulesService,
  PiProductsService,
  type Material,
  type Product,
  type ProductDetail,
  type ProductModule,
} from '@kppdf/data-access';
import { PiShowcaseCardComponent } from '@kppdf/ui/card';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import {
  createCatalogRegistryDialogHost,
  type CatalogRegistryDialogHost,
} from '../registries/data/catalog-registry-dialog-host';
import {
  createMaterialRegistryDialogHost,
  type MaterialRegistryDialogHost,
} from '../registries/data/material-registry-dialog-host';
import type { MaterialRegistryDialogConfig } from '../registries/data/material-registry-actions';
import type { RegistryActionContext } from '../registries/model/registry.types';

export type StudioShowcaseKind = 'products' | 'modules' | 'parts' | 'materials';

export interface StudioCatalogSelections {
  products: readonly string[];
  modules: readonly string[];
  parts: readonly string[];
  materials: readonly string[];
}

const EMPTY_SELECTIONS: StudioCatalogSelections = { products: [], modules: [], parts: [], materials: [] };

/** Mirrors registries/data/details.registry.ts DETAILS_DIALOG_CONFIG — same material dialog, kind locked to 'part' by the vitrina's own parts filter, not by this config. */
const PARTS_DIALOG_CONFIG: MaterialRegistryDialogConfig = {
  allowKindSelect: true,
  createLabel: 'Создать деталь',
  entityLabel: 'деталь',
};

/** Mirrors registries/data/materials.registry.ts MATERIALS_DIALOG_CONFIG. */
const MATERIALS_DIALOG_CONFIG: MaterialRegistryDialogConfig = {
  lockMaterialKind: 'raw',
  allowKindSelect: false,
  createLabel: 'Создать материал',
  entityLabel: 'материал',
};

/** S27 — витрина каталога, объединённая с панелью «Данные» (заменяет orphan `pi-studio-showcase-panel`). */
@Component({
  selector: 'pi-studio-data-vitrina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiShowcaseCardComponent],
  template: `<section class="vitrina" data-test="studio-data-vitrina">
    <nav class="vitrina-tabs" aria-label="Категория витрины">
      @for (tab of tabs; track tab.kind) {
        <button
          type="button"
          [class.active]="activeKind() === tab.kind"
          [attr.data-test]="'studio-data-vitrina-tab-' + tab.kind"
          (click)="activeKind.set(tab.kind)"
        >
          {{ tab.label }}
        </button>
      }
    </nav>
    <input
      class="vitrina-search"
      type="search"
      placeholder="Поиск"
      [value]="search()"
      (input)="search.set($any($event.target).value)"
      data-test="studio-data-vitrina-search"
    />
    <div class="vitrina-grid" data-test="studio-data-vitrina-grid">
      @for (item of visibleItems(); track item.id) {
        <app-pi-showcase-card
          size="sm"
          [title]="item.title"
          [description]="item.subtitle"
          [mediaUrl]="item.mediaUrl"
          [class.is-selected]="item.selected"
          [attr.data-test]="'studio-data-vitrina-card'"
        >
          <div sc-actions-sm class="vitrina-actions">
            <button
              type="button"
              class="vitrina-btn vitrina-btn--edit"
              data-test="studio-data-vitrina-edit"
              (click)="edit(item.id)"
            >
              Изменить
            </button>
            @if (item.selected) {
              <span class="vitrina-badge" data-test="studio-data-vitrina-badge">Выбрано</span>
              <button
                type="button"
                class="vitrina-btn vitrina-btn--remove"
                data-test="studio-data-vitrina-remove"
                [disabled]="busy()"
                (click)="remove(item.id)"
              >
                Убрать
              </button>
            } @else {
              <button
                type="button"
                class="vitrina-btn vitrina-btn--add"
                data-test="studio-data-vitrina-add"
                [disabled]="busy()"
                (click)="add(item.id)"
              >
                Добавить
              </button>
            }
          </div>
        </app-pi-showcase-card>
      }
      @if (loading()) {
        <p class="vitrina-empty">Загрузка…</p>
      }
      @if (!loading() && visibleItems().length === 0) {
        <p class="vitrina-empty">Ничего не найдено.</p>
      }
    </div>
  </section>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow-x: hidden;
      }
      .vitrina {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
        max-width: 100%;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--color-rule);
      }
      .vitrina-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }
      .vitrina-tabs button {
        padding: 6px;
        border: 1px solid var(--color-rule);
        background: var(--color-paper-2);
        color: var(--color-ink);
        cursor: pointer;
        font-size: 11px;
      }
      .vitrina-tabs button.active {
        border-color: var(--color-gold-deep);
        background: var(--color-paper-raised);
      }
      .vitrina-search {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        padding: 7px;
        border: 1px solid var(--color-rule-strong);
        background: var(--color-paper-2);
        color: var(--color-ink);
      }
      .vitrina-grid {
        display: grid;
        min-width: 0;
        max-width: 100%;
        overflow-x: hidden;
        /* TZ-NX-DOCSTUDIO-S41 — size="sm" cards are compact rows (48px media
           + one-line title/desc), not tiles; the panel content column is
           272px (docs/architecture/nx-doc-studio.md § 5 geometry), so a
           single column keeps titles readable. Two/three columns per the
           spec would truncate every title in this width. */
        grid-template-columns: 1fr;
        gap: 6px;
        /* TZ-NX-PO-SWEEP-04 — no artificial cap: the flyout panel body
           (.kp-ws-panel__body) is already the scroll container, so a fixed
           max-height here just cut the list off mid-panel and left a dead
           gap below it. Let the grid grow with its content and the panel's
           own scrollbar carry it. */
      }
      .vitrina-grid app-pi-showcase-card {
        min-width: 0;
        max-width: 100%;
      }
      .vitrina-grid app-pi-showcase-card.is-selected {
        outline: 2px solid var(--color-gold-deep);
        outline-offset: -1px;
      }
      .vitrina-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .vitrina-badge {
        padding: 2px 7px;
        border: 1px solid var(--color-gold-deep);
        border-radius: 999px;
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
      }
      .vitrina-btn {
        padding: 5px 10px;
        border: 1px solid var(--color-rule-strong);
        border-radius: var(--radius-sm);
        background: var(--color-paper-2);
        color: var(--color-ink);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
      .vitrina-btn:hover:not(:disabled) {
        background: var(--color-paper-3);
      }
      .vitrina-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .vitrina-btn--add {
        border-color: var(--color-gold-deep);
      }
      .vitrina-btn--remove {
        color: var(--color-destructive);
        border-color: var(--color-destructive);
      }
      .vitrina-empty {
        font-size: 12px;
        color: var(--color-muted-foreground);
      }
    `,
  ],
})
export class StudioDataVitrinaComponent implements OnInit {
  private readonly productsApi = inject(PiProductsService);
  private readonly modulesApi = inject(PiModulesService);
  private readonly materialsApi = inject(PiMaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** TZ-NX-DOCSTUDIO-VITRINA-EDIT — same dialogs/hosts as /registries, no second form. */
  private readonly catalogDialogHost: CatalogRegistryDialogHost = createCatalogRegistryDialogHost({
    dialog: this.dialog,
    destroyRef: this.destroyRef,
    injector: this.injector,
    modulesService: this.modulesApi,
    productsService: this.productsApi,
  });
  private readonly materialDialogHost: MaterialRegistryDialogHost = createMaterialRegistryDialogHost({
    dialog: this.dialog,
    destroyRef: this.destroyRef,
    injector: this.injector,
    materialsService: this.materialsApi,
  });

  readonly selected = input<StudioCatalogSelections>(EMPTY_SELECTIONS);
  /** TZ-NX-DOCSTUDIO-S41 — true while the parent's write queue has a request in flight. */
  readonly busy = input(false);
  readonly catalogChange = output<{ kind: StudioShowcaseKind; ids: readonly string[] }>();
  /** TZ-NX-DOCSTUDIO-VITRINA-EDIT — fires after a successful edit Save so the parent can heal the A4 sheet's table for this kind (`refreshCatalogTablesOfKind`), not just this card. */
  readonly catalogEntitySaved = output<StudioShowcaseKind>();

  readonly activeKind = signal<StudioShowcaseKind>('products');
  readonly search = signal('');
  readonly loading = signal(false);
  readonly products = signal<Product[]>([]);
  readonly modules = signal<ProductModule[]>([]);
  readonly parts = signal<Material[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly tabs = [
    { kind: 'products' as const, label: 'Изделия' },
    { kind: 'modules' as const, label: 'Модули' },
    { kind: 'parts' as const, label: 'Детали' },
    { kind: 'materials' as const, label: 'Материалы' },
  ];

  ngOnInit(): void {
    this.loading.set(true);
    void Promise.all([
      this.reloadProducts(),
      this.reloadModules(),
      this.reloadParts(),
      this.reloadMaterials(),
    ]).then(() => {
      this.loading.set(false);
    });
  }

  private async reloadProducts(): Promise<void> {
    const res = await firstValueFrom(this.productsApi.list({ limit: 100 }));
    if (res.ok) this.products.set(res.data.items);
  }

  private async reloadModules(): Promise<void> {
    const res = await firstValueFrom(this.modulesApi.list());
    if (res.ok) this.modules.set(res.data);
  }

  private async reloadParts(): Promise<void> {
    const res = await firstValueFrom(this.materialsApi.list({ limit: 100, materialKind: 'part' }));
    if (res.ok) this.parts.set(res.data.items);
  }

  private async reloadMaterials(): Promise<void> {
    const res = await firstValueFrom(this.materialsApi.list({ limit: 100 }));
    if (res.ok) {
      this.materials.set(res.data.items.filter((item) => item.materialKind !== 'part'));
    }
  }

  private reloadKind(kind: StudioShowcaseKind): Promise<void> {
    if (kind === 'products') return this.reloadProducts();
    if (kind === 'modules') return this.reloadModules();
    if (kind === 'parts') return this.reloadParts();
    return this.reloadMaterials();
  }

  /**
   * TZ-NX-DOCSTUDIO-VITRINA-EDIT — opens the same Product/Module/Material
   * form dialog `/registries` uses (reuse via `createCatalogRegistryDialogHost`
   * / `createMaterialRegistryDialogHost`, not a new form). On a successful
   * Save the dialog host calls `ctx.reload()`, which re-fetches this kind's
   * list (refreshes name/SKU/photo on the card) and then emits
   * `catalogEntitySaved` so the parent can heal the A4 sheet's table too.
   */
  edit(id: string): void {
    const kind = this.activeKind();
    const ctx: RegistryActionContext = {
      notify: (message, tone) => {
        if (tone === 'error') this.toast.error(message);
        else this.toast.success(message);
      },
      reload: () => {
        void this.reloadKind(kind).then(() => this.catalogEntitySaved.emit(kind));
      },
    };
    if (kind === 'products') {
      const item = this.products().find((p) => p._id === id);
      if (item) this.catalogDialogHost.openProductEdit(item as unknown as ProductDetail, ctx, false);
      return;
    }
    if (kind === 'modules') {
      const item = this.modules().find((m) => m._id === id);
      if (item) this.catalogDialogHost.openModuleEdit(item, ctx, false);
      return;
    }
    if (kind === 'parts') {
      const item = this.parts().find((m) => m._id === id);
      if (item) this.materialDialogHost.openEdit(item, ctx, PARTS_DIALOG_CONFIG);
      return;
    }
    const item = this.materials().find((m) => m._id === id);
    if (item) this.materialDialogHost.openEdit(item, ctx, MATERIALS_DIALOG_CONFIG);
  }

  readonly visibleItems = () => {
    const kind = this.activeKind();
    const query = this.search().trim().toLocaleLowerCase();
    const selectedIds = this.selected()[kind];
    const matches = (...values: (string | undefined)[]): boolean =>
      !query || values.some((value) => value?.toLocaleLowerCase().includes(query));

    if (kind === 'products') {
      return this.products()
        .filter((item) => matches(item.name, item.sku))
        .map((item) => ({
          id: item._id,
          title: item.name,
          subtitle: item.sku || '—',
          mediaUrl: this.photoUrl(item.photoIds, item.mainPhotoId),
          selected: selectedIds.includes(item._id),
        }));
    }
    if (kind === 'modules') {
      return this.modules()
        .filter((item) => matches(item.name, item.article))
        .map((item) => ({
          id: item._id,
          title: item.name,
          subtitle: item.article || '—',
          mediaUrl: this.photoUrl(item.photoIds, item.mainPhotoId),
          selected: selectedIds.includes(item._id),
        }));
    }
    const source = kind === 'parts' ? this.parts() : this.materials();
    return source
      .filter((item) => matches(item.name, item.article, item.sku))
      .map((item) => ({
        id: item._id,
        title: item.name,
        subtitle: item.article || item.sku || '—',
        mediaUrl: this.photoUrl(item.photoIds, item.mainPhotoId),
        selected: selectedIds.includes(item._id),
      }));
  };

  /**
   * Explicit «Добавить» — repeat add on an already-selected id is a no-op,
   * not a write. `busy()` only disables the button in the DOM (UI affordance);
   * it is NOT re-checked here, because the parent queues every catalogChange
   * onto a serialized write chain (`commitCatalogSelectionChange`) rather than
   * racing it — a click that lands before the disabled attribute repaints must
   * still reach the queue, or rapid adds on different cards would silently
   * drop instead of all landing (TZ-NX-DOCSTUDIO-S41 AC1).
   */
  add(id: string): void {
    const kind = this.activeKind();
    const ids = this.selected()[kind];
    if (ids.includes(id)) return;
    this.catalogChange.emit({ kind, ids: [...ids, id] });
  }

  /** Explicit «Убрать» — no-op if the id isn't in the selection. See `add()` re: `busy()`. */
  remove(id: string): void {
    const kind = this.activeKind();
    const ids = this.selected()[kind];
    if (!ids.includes(id)) return;
    this.catalogChange.emit({ kind, ids: ids.filter((item) => item !== id) });
  }

  /**
   * TZ-NX-PO-SWEEP-04: list endpoints don't always populate `photoIds`/
   * `mainPhotoId` (bare ObjectId strings) — treating a bare id as a URL
   * always 404s. Only resolve from populated refs (mirrors the same
   * WAVE-NX-CATALOG-PHOTOS resolution `production-read.facade.ts` uses for
   * list/tree surfaces); unresolved → '' → the showcase card shows its
   * placeholder instead of a broken `<img>`.
   */
  private photoUrl(
    photoIds: readonly (string | Record<string, unknown>)[] | undefined,
    mainPhotoId: string | Record<string, unknown> | null | undefined,
  ): string {
    type PhotoRefLike = {
      _id?: string;
      storageUrl?: string;
      variant?: string;
      parentPhotoId?: string;
      linkedPhotoId?: string;
    };
    const asPhotoRef = (value: unknown): PhotoRefLike | null => {
      if (!value || typeof value !== 'object') return null;
      const candidate = value as PhotoRefLike;
      return typeof candidate.storageUrl === 'string' && candidate.storageUrl.trim() ? candidate : null;
    };
    const photos = (photoIds ?? []).map(asPhotoRef).filter((p): p is PhotoRefLike => p != null);
    const main = asPhotoRef(mainPhotoId);
    const mainId = typeof mainPhotoId === 'string' ? mainPhotoId : main?._id;
    const selected = main ?? (mainId ? photos.find((p) => p._id === mainId) : undefined) ?? photos[0];
    if (!selected) return '';
    if (selected.variant === 'thumb') return selected.storageUrl!;
    const linkedThumb = photos.find(
      (p) => p.variant === 'thumb' && (p.parentPhotoId === selected._id || p.linkedPhotoId === selected._id),
    );
    return linkedThumb?.storageUrl ?? selected.storageUrl!;
  }
}
