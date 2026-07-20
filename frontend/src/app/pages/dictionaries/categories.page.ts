import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiToolbarComponent } from '../../shared/page/pi-toolbar.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
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

const TYPE_LABELS: Record<Category['type'], string> = {
  material: 'Материал',
  product: 'Продукция',
  general: 'Общая',
};

const TYPE_COLORS: Record<Category['type'], string> = {
  material: 'bg-sunrise-warm/20 text-sunrise-warm',
  product: 'bg-accent-cool/20 text-accent-cool',
  general: 'bg-muted-foreground/20 text-muted-foreground',
};

/**
 * Полная документация страницы: docs/pages/categories.page.md
 */
@Component({
  selector: 'app-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropList,
    CdkDrag,
    PiPageHeaderComponent,
    PiSectionComponent,
    PiToolbarComponent,
    ButtonComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="раздел · справочники"
      title="Категории"
      description="Классификация материалов и продукции. Перетаскивайте для изменения порядка."
    />

    <app-pi-toolbar>
      <input
        type="search"
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
        placeholder="Поиск по названию…"
        aria-label="Поиск категорий"
        class="pi-input w-64"
      />
      <app-pi-button variant="default" (click)="openCreate()">+ Создать</app-pi-button>
      <span hint>{{ total() }} {{ totalLabel(total()) }}</span>
    </app-pi-toolbar>

    <app-pi-section title="Каталог" hint="Перетаскивайте строки для изменения порядка" eyebrow="I">
      @if (error()) {
        <div
          role="alert"
          class="mb-6 border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
        >
          {{ error() }}
        </div>
      }

      @if (treeData().length === 0 && !loading()) {
        <div class="py-12 text-center text-muted-foreground text-sm">
          {{ emptyMessage() }}
        </div>
      } @else {
        <!-- ───── Root categories (no parent) ───── -->
        <div class="hairline rounded-sm overflow-hidden">
          <div
            class="grid grid-cols-[2rem_1fr_8rem_8rem_6rem_5rem_8rem] gap-2 px-3 py-2 hairline-b bg-paper-2/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
          >
            <span></span>
            <span>Название</span>
            <span>Slug</span>
            <span>Тип</span>
            <span>SKU</span>
            <span class="text-right">Сорт.</span>
            <span class="text-right">Действия</span>
          </div>

          <div
            cdkDropList
            [cdkDropListData]="treeData()"
            (cdkDropListDropped)="onRootDrop($event)"
            class="divide-y divide-rule"
          >
            @for (node of treeData(); track node._id) {
              <div cdkDrag [cdkDragData]="node" class="group">
                <!-- ───── Parent row ───── -->
                <div
                  class="grid grid-cols-[2rem_1fr_8rem_8rem_6rem_5rem_8rem] gap-2 px-3 py-2.5 items-center hover:bg-paper-2/30 transition-colors"
                >
                  <!-- Drag handle -->
                  <div
                    cdkDragHandle
                    class="flex items-center justify-center w-5 h-5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                    [attr.aria-label]="'Перетащить ' + node.name"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="6" r="1" />
                      <circle cx="15" cy="6" r="1" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="9" cy="18" r="1" />
                      <circle cx="15" cy="18" r="1" />
                    </svg>
                  </div>

                  <!-- Name + expand toggle -->
                  <div class="min-w-0 flex items-center gap-2">
                    @if (node.children.length > 0) {
                      <button
                        type="button"
                        class="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-ink hover:bg-muted/50 transition-colors shrink-0"
                        (click)="toggleExpanded(node._id)"
                        [attr.aria-label]="expandedIds().has(node._id) ? 'Свернуть' : 'Развернуть'"
                        [attr.aria-expanded]="expandedIds().has(node._id)"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="transition-transform duration-150"
                          [class.rotate-90]="expandedIds().has(node._id)"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    } @else {
                      <span class="w-5 h-5 shrink-0"></span>
                    }
                    <div>
                      <p class="text-sm font-medium text-ink truncate">{{ node.name }}</p>
                      @if (node.description) {
                        <p class="text-[11px] text-muted-foreground truncate">
                          {{ node.description }}
                        </p>
                      }
                    </div>
                  </div>

                  <!-- Slug -->
                  <span class="font-mono text-xs text-muted-foreground">{{ node.slug }}</span>

                  <!-- Type badge -->
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium w-fit"
                    [class]="typeColor(node.type)"
                  >
                    {{ typeLabel(node.type) }}
                  </span>

                  <!-- SKU prefix -->
                  <span class="font-mono text-xs font-medium text-ink">{{ node.skuPrefix }}</span>

                  <!-- Sort order -->
                  <span class="text-right font-mono text-xs text-muted-foreground">{{
                    node.sortOrder
                  }}</span>

                  <!-- Actions -->
                  <div
                    class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      type="button"
                      class="pi-icon-btn pi-focus-ring"
                      [attr.aria-label]="'Редактировать ' + node.name"
                      (click)="openEdit(node)"
                    >
                      <span aria-hidden="true">&#x270E;</span>
                    </button>
                    <button
                      type="button"
                      class="pi-icon-btn pi-icon-btn-danger pi-focus-ring"
                      [attr.aria-label]="'Удалить ' + node.name"
                      (click)="onDelete(node)"
                    >
                      <span aria-hidden="true">&#x00D7;</span>
                    </button>
                  </div>
                </div>

                <!-- ───── Children (nested drag-drop) ───── -->
                @if (expandedIds().has(node._id) && node.children.length > 0) {
                  <div class="pl-10 pr-3 pb-2 bg-muted/20 border-l-2 border-border/30 ml-2.5">
                    <div
                      cdkDropList
                      [cdkDropListData]="node.children"
                      (cdkDropListDropped)="onChildDrop($event, node._id)"
                      class="divide-y divide-rule/50"
                    >
                      @for (child of node.children; track child._id) {
                        <div
                          cdkDrag
                          [cdkDragData]="child"
                          class="grid grid-cols-[2rem_1fr_8rem_8rem_6rem_5rem_8rem] gap-2 px-3 py-2 items-center hover:bg-paper-2/30 transition-colors group/child"
                        >
                          <!-- Child drag handle -->
                          <div
                            cdkDragHandle
                            class="flex items-center justify-center w-5 h-5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                            [attr.aria-label]="'Перетащить ' + child.name"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              aria-hidden="true"
                            >
                              <circle cx="9" cy="6" r="1" />
                              <circle cx="15" cy="6" r="1" />
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="9" cy="18" r="1" />
                              <circle cx="15" cy="18" r="1" />
                            </svg>
                          </div>

                          <!-- Child name -->
                          <div class="min-w-0">
                            <p class="text-sm font-medium text-ink truncate">{{ child.name }}</p>
                            @if (child.description) {
                              <p class="text-[11px] text-muted-foreground truncate">
                                {{ child.description }}
                              </p>
                            }
                          </div>

                          <!-- Slug -->
                          <span class="font-mono text-xs text-muted-foreground">{{
                            child.slug
                          }}</span>

                          <!-- Type badge -->
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium w-fit"
                            [class]="typeColor(child.type)"
                          >
                            {{ typeLabel(child.type) }}
                          </span>

                          <!-- SKU prefix -->
                          <span class="font-mono text-xs font-medium text-ink">{{
                            child.skuPrefix
                          }}</span>

                          <!-- Sort order -->
                          <span class="text-right font-mono text-xs text-muted-foreground">{{
                            child.sortOrder
                          }}</span>

                          <!-- Actions -->
                          <div
                            class="flex items-center justify-end gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity"
                          >
                            <button
                              type="button"
                              class="pi-icon-btn pi-focus-ring"
                              [attr.aria-label]="'Редактировать ' + child.name"
                              (click)="openEdit(child)"
                            >
                              <span aria-hidden="true">&#x270E;</span>
                            </button>
                            <button
                              type="button"
                              class="pi-icon-btn pi-icon-btn-danger pi-focus-ring"
                              [attr.aria-label]="'Удалить ' + child.name"
                              (click)="onDelete(child)"
                            >
                              <span aria-hidden="true">&#x00D7;</span>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </app-pi-section>
  `,
  styles: [
    `
      /* CDK drag-drop styles */
      .cdk-drag-preview {
        background: var(--color-paper);
        border: 1px solid var(--color-ink);
        opacity: 0.92;
        border-radius: 4px;
      }

      .cdk-drag-placeholder {
        opacity: 0.4;
        background: var(--color-sunrise-soft);
        border: 1px dashed var(--color-sunrise-warm);
        border-radius: 4px;
        transition: all 150ms ease;
      }

      .cdk-drop-list-dragging .divide-y > *:not(.cdk-drag-placeholder) {
        transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
      }

      /* Highlight drop target on hover */
      .cdk-drop-list-receiving {
        background: var(--color-sunrise-soft);
      }

      /* Drag handle hint */
      .cdk-drag-animating {
        transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
      }

      /* Nested children indentation */
      .cdk-drop-list.cdk-drop-list-dragging .cdk-drag-placeholder {
        margin-left: 2rem;
      }
    `,
  ],
})
export class CategoriesPage {
  private readonly service = inject(CategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly search = createSearchState(300);
  protected readonly searchQuery = this.search.searchQuery;

  // ─── Expanded state for parent nodes ───
  protected readonly expandedIds = signal<Set<string>>(new Set());

  // ─── Server tree via httpResource ───
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

  // ─── Client-side search filter (filters tree) ───
  protected readonly treeData = computed<CategoryTreeNode[]>(() => {
    const q = this.search.debouncedSearch().trim().toLowerCase();
    if (!q) return this.allTreeData();
    return this.filterTree(this.allTreeData(), q);
  });

  protected readonly total = computed<number>(() => this.countNodes(this.treeData()));

  protected readonly emptyMessage = computed(() =>
    this.searchQuery() ? 'Ничего не найдено.' : 'Нет категорий. Создайте первую.',
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.search.destroy());
    effect(() => {
      const q = this.search.debouncedSearch().trim().toLowerCase();
      if (q) {
        const ids = this.collectParentIds(this.allTreeData());
        this.expandedIds.set(ids);
      }
    });
  }

  // ─── Tree helpers ───
  private filterTree(nodes: CategoryTreeNode[], query: string): CategoryTreeNode[] {
    return nodes
      .map((node) => {
        const children = this.filterTree(node.children, query);
        const matchesSelf =
          node.name.toLowerCase().includes(query) ||
          node.slug.toLowerCase().includes(query) ||
          node.skuPrefix.toLowerCase().includes(query);
        if (matchesSelf || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter((n): n is CategoryTreeNode => n !== null);
  }

  private countNodes(nodes: CategoryTreeNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countNodes(n.children), 0);
  }

  private collectParentIds(nodes: CategoryTreeNode[]): Set<string> {
    const ids = new Set<string>();
    for (const n of nodes) {
      if (n.children.length > 0) {
        ids.add(n._id);
        for (const id of this.collectParentIds(n.children)) {
          ids.add(id);
        }
      }
    }
    return ids;
  }

  protected toggleExpanded(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected typeLabel(type: Category['type']): string {
    return TYPE_LABELS[type] ?? type;
  }

  protected typeColor(type: Category['type']): string {
    return TYPE_COLORS[type] ?? '';
  }

  protected totalLabel(n: number): string {
    return pluralize(n, ['категория', 'категории', 'категорий']);
  }

  protected onSearchInput(event: Event): void {
    this.search.onSearchInput(event);
  }

  // ─── Drag-drop: root reorder ───
  protected onRootDrop(event: CdkDragDrop<CategoryTreeNode[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const items = [...this.allTreeData()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);

    // Optimistic update
    this.treeRes.update(() => items);

    // Persist to server
    const categoryIds = items.map((c) => c._id);
    this.service.reorder(categoryIds).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        this.treeRes.reload();
      }
    });
  }

  // ─── Drag-drop: child reorder within a parent ───
  protected onChildDrop(event: CdkDragDrop<CategoryTreeNode[]>, parentId: string): void {
    if (event.previousIndex === event.currentIndex) return;

    // Build new tree with reordered children
    const updatedTree = this.allTreeData().map((node) => {
      if (node._id === parentId) {
        const children = [...node.children];
        moveItemInArray(children, event.previousIndex, event.currentIndex);
        return { ...node, children };
      }
      return node;
    });

    // Optimistic update
    this.treeRes.update(() => updatedTree);

    // Find the reordered children
    const parent = updatedTree.find((n) => n._id === parentId);
    if (!parent) return;

    const childIds = parent.children.map((c) => c._id);
    this.service.reorderChildren(parentId, childIds).subscribe((res) => {
      if (!res.ok) {
        this.toast.error(extractErrorMessage(res.error));
        this.treeRes.reload();
      }
    });
  }

  protected openCreate(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      data: null,
      width: 'md',
    });
    this.refreshOnDialogClose(ref);
  }

  protected openEdit(category: Category): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      data: category,
      width: 'md',
    });
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
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  private refreshOnDialogClose(ref: DialogRef<unknown>): void {
    onDialogCloseOnce(ref, this.injector, () => {
      this.treeRes.reload();
    });
  }
}
