import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';

export type CompositionTreeExpandEvent = { node: CompositionTreeNode; expanded: boolean };

export type CompositionTreeSelectEvent = {
  node: CompositionTreeNode;
  parent: CompositionTreeNode | null;
  depth: number;
};

/**
 * Composition tree — canon: docs/pages/ui-composition-tree.md
 * Whole-row hit target; no text selection; › is indicator only.
 */
@Component({
  selector: 'app-composition-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div
      class="space-y-0.5"
      role="tree"
      [attr.aria-label]="ariaLabel()"
      data-test="composition-tree"
    >
      @if (root(); as rootNode) {
        <ng-container
          *ngTemplateOutlet="nodeTemplate; context: { $implicit: rootNode, depth: 0, parent: null }"
        />
      } @else {
        <p
          class="py-8 text-center text-sm text-muted-foreground"
          data-test="composition-tree-empty"
        >
          Состав пуст
        </p>
      }
    </div>

    <ng-template #nodeTemplate let-node let-depth="depth" let-parent="parent">
      <div
        class="rounded-sm transition-colors border-l-2"
        [class.border-sunrise-warm]="node.kind === 'product'"
        [class.border-ink]="node.kind === 'module'"
        [class.border-ink/30]="node.kind === 'material'"
        [attr.data-test]="'composition-tree-node-' + node._id"
        role="treeitem"
        [attr.aria-level]="depth + 1"
        [attr.aria-expanded]="node.kind !== 'material' ? isExpanded(node) : null"
        [attr.aria-selected]="selectedId() === node._id"
      >
        <div
          class="flex items-center gap-1.5 px-2 py-1.5 min-h-9 hairline rounded-sm cursor-pointer select-none pi-focus-ring"
          [style.padding-left.rem]="depth * 1.1 + 0.5"
          [class.bg-sunrise-warm/15]="selectedId() === node._id"
          [class.ring-1]="selectedId() === node._id"
          [class.ring-sunrise-warm/40]="selectedId() === node._id"
          [class.bg-paper-2]="selectedId() !== node._id && node.kind === 'module'"
          [class.bg-sunrise-warm/5]="selectedId() !== node._id && node.kind === 'product'"
          [class.bg-paper]="selectedId() !== node._id && node.kind === 'material'"
          [class.bg-sunrise-warm/10]="depth > 5"
          (mousedown)="onRowMouseDown($event)"
          (click)="onRowClick(node, parent, depth)"
          data-test="composition-tree-row"
        >
          @if (node.kind !== 'material') {
            <span
              class="w-6 h-6 shrink-0 inline-flex items-center justify-center rounded-sm text-muted-foreground"
              [attr.aria-hidden]="true"
              data-test="composition-tree-toggle"
            >
              <span
                class="inline-block transition-transform text-sm leading-none"
                [class.rotate-90]="isExpanded(node)"
                >›</span
              >
            </span>
          } @else {
            <span class="w-6 shrink-0" aria-hidden="true"></span>
          }
          <span
            class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm hairline"
            [class.text-sunrise-warm]="node.kind === 'product'"
            [class.text-ink]="node.kind === 'module'"
            [class.text-muted-foreground]="node.kind === 'material'"
            >{{ kindShort(node) }}</span
          >
          <span class="min-w-0 flex-1 truncate">
            <span class="font-medium text-sm">{{ node.name }}</span>
            @if (node.quantity !== 1) {
              <span class="ml-1.5 text-[11px] font-mono text-muted-foreground"
                >× {{ node.quantity }}{{ node.unit ? ' ' + node.unit : '' }}</span
              >
            }
          </span>
          @if (node.kind !== 'material' && node.children.length > 0) {
            <span
              class="shrink-0 text-[10px] font-mono text-muted-foreground tabular-nums"
              aria-hidden="true"
              >{{ node.children.length }}</span
            >
          }
          @if (depth > 5) {
            <span class="text-[10px] text-sunrise-warm shrink-0" role="note">глуб.</span>
          }
        </div>
        @if (isExpanded(node) && node.children.length > 0) {
          <div class="space-y-0.5 pb-0.5" role="group">
            @for (child of node.children; track child._id + ':' + $index) {
              <ng-container
                *ngTemplateOutlet="
                  nodeTemplate;
                  context: { $implicit: child, depth: depth + 1, parent: node }
                "
              />
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class CompositionTreeComponent {
  readonly root = input<CompositionTreeNode | null>(null);
  readonly ariaLabel = input('Дерево состава');
  readonly selectedId = input<string | null>(null);
  readonly expandedChange = output<CompositionTreeExpandEvent>();
  readonly selectedChange = output<CompositionTreeSelectEvent>();

  private readonly expanded = signal(new Set<string>());
  private lastRootId: string | null = null;

  constructor() {
    effect(() => {
      const rootNode = this.root();
      if (!rootNode || rootNode.kind === 'material') return;
      if (this.lastRootId === rootNode._id) return;
      this.lastRootId = rootNode._id;
      const next = new Set(this.expanded());
      next.add(rootNode._id);
      this.expanded.set(next);
      // Seed only — do not emit (parent would refetch / tests toggle from collapsed).
    });
  }

  protected isExpanded(node: CompositionTreeNode): boolean {
    return this.expanded().has(node._id);
  }

  protected onRowMouseDown(event: MouseEvent): void {
    // Button-like hit target: suppress native text selection on click/drag.
    event.preventDefault();
  }

  protected onRowClick(
    node: CompositionTreeNode,
    parent: CompositionTreeNode | null,
    depth: number,
  ): void {
    const alreadySelected = this.selectedId() === node._id;
    this.selectedChange.emit({ node, parent, depth });
    if (node.kind === 'material') return;
    // Whole row is the hit target (no need to aim at ›).
    // Collapsed → open. Same selected row again (or no selection mode) → close.
    // Other already-open node → keep open, just select.
    if (!this.isExpanded(node)) {
      this.setExpanded(node, true);
    } else if (alreadySelected || this.selectedId() == null) {
      this.setExpanded(node, false);
    }
  }

  private setExpanded(node: CompositionTreeNode, expanded: boolean): void {
    const next = new Set(this.expanded());
    if (expanded) next.add(node._id);
    else next.delete(node._id);
    this.expanded.set(next);
    this.expandedChange.emit({ node, expanded });
  }

  protected kindShort(node: CompositionTreeNode): string {
    if (node.kind === 'product') return 'изд';
    if (node.kind === 'module') return 'мод';
    return 'мат';
  }
}
