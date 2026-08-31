import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiMaterialsService, PiModulesService, PiProductsService, type Material, type Product, type ProductModule } from '@kppdf/data-access';

export type StudioShowcaseKind = 'products' | 'modules' | 'parts' | 'materials';

@Component({
  selector: 'pi-studio-showcase-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="showcase" data-test="studio-showcase">
    <h2>Витрина</h2>
    <nav class="tabs" aria-label="Категория витрины">
      @for (tab of tabs; track tab.kind) {
        <button type="button" [class.active]="activeKind() === tab.kind" [attr.data-test]="'studio-showcase-tab-' + tab.kind" (click)="activeKind.set(tab.kind)">{{ tab.label }}</button>
      }
    </nav>
    <input class="search" type="search" placeholder="Поиск" [value]="search()" (input)="search.set($any($event.target).value)" data-test="studio-showcase-search" />
    <div class="items">
      @if (activeKind() === 'products') { @for (item of filteredProducts(); track item._id) { <label class="item"><input type="checkbox" [checked]="selected().products.includes(item._id)" (change)="toggle('products', item._id, $event)" /><span>{{ item.name }}</span><small>{{ item.sku || '—' }}</small></label> } }
      @if (activeKind() === 'modules') { @for (item of filteredModules(); track item._id) { <label class="item"><input type="checkbox" [checked]="selected().modules.includes(item._id)" (change)="toggle('modules', item._id, $event)" /><span>{{ item.name }}</span><small>{{ item.article }}</small></label> } }
      @if (activeKind() === 'parts' || activeKind() === 'materials') { @for (item of filteredMaterials(); track item._id) { <label class="item"><input type="checkbox" [checked]="selected()[activeKind()].includes(item._id)" (change)="toggle(activeKind(), item._id, $event)" /><span>{{ item.name }}</span><small>{{ item.article || item.sku || '—' }}</small></label> } }
      @if (loading()) { <p>Загрузка…</p> }
      @if (!loading() && visibleCount() === 0) { <p class="empty">Ничего не найдено.</p> }
    </div>
  </section>`,
  styles: [`:host{display:block}.showcase{display:flex;flex-direction:column;gap:10px}.showcase h2{margin:12px 0 0;font-size:16px}.tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px}.tabs button{padding:6px;border:1px solid var(--color-rule);background:var(--color-paper-2);color:var(--color-ink);cursor:pointer;font-size:11px}.tabs button.active{border-color:var(--color-gold-deep);background:var(--color-paper-raised)}.search{padding:7px;border:1px solid var(--color-rule-strong);background:var(--color-paper-2);color:var(--color-ink)}.items{display:flex;flex-direction:column;gap:4px;max-height:360px;overflow:auto}.item{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:6px;border-bottom:1px solid var(--color-rule);font-size:12px}.item small{color:var(--color-muted-foreground)}.empty{font-size:12px;color:var(--color-muted-foreground)}`],
})
export class StudioShowcasePanelComponent implements OnInit {
  private readonly productsApi = inject(PiProductsService);
  private readonly modulesApi = inject(PiModulesService);
  private readonly materialsApi = inject(PiMaterialsService);
  readonly selected = input<{ products: readonly string[]; modules: readonly string[]; parts: readonly string[]; materials: readonly string[] }>({ products: [], modules: [], parts: [], materials: [] });
  readonly selectionChange = output<{ kind: StudioShowcaseKind; ids: readonly string[] }>();
  readonly activeKind = signal<StudioShowcaseKind>('products');
  readonly search = signal('');
  readonly loading = signal(false);
  readonly products = signal<Product[]>([]);
  readonly modules = signal<ProductModule[]>([]);
  readonly parts = signal<Material[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly tabs = [{ kind: 'products' as const, label: 'Изделия' }, { kind: 'modules' as const, label: 'Модули' }, { kind: 'parts' as const, label: 'Детали' }, { kind: 'materials' as const, label: 'Материалы' }];

  ngOnInit(): void {
    this.loading.set(true);
    Promise.all([
      firstValueFrom(this.productsApi.list({ limit: 100 })),
      firstValueFrom(this.modulesApi.list()),
      firstValueFrom(this.materialsApi.list({ limit: 100, materialKind: 'part' })),
      firstValueFrom(this.materialsApi.list({ limit: 100 })).then((result) => result.ok ? { ...result, data: { ...result.data, items: result.data.items.filter((item) => item.materialKind !== 'part') } } : result),
    ]).then(([products, modules, parts, materials]) => {
      if (products.ok) this.products.set(products.data.items);
      if (modules.ok) this.modules.set(modules.data);
      if (parts.ok) this.parts.set(parts.data.items);
      if (materials.ok) this.materials.set(materials.data.items);
      this.loading.set(false);
    });
  }

  filteredProducts = () => this.products().filter((item) => this.matches(item.name, item.sku));
  filteredModules = () => this.modules().filter((item) => this.matches(item.name, item.article));
  filteredMaterials = () => (this.activeKind() === 'parts' ? this.parts() : this.materials()).filter((item) => this.matches(item.name, item.article, item.sku));
  visibleCount = () => this.activeKind() === 'products' ? this.filteredProducts().length : this.activeKind() === 'modules' ? this.filteredModules().length : this.filteredMaterials().length;

  private matches(...values: (string | undefined)[]): boolean { const query = this.search().trim().toLocaleLowerCase(); return !query || values.some((value) => value?.toLocaleLowerCase().includes(query)); }
  toggle(kind: StudioShowcaseKind, id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = [...this.selected()[kind]];
    const next = checked ? [...new Set([...ids, id])] : ids.filter((item) => item !== id);
    this.selectionChange.emit({ kind, ids: next });
  }
}
