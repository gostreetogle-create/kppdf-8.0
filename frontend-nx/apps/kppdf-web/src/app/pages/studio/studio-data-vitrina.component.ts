import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService, type Material, type Product, type ProductModule } from '@kppdf/data-access';
import { PiShowcaseCardComponent } from '@kppdf/ui/card';

export type StudioShowcaseKind = 'products' | 'modules' | 'parts' | 'materials';

export interface StudioCatalogSelections {
  products: readonly string[];
  modules: readonly string[];
  parts: readonly string[];
  materials: readonly string[];
}

const EMPTY_SELECTIONS: StudioCatalogSelections = { products: [], modules: [], parts: [], materials: [] };

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
          size="md"
          [title]="item.title"
          [description]="item.subtitle"
          [mediaUrl]="item.mediaUrl"
          [badge]="item.selected ? 'Выбрано' : ''"
          [interactive]="true"
          [arrow]="false"
          [class.is-selected]="item.selected"
          [attr.data-test]="'studio-data-vitrina-card'"
          (click)="toggle(item.id)"
        />
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
      }
      .vitrina {
        display: flex;
        flex-direction: column;
        gap: 10px;
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
        padding: 7px;
        border: 1px solid var(--color-rule-strong);
        background: var(--color-paper-2);
        color: var(--color-ink);
      }
      .vitrina-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        max-height: 480px;
        overflow: auto;
      }
      .vitrina-grid app-pi-showcase-card.is-selected {
        outline: 2px solid var(--color-gold-deep);
        outline-offset: -1px;
      }
      .vitrina-empty {
        grid-column: 1 / -1;
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

  readonly selected = input<StudioCatalogSelections>(EMPTY_SELECTIONS);
  readonly catalogChange = output<{ kind: StudioShowcaseKind; ids: readonly string[] }>();

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
    Promise.all([
      firstValueFrom(this.productsApi.list({ limit: 100 })),
      firstValueFrom(this.modulesApi.list()),
      firstValueFrom(this.materialsApi.list({ limit: 100, materialKind: 'part' })),
      firstValueFrom(this.materialsApi.list({ limit: 100 })).then((result) =>
        result.ok
          ? { ...result, data: { ...result.data, items: result.data.items.filter((item) => item.materialKind !== 'part') } }
          : result,
      ),
    ]).then(([products, modules, parts, materials]) => {
      if (products.ok) this.products.set(products.data.items);
      if (modules.ok) this.modules.set(modules.data);
      if (parts.ok) this.parts.set(parts.data.items);
      if (materials.ok) this.materials.set(materials.data.items);
      this.loading.set(false);
    });
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
          mediaUrl: this.photoUrl(item.photoIds),
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
          mediaUrl: this.photoUrl(item.photoIds),
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
        mediaUrl: this.photoUrl(item.photoIds ?? (item.mainPhotoId ? [item.mainPhotoId] : undefined)),
        selected: selectedIds.includes(item._id),
      }));
  };

  toggle(id: string): void {
    const kind = this.activeKind();
    const ids = [...this.selected()[kind]];
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    this.catalogChange.emit({ kind, ids: next });
  }

  private photoUrl(photoIds: readonly (string | Record<string, unknown>)[] | undefined): string {
    const first = photoIds?.[0];
    if (!first) return '';
    if (typeof first === 'string') return first;
    const value = first['storageUrl'] ?? first['url'] ?? first['thumbnailUrl'];
    return typeof value === 'string' && value.trim() ? value : '';
  }
}
