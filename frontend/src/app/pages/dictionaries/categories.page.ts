import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CLASSIFICATION_CHIPS, DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import { PiDialogService, type DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { AlertDialogComponent } from '../../shared/ui/dialog/pi-alert-dialog.component';
import { PiToastService } from '../../shared/ui/toast';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../core/silent-http';
import { API_BASE_URL } from '../../core/api.tokens';
import { createSearchState } from '../../shared/util/search';
import { pluralize } from '../../shared/util/format';
import { moveItemInArray } from '../../shared/util/move-item-in-array';
import {
  Category,
  CategoryTreeNode,
  CategoriesService,
} from '../../shared/services/categories.service';
import { CategoryFormDialogComponent } from './category-form-dialog.component';
import { ColumnDef } from '../../shared/ui/pi-table.component';
import { PiTableTreeComponent, TreeDropEvent } from '../../shared/ui/pi-table-tree.component';

const TYPE_LABELS: Record<Category['type'], string> = {
  material: 'Материал',
  product: 'Продукция',
  general: 'Общая',
};
type TypeFilter = 'all' | Category['type'];

/** TZ-UI-TABLE-302 — Categories body uses the shared Tree table-kit variant. */
@Component({
  selector: 'app-categories-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiTableTreeComponent, PiGroupWorkspaceComponent, ButtonComponent],
  template: `
    <app-pi-group-workspace
      [toc]="toc"
      tocActiveId="classification"
      [chips]="chips"
      activeId="categories"
    >
      @if (error()) {
        <div
          role="alert"
          class="mb-4 border hairline border-destructive rounded-sm px-4 py-3 text-xs text-destructive"
        >
          {{ error() }}
        </div>
      }
      <div tools class="flex items-center gap-form-field flex-wrap w-full">
        <input
          type="search"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          placeholder="Поиск по названию…"
          aria-label="Поиск категорий"
          class="pi-input w-64"
        />
        <select
          [value]="typeFilter()"
          (change)="onTypeFilterChange($event)"
          aria-label="Фильтр по типу"
          class="pi-input w-40"
          data-test="type-filter"
        >
          <option value="all">Все типы</option>
          <option value="material">Материал</option>
          <option value="product">Продукция</option>
          <option value="general">Общая</option>
        </select>
        <span class="flex-1"></span>
        <app-pi-button variant="default" (click)="openCreate()">+ Создать</app-pi-button>
      </div>
      <p class="mb-2 text-xs text-muted-foreground" data-test="categories-path-hint">
        Справочники → Классификация → Категории
      </p>
      <app-pi-table-tree
        [compact]="true"
        [data]="treeData()"
        [columns]="columns"
        [childRows]="childrenOf"
        [expandedIds]="expandedIds()"
        [cellTemplates]="tpls()"
        [rowActions]="rowActionsTpl"
        [dragReorder]="canDragReorder()"
        [loading]="loading()"
        [emptyMessage]="emptyMessage()"
        ariaLabel="Дерево категорий"
        (expandedChange)="expandedIds.set($event)"
        (drop)="onTreeDrop($event)"
        data-test="categories-tree"
      />
      <ng-template #nameTpl let-c
        ><span class="text-xs font-medium text-ink truncate">{{ c.name }}</span></ng-template
      >
      <ng-template #typeTpl let-c
        ><span
          class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium w-fit"
          [class]="typeColor(c.type)"
          >{{ typeLabel(c.type) }}</span
        ></ng-template
      >
      <ng-template #rowActionsTpl let-c>
        <button
          type="button"
          class="pi-icon-btn pi-focus-ring"
          [attr.aria-label]="'Копировать slug ' + c.slug"
          title="Копировать slug"
          data-test="category-copy-slug"
          (click)="copySlug(c)"
        >
          <span aria-hidden="true">#</span>
        </button>
        <button
          type="button"
          class="pi-icon-btn pi-icon-btn-edit pi-focus-ring"
          [attr.aria-label]="'Редактировать ' + c.name"
          (click)="openEdit(c)"
        >
          <span aria-hidden="true">&#x270E;</span>
        </button>
        <button
          type="button"
          class="pi-icon-btn pi-icon-btn-danger pi-focus-ring"
          [attr.aria-label]="'Удалить ' + c.name"
          (click)="onDelete(c)"
        >
          <span aria-hidden="true">&#x00D7;</span>
        </button>
      </ng-template>
    </app-pi-group-workspace>
  `,
})
export class CategoriesPage {
  protected readonly toc = DICTIONARY_TOC_CHIPS;
  protected readonly chips = CLASSIFICATION_CHIPS;
  private readonly service = inject(CategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;
  protected readonly typeFilter = signal<TypeFilter>(
    CategoriesPage.parseTypeFilter(this.route.snapshot.queryParamMap.get('type')),
  );
  protected readonly expandedIds = signal<Set<string>>(new Set());
  private readonly treeRes = httpResource<CategoryTreeNode[]>(() => ({
    url: `${this.baseUrl}/categories/tree`,
  }));
  protected readonly allTreeData = computed<CategoryTreeNode[]>(() => this.treeRes.value() ?? []);
  protected readonly loading = computed<boolean>(() => this.treeRes.isLoading());
  protected readonly error = computed<string | null>(() => {
    const err = this.treeRes.error() as
      import('@angular/common/http').HttpErrorResponse | undefined;
    return err ? extractErrorMessage(err) : null;
  });
  protected readonly treeData = computed<CategoryTreeNode[]>(() =>
    this.filterTree(
      this.allTreeData(),
      this.search.debouncedSearch().trim().toLowerCase(),
      this.typeFilter(),
    ),
  );
  protected readonly total = computed<number>(() => this.countNodes(this.treeData()));
  protected readonly totalLabel = computed(() => {
    const n = this.countNodes(this.allTreeData());
    const f = this.total();
    if (f === n) return n ? `${n} ${pluralize(n, ['категория', 'категории', 'категорий'])}` : '';
    return `${f} из ${n} ${pluralize(n, ['категории', 'категорий', 'категорий'])}`;
  });
  protected readonly emptyMessage = computed(() => {
    if (this.searchQuery()) return 'Ничего не найдено.';
    if (this.typeFilter() === 'material') {
      return 'Категории материалов используются в Снабжении и карточке материала. Создайте первую.';
    }
    if (this.typeFilter() !== 'all') return 'Ничего не найдено.';
    return 'Нет категорий. Создайте первую.';
  });
  /** Drag only on the full unfiltered tree so drop indices match server order. */
  protected readonly canDragReorder = computed(
    () => !this.search.debouncedSearch().trim() && this.typeFilter() === 'all',
  );
  protected readonly columns: ColumnDef<CategoryTreeNode>[] = [
    { key: 'name', label: 'Название' },
    { key: 'slug', label: 'Slug', cellClass: 'font-mono text-xs text-muted-foreground' },
    { key: 'type', label: 'Тип' },
    { key: 'skuPrefix', label: 'SKU', cellClass: 'font-mono text-xs' },
    { key: 'sortOrder', label: 'Сорт.', align: 'right', numeric: true, width: '5rem' },
  ];
  @ViewChild('nameTpl', { static: true }) protected readonly nameTpl!: TemplateRef<{
    $implicit: CategoryTreeNode;
  }>;
  @ViewChild('typeTpl', { static: true }) protected readonly typeTpl!: TemplateRef<{
    $implicit: CategoryTreeNode;
  }>;
  @ViewChild('rowActionsTpl', { static: true }) protected readonly rowActionsTpl!: TemplateRef<{
    $implicit: CategoryTreeNode;
  }>;
  protected readonly tpls = computed<Record<string, TemplateRef<{ $implicit: CategoryTreeNode }>>>(
    () => ({ name: this.nameTpl, type: this.typeTpl }),
  );
  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const next = CategoriesPage.parseTypeFilter(params.get('type'));
      if (next !== this.typeFilter()) this.typeFilter.set(next);
    });
    effect(() => {
      if (this.search.debouncedSearch().trim() || this.typeFilter() !== 'all')
        this.expandedIds.set(this.collectParentIds(this.allTreeData()));
    });
  }

  private static parseTypeFilter(raw: string | null): TypeFilter {
    if (raw === 'material' || raw === 'product' || raw === 'general') return raw;
    return 'all';
  }
  protected childrenOf = (node: CategoryTreeNode): CategoryTreeNode[] => node.children;
  private filterTree(
    nodes: CategoryTreeNode[],
    query: string,
    type: TypeFilter,
  ): CategoryTreeNode[] {
    return nodes
      .map((node) => {
        const children = this.filterTree(node.children, query, type);
        const matches =
          (type === 'all' || node.type === type) &&
          (!query ||
            node.name.toLowerCase().includes(query) ||
            node.slug.toLowerCase().includes(query) ||
            node.skuPrefix.toLowerCase().includes(query));
        return matches || children.length > 0 ? { ...node, children } : null;
      })
      .filter((node): node is CategoryTreeNode => node !== null);
  }
  private countNodes(nodes: CategoryTreeNode[]): number {
    return nodes.reduce((sum, node) => sum + 1 + this.countNodes(node.children), 0);
  }
  private collectParentIds(nodes: CategoryTreeNode[]): Set<string> {
    const ids = new Set<string>();
    for (const node of nodes)
      if (node.children.length > 0) {
        ids.add(node._id);
        for (const childId of this.collectParentIds(node.children)) ids.add(childId);
      }
    return ids;
  }
  protected typeLabel(type: Category['type']): string {
    return TYPE_LABELS[type] ?? type;
  }
  protected typeColor(type: Category['type']): string {
    return type === 'material'
      ? 'bg-sunrise-warm/20 text-gold-deep'
      : type === 'product'
        ? 'bg-accent-cool/20 text-accent-cool'
        : 'bg-muted-foreground/20 text-muted-foreground';
  }
  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
  }
  protected onTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.typeFilter.set(value === 'all' ? 'all' : (value as Category['type']));
  }
  protected onTreeDrop(event: TreeDropEvent<CategoryTreeNode>): void {
    if (event.previousIndex === event.currentIndex) return;
    if (!event.parent) {
      const items = [...this.allTreeData()];
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      this.treeRes.update(() => items);
      this.service.reorder(items.map((item) => item._id)).subscribe((res) => {
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          this.treeRes.reload();
        }
      });
      return;
    }
    const updatedTree = this.allTreeData().map((node) => {
      if (node._id !== event.parent?._id) return node;
      const children = [...node.children];
      moveItemInArray(children, event.previousIndex, event.currentIndex);
      return { ...node, children };
    });
    this.treeRes.update(() => updatedTree);
    const parent = updatedTree.find((node) => node._id === event.parent?._id);
    if (!parent) return;
    this.service
      .reorderChildren(
        parent._id,
        parent.children.map((child) => child._id),
      )
      .subscribe((res) => {
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          this.treeRes.reload();
        }
      });
  }
  protected openCreate(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, { data: null, width: 'md' });
    this.refreshOnDialogClose(ref);
  }
  protected openEdit(category: Category): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, { data: category, width: 'md' });
    this.refreshOnDialogClose(ref);
  }
  protected onDelete(row: Category): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: 'Удалить категорию?',
        description: `Удалить «${row.name}» (${row.slug})? Это действие нельзя отменить.`,
        confirmLabel: 'Удалить',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, () => {
      this.service.remove(row._id).subscribe((res) => {
        if (res.ok) {
          this.toast.success('Категория удалена');
          this.treeRes.reload();
        } else this.toast.error(extractErrorMessage(res.error));
      });
    });
  }

  protected copySlug(row: Category): void {
    const slug = row.slug?.trim();
    if (!slug) {
      this.toast.error('У категории нет slug');
      return;
    }
    void navigator.clipboard.writeText(slug).then(
      () => this.toast.success(`Slug скопирован: ${slug}`),
      () => this.toast.error('Не удалось скопировать slug'),
    );
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => this.treeRes.reload());
  }
}
