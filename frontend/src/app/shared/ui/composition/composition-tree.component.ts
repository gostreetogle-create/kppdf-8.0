import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';
import { catalogKindBorder, catalogKindOklch } from '../catalog/catalog-kind-oklch';
import { CatalogAppearanceService } from '../catalog/catalog-appearance.service';

export type CompositionTreeExpandEvent = { node: CompositionTreeNode; expanded: boolean };

export type CompositionTreeSelectEvent = {
  node: CompositionTreeNode;
  parent: CompositionTreeNode | null;
  depth: number;
};

/**
 * Composition tree — canon: docs/pages/ui-composition-tree.md
 * Whole-row hit target; no text selection; › is indicator only.
 * Kind wash: docs/audits/2026-08-07-catalog-entity-colors-audit.md (TZ-330).
 * Containment nest: docs/audits/2026-08-08-composition-containment-outline.md (TZ-333).
 * Nest cohesion (gap/rail/indent): docs/audits/2026-08-08-composition-block-cohesion-visual.md (TZ-334).
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
        class="rounded-sm transition-colors"
        [attr.data-test]="'composition-tree-node-' + node._id"
        [attr.data-kind]="node.kind"
        role="treeitem"
        [attr.aria-level]="depth + 1"
        [attr.aria-expanded]="
          node.kind !== 'material' && node.children.length > 0 ? isExpanded(node) : null
        "
        [attr.aria-selected]="selectedId() === node._id"
      >
        <div
          class="flex items-center gap-1.5 px-2 py-1.5 min-h-9 hairline rounded-sm cursor-pointer select-none pi-focus-ring"
          [style.padding-left.rem]="depth * 1.1 + 0.5"
          [style.background]="rowWash(node)"
          [class.ring-1]="selectedId() === node._id"
          [class.ring-sunrise-warm/40]="selectedId() === node._id"
          [class.bg-sunrise-warm/10]="depth > 5"
          (mousedown)="onRowMouseDown($event)"
          (click)="onRowClick(node, parent, depth)"
          data-test="composition-tree-row"
        >
          @if (node.kind !== 'material' && node.children.length > 0) {
            <span
              class="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-sm text-muted-foreground"
              [attr.aria-hidden]="true"
              data-test="composition-tree-toggle"
            >
              <span
                class="inline-block transition-transform text-lg font-semibold leading-none"
                [class.rotate-90]="isExpanded(node)"
                >›</span
              >
            </span>
          } @else {
            <span class="w-7 shrink-0" aria-hidden="true"></span>
          }
          <span
            class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm hairline font-medium"
            [style.color]="kindAccent(node)"
            [style.border-color]="kindAccent(node)"
            >{{ kindShort(node) }}</span
          >
          <span class="min-w-0 flex-1 truncate" [attr.title]="node.name">
            <span class="font-medium text-sm">{{ node.name }}</span>
            @if (node.quantity !== 1) {
              <span class="ml-1.5 text-xs font-mono font-medium tabular-nums text-foreground/75"
                >× {{ node.quantity }}{{ node.unit ? ' ' + node.unit : '' }}</span
              >
            }
          </span>
          @if (node.kind !== 'material' && node.children.length > 0) {
            <span
              class="shrink-0 text-xs font-mono font-medium tabular-nums text-foreground/70"
              aria-hidden="true"
              >{{ node.children.length }}</span
            >
          }
          @if (depth > 5) {
            <span class="text-[10px] text-sunrise-warm shrink-0" role="note">глуб.</span>
          }
        </div>
        @if (isExpanded(node) && node.children.length > 0) {
          <div
            class="comp-tree__nest ml-5 mr-1 mt-2 mb-3 space-y-4 overflow-hidden rounded-lg border border-solid border-l-[5px] border-[color-mix(in_oklch,var(--color-rule)_55%,transparent)] pt-2.5 pr-2.5 pb-2.5 pl-5 shadow-[0_1px_0_color-mix(in_oklch,var(--color-rule)_35%,transparent),0_8px_18px_-10px_color-mix(in_oklch,var(--color-ink,_oklch(0.25_0.02_260))_22%,transparent)]"
            [style.background]="nestSurface(depth)"
            [style.border-left-color]="kindBorder(node)"
            role="group"
            data-test="composition-tree-nest"
            [attr.data-parent-kind]="node.kind"
            [attr.data-nest-depth]="depth"
          >
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
  private readonly appearance = inject(CatalogAppearanceService);

  constructor() {
    this.appearance.load()?.subscribe();
    effect(() => {
      const rootNode = this.root();
      if (!rootNode || rootNode.kind === 'material') return;
      if (this.lastRootId === rootNode._id) return;
      this.lastRootId = rootNode._id;
      const next = new Set(this.expanded());
      next.add(rootNode._id);
      this.expanded.set(next);
    });
  }

  protected isExpanded(node: CompositionTreeNode): boolean {
    return this.expanded().has(node._id);
  }

  protected kindBorder(node: CompositionTreeNode): string {
    return catalogKindBorder(node.kind, node.materialKind, this.appearance.palette());
  }

  protected kindAccent(node: CompositionTreeNode): string {
    return catalogKindOklch(node.kind, node.materialKind, 0.11, 0.62, this.appearance.palette());
  }

  /**
   * Row strip = plain paper. Kind color lives only on badge text/border
   * (and nest left rail) — not a tinted card wash.
   */
  protected rowWash(node: CompositionTreeNode): string {
    if (this.selectedId() === node._id) {
      return 'color-mix(in oklch, var(--color-rule) 22%, var(--color-paper))';
    }
    return 'var(--color-paper)';
  }

  /**
   * Nest cascade — gentle paper elevation (site Paper & Ink), not hard gray jumps.
   * Kind hues stay on opaque rows + left rail only.
   */
  protected nestSurface(depth: number): string {
    const step = Math.min(Math.max(depth, 0), 3);
    // Soft ink→paper mixes; step 0 must still read as a tinted tray
    const inkPct = [4, 8, 13, 18] as const;
    const from = inkPct[step]!;
    const to = from + 4;
    return `linear-gradient(165deg, color-mix(in oklch, var(--color-ink) ${from}%, var(--color-paper)) 0%, color-mix(in oklch, var(--color-rule) ${Math.min(from + 6, 22)}%, var(--color-paper)) 55%, color-mix(in oklch, var(--color-ink) ${to}%, var(--color-paper)) 100%)`;
  }

  protected onRowMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onRowClick(
    node: CompositionTreeNode,
    parent: CompositionTreeNode | null,
    depth: number,
  ): void {
    const alreadySelected = this.selectedId() === node._id;
    this.selectedChange.emit({ node, parent, depth });
    if (node.kind === 'material' || node.children.length === 0) return;
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
