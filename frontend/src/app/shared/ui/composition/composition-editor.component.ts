import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  CompositionTreeNode,
  CompositionLine,
  CompositionLineUpsertDto,
  ProductModule,
  ProductModulesService,
} from '../../services/pi-product-modules.service';
import { Material, MATERIAL_KIND_LABELS, MaterialsService } from '../../services/materials.service';
import { Product, ProductsService } from '../../services/products.service';
import { extractErrorMessage } from '../../../core/silent-http';
import { PiToastService } from '../toast';
import { ButtonComponent } from '../button/button.component';
import { CompositionTreeComponent } from './composition-tree.component';

export type CompositionEditorParent = 'product' | 'module';

type CatalogOption = { id: string; label: string };

@Component({
  selector: 'app-composition-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CompositionTreeComponent],
  template: `
    <section class="space-y-3" data-test="composition-editor">
      @if (isComplex()) {
        <span
          class="inline-flex items-center px-2 py-1 text-xs hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
          data-test="composition-complex-badge"
          >Комплекс</span
        >
      }
      @if (warning()) {
        <p
          class="px-3 py-2 text-xs text-sunrise-warm hairline rounded-sm"
          role="status"
          data-test="composition-depth-warning"
        >
          {{ warning() }}
        </p>
      }
      @if (error()) {
        <p
          class="px-3 py-2 text-sm text-destructive hairline rounded-sm"
          role="alert"
          data-test="composition-error"
        >
          {{ error() }}
        </p>
      }
      @if (loading()) {
        <p class="py-2 text-center text-xs text-muted-foreground" role="status">
          Обновление состава…
        </p>
      }
      <app-composition-tree [root]="treeWithKinds()" (expandedChange)="onExpand($event)" />
      @if (lines().length > 0) {
        <div class="space-y-2" data-test="composition-editor-lines">
          <p class="eyebrow">Количество в составе</p>
          @for (line of lines(); track line._id) {
            <div class="flex flex-wrap items-center gap-2 hairline rounded-sm px-3 py-2">
              <span class="min-w-32 flex-1 text-sm">{{ lineLabel(line) }}</span>
              <input
                class="pi-input w-24"
                type="number"
                min="0.0001"
                [value]="line.quantity"
                [attr.aria-label]="'Количество ' + lineLabel(line)"
                (change)="updateQuantity(line, $event)"
                data-test="composition-quantity"
              />
              <app-pi-button
                variant="destructive"
                size="sm"
                type="button"
                (click)="removeLine(line)"
                data-test="composition-remove"
                >Удалить</app-pi-button
              >
            </div>
          }
        </div>
      }
      <div
        class="hairline rounded-sm p-3 space-y-3 bg-paper-2/40"
        data-test="composition-editor-add"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="eyebrow m-0">Добавить в состав</p>
          <app-pi-button
            variant="outline"
            size="sm"
            type="button"
            (click)="reload()"
            data-test="composition-reload"
          >
            Обновить
          </app-pi-button>
        </div>
        <p class="text-xs text-muted-foreground m-0">
          @if (parentKind() === 'product') {
            Можно: модуль, деталь/метиз/покупное, другое изделие (станет комплексом). Сырьё — только
            через модуль.
          } @else {
            Можно: дочерний модуль или материал/деталь. Изделие в модуль класть нельзя.
          }
        </p>
        <label class="block">
          <span class="eyebrow block mb-1">Поиск</span>
          <input
            class="pi-input w-full"
            type="search"
            [value]="catalogQuery()"
            (input)="onCatalogQuery($event)"
            placeholder="Название или артикул…"
            data-test="composition-catalog-search"
          />
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-[8rem_1fr_6rem_auto] gap-2 items-end">
          <label class="block">
            <span class="eyebrow block mb-1">Тип</span>
            <select
              class="pi-input w-full"
              [value]="draftType()"
              (change)="onTypeChange($event)"
              data-test="composition-line-type"
            >
              @for (type of allowedLineTypes(); track type) {
                <option [value]="type">{{ lineTypeLabel(type) }}</option>
              }
            </select>
          </label>
          <label class="block min-w-0">
            <span class="eyebrow block mb-1">Элемент</span>
            <select
              class="pi-input w-full"
              [value]="draftRefId()"
              (change)="onRefSelect($event)"
              data-test="composition-ref-select"
            >
              <option value="">— выбрать —</option>
              @for (opt of filteredCatalogOptions(); track opt.id) {
                <option [value]="opt.id">{{ opt.label }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="eyebrow block mb-1">Кол-во</span>
            <input
              class="pi-input w-full"
              type="number"
              min="0.0001"
              [value]="draftQuantity()"
              (input)="onQuantityChange($event)"
              data-test="composition-draft-quantity"
            />
          </label>
          <app-pi-button
            variant="default"
            size="sm"
            type="button"
            (click)="addDraftLine()"
            [disabled]="!draftRefId()"
            data-test="composition-add"
          >
            Добавить
          </app-pi-button>
        </div>
        @if (filteredCatalogOptions().length === 0 && catalogQuery().trim()) {
          <p class="text-xs text-muted-foreground m-0">Ничего не найдено по запросу.</p>
        }
      </div>
    </section>
  `,
})
export class CompositionEditorComponent {
  readonly parentId = input.required<string>();
  readonly parentKind = input.required<CompositionEditorParent>();

  protected readonly tree = signal<CompositionTreeNode | null>(null);
  protected readonly treeWithKinds = computed(() => this.enrichMaterialKinds(this.tree()));
  protected readonly lines = signal<CompositionLine[]>([]);
  protected readonly loading = signal(false);
  protected readonly warning = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly isComplex = computed(
    () =>
      this.parentKind() === 'product' &&
      (this.tree()?.children ?? []).some((child) => child.kind === 'product'),
  );
  private readonly requestedDepth = signal(1);
  protected readonly draftType = signal<CompositionLineUpsertDto['lineType']>('module');
  protected readonly draftRefId = signal('');
  protected readonly draftQuantity = signal('1');
  protected readonly catalogQuery = signal('');
  private readonly materials = signal<Material[]>([]);
  private readonly modules = signal<ProductModule[]>([]);
  private readonly products = signal<Product[]>([]);

  private readonly service = inject(ProductModulesService);
  private readonly materialsService = inject(MaterialsService);
  private readonly productsService = inject(ProductsService);
  private readonly toast = inject(PiToastService);

  protected readonly catalogOptions = computed<CatalogOption[]>(() => {
    const type = this.draftType();
    const selfId = this.parentId();
    if (type === 'module') {
      return this.modules()
        .filter((m) => m._id !== selfId)
        .map((m) => ({
          id: m._id,
          label: `${m.name}${m.article ? ' · ' + m.article : ''}`,
        }));
    }
    if (type === 'material') {
      const list =
        this.parentKind() === 'product'
          ? this.materials().filter((m) => m.materialKind !== 'raw')
          : this.materials();
      return list.map((m) => ({
        id: m._id,
        label: `${m.name}${m.materialKind ? ' · ' + (MATERIAL_KIND_LABELS[m.materialKind] ?? m.materialKind) : ''}`,
      }));
    }
    return this.products()
      .filter((p) => p._id !== selfId)
      .map((p) => ({
        id: p._id,
        label: `${p.name}${p.sku ? ' · SKU ' + p.sku : ''}`,
      }));
  });

  protected readonly filteredCatalogOptions = computed(() => {
    const q = this.catalogQuery().trim().toLowerCase();
    const opts = this.catalogOptions();
    if (!q) return opts.slice(0, 200);
    return opts.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 200);
  });

  constructor() {
    this.materialsService.list({ limit: 200 }).subscribe((response) => {
      if (response.ok) this.materials.set(response.data.items);
    });
    this.service.list().subscribe((response) => {
      if (response.ok) this.modules.set(response.data);
    });
    this.productsService.list({ limit: 200 }).subscribe((response) => {
      if (response.ok) this.products.set(response.data.items);
    });
    effect(() => {
      const id = this.parentId();
      if (id) this.load();
    });
  }

  /** Public for parent pages after external picker. */
  reload(): void {
    this.load();
  }

  protected allowedLineTypes(): CompositionLineUpsertDto['lineType'][] {
    return this.parentKind() === 'product'
      ? ['module', 'material', 'product']
      : ['module', 'material'];
  }

  protected lineTypeLabel(type: CompositionLineUpsertDto['lineType']): string {
    return type === 'product' ? 'Изделие' : type === 'module' ? 'Модуль' : 'Материал / деталь';
  }

  protected lineLabel(line: CompositionLine): string {
    const type = this.lineTypeLabel(line.lineType);
    if (line.lineType === 'module') {
      const mod = this.modules().find((item) => item._id === line.refId);
      return mod ? `${type} · ${mod.name}` : `${type} · ${line.refId}`;
    }
    if (line.lineType === 'product') {
      const prod = this.products().find((item) => item._id === line.refId);
      return prod ? `${type} · ${prod.name}` : `${type} · ${line.refId}`;
    }
    const material = this.materials().find((item) => item._id === line.refId);
    return material ? `${type} · ${material.name}` : `${type} · ${line.refId}`;
  }

  protected onTypeChange(event: Event): void {
    this.draftType.set(
      (event.target as HTMLSelectElement).value as CompositionLineUpsertDto['lineType'],
    );
    this.draftRefId.set('');
    this.catalogQuery.set('');
  }

  protected onCatalogQuery(event: Event): void {
    this.catalogQuery.set((event.target as HTMLInputElement).value);
  }

  protected onRefSelect(event: Event): void {
    this.draftRefId.set((event.target as HTMLSelectElement).value);
  }

  protected onQuantityChange(event: Event): void {
    this.draftQuantity.set((event.target as HTMLInputElement).value);
  }

  protected addDraftLine(): void {
    const refId = this.draftRefId().trim();
    const quantity = Number(this.draftQuantity());
    const lineType = this.draftType();
    if (!refId || !Number.isFinite(quantity) || quantity <= 0) {
      this.showMessage('Выберите элемент и укажите положительное количество.');
      return;
    }
    if (lineType === 'product' && this.parentKind() === 'module') {
      this.showMessage('Изделие нельзя добавить в состав модуля.');
      return;
    }
    if ((lineType === 'module' || lineType === 'product') && refId === this.parentId()) {
      this.showMessage('Нельзя добавить элемент в состав самого себя.');
      return;
    }
    if (lineType === 'material') {
      const material = this.materials().find((item) => item._id === refId);
      if (this.parentKind() === 'product' && material?.materialKind === 'raw') {
        this.showMessage('Сырьё нельзя добавить непосредственно в состав изделия.');
        return;
      }
    }
    const dto: CompositionLineUpsertDto = { lineType, refId, quantity };
    const request =
      this.parentKind() === 'product'
        ? this.service.addProductCompositionLine(this.parentId(), dto)
        : this.service.addModuleCompositionLine(this.parentId(), dto);
    request.subscribe((response) => {
      if (response.ok) {
        this.draftRefId.set('');
        this.draftQuantity.set('1');
        this.load();
      } else {
        this.showMessage(extractErrorMessage(response.error));
      }
    });
  }

  protected updateQuantity(line: CompositionLine, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.showMessage('Количество должно быть положительным.');
      return;
    }
    const request =
      this.parentKind() === 'product'
        ? this.service.updateProductCompositionLine(this.parentId(), line._id, { quantity })
        : this.service.updateModuleCompositionLine(this.parentId(), line._id, { quantity });
    request.subscribe((response) =>
      response.ok ? this.load() : this.showMessage(extractErrorMessage(response.error)),
    );
  }

  protected removeLine(line: CompositionLine): void {
    const request =
      this.parentKind() === 'product'
        ? this.service.removeProductCompositionLine(this.parentId(), line._id)
        : this.service.removeModuleCompositionLine(this.parentId(), line._id);
    request.subscribe((response) =>
      response.ok ? this.load() : this.showMessage(extractErrorMessage(response.error)),
    );
  }

  protected onExpand(event: { node: CompositionTreeNode; expanded: boolean }): void {
    if (!event.expanded) return;
    const depth = this.depthOf(event.node);
    if (depth < 0) return;
    if (depth > 5) {
      this.warning.set(
        'Глубина состава больше 5 уровней. Проверьте структуру перед дальнейшим расширением.',
      );
    }
    const nextDepth = Math.min(8, Math.max(1, depth + 2));
    if (nextDepth > this.requestedDepth()) {
      this.requestedDepth.set(nextDepth);
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    const treeRequest =
      this.parentKind() === 'product'
        ? this.service.getProductTree(this.parentId(), this.requestedDepth())
        : this.service.getModuleTree(this.parentId(), this.requestedDepth());
    const lineRequest =
      this.parentKind() === 'product'
        ? this.service.getProductComposition(this.parentId())
        : this.service.getModuleComposition(this.parentId());
    let treeDone = false;
    let lineDone = false;
    const finish = (): void => {
      if (treeDone && lineDone) this.loading.set(false);
    };
    treeRequest.subscribe((response) => {
      treeDone = true;
      if (response.ok) this.tree.set(response.data);
      else {
        this.tree.set(null);
        this.showMessage(extractErrorMessage(response.error));
      }
      finish();
    });
    lineRequest.subscribe((response) => {
      lineDone = true;
      if (response.ok) this.lines.set(response.data);
      else this.lines.set([]);
      finish();
    });
  }

  private depthOf(target: CompositionTreeNode, node = this.tree(), depth = 0): number {
    if (!node) return -1;
    if (node._id === target._id) return depth;
    for (const child of node.children) {
      const result = this.depthOf(target, child, depth + 1);
      if (result !== -1) return result;
    }
    return -1;
  }

  private enrichMaterialKinds(node: CompositionTreeNode | null): CompositionTreeNode | null {
    if (!node) return null;
    const material =
      node.kind === 'material' ? this.materials().find((item) => item._id === node._id) : undefined;
    return {
      ...node,
      materialKind: node.materialKind ?? material?.materialKind,
      children: node.children.map((child) => this.enrichMaterialKinds(child)!),
    };
  }

  private showMessage(message: string): void {
    this.error.set(message);
    this.toast.error(message);
  }
}
