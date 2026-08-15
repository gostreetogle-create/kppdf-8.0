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
import { LucideAngularModule, Image as ImageIcon, Pencil } from 'lucide-angular';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';
import { catalogKindBorder, catalogKindOklch } from '../catalog/catalog-kind-oklch';
import { CatalogAppearanceService } from '../catalog/catalog-appearance.service';
import { ThemeService } from '../../theme/theme.service';

export type CompositionTreeExpandEvent = { node: CompositionTreeNode; expanded: boolean };

export type CompositionTreeSelectEvent = {
  node: CompositionTreeNode;
  parent: CompositionTreeNode | null;
  depth: number;
};

export type CompositionTreeEditEvent = CompositionTreeSelectEvent;

/**
 * Composition tree — canon: docs/pages/ui-composition-tree.md
 * Whole-row hit target; no text selection; › is indicator only.
 * Kind wash: docs/audits/2026-08-07-catalog-entity-colors-audit.md (TZ-330).
 * Containment nest: docs/audits/2026-08-08-composition-containment-outline.md (TZ-333).
 * Nest cohesion (gap/rail/indent): docs/audits/2026-08-08-composition-block-cohesion-visual.md (TZ-334).
 * Thumb + wrap name: TZ-UX-311. Density (36px thumb, tight row): TZ-UX-312.
 */
@Component({
  selector: 'app-composition-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, LucideAngularModule],
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
        class="rounded-md transition-colors"
        [class.hairline]="isExpanded(node) && node.children.length > 0"
        [class.overflow-hidden]="isExpanded(node) && node.children.length > 0"
        [class.mb-3]="isExpanded(node) && node.children.length > 0"
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
          class="flex items-center gap-1 px-1.5 py-1 min-h-11 cursor-pointer select-none pi-focus-ring"
          [class.hairline]="!(isExpanded(node) && node.children.length > 0)"
          [class.rounded-sm]="!(isExpanded(node) && node.children.length > 0)"
          [class.rounded-none]="isExpanded(node) && node.children.length > 0"
          [class.border-b]="isExpanded(node) && node.children.length > 0"
          [style.border-bottom-color]="
            isExpanded(node) && node.children.length > 0
              ? 'color-mix(in oklch, var(--color-rule) 45%, transparent)'
              : null
          "
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
                class="inline-block transition-transform text-base font-semibold leading-none"
                [class.rotate-90]="isExpanded(node)"
                >›</span
              >
            </span>
          } @else {
            <span class="w-7 shrink-0" aria-hidden="true"></span>
          }
          <span
            class="shrink-0 eyebrow leading-none px-1.5 py-0.5 rounded-sm hairline font-medium"
            [style.color]="kindAccent(node)"
            [style.border-color]="kindAccent(node)"
            >{{ kindShort(node) }}</span
          >
          <span
            class="shrink-0 w-9 h-9 rounded-sm overflow-hidden inline-flex items-center justify-center bg-muted/40 text-muted-foreground"
            aria-hidden="true"
            data-test="composition-tree-thumb"
          >
            @if (node.photoUrl) {
              <img
                [src]="node.photoUrl"
                alt=""
                class="w-full h-full object-cover"
                data-test="composition-tree-thumb-img"
              />
            } @else {
              <lucide-icon
                [img]="ImageIconSvg"
                [size]="18"
                class="opacity-45"
                data-test="composition-tree-thumb-placeholder"
              />
            }
          </span>
          <span class="min-w-0 flex-1 flex items-start gap-1.5">
            <span
              class="min-w-0 flex-1 line-clamp-2 break-words font-medium text-sm"
              [attr.title]="node.name"
              data-test="composition-tree-name"
              >{{ node.name }}</span
            >
            @if (node.quantity !== 1) {
              <span class="shrink-0 text-xs font-mono font-medium tabular-nums text-foreground/75"
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
            <span class="text-xs text-sunrise-warm shrink-0" role="note">глуб.</span>
          }
          @if (showEdit()) {
            <button
              type="button"
              class="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-ink pi-focus-ring"
              data-test="composition-tree-edit"
              [attr.aria-label]="'Изменить «' + node.name + '» в каталоге'"
              (click)="onEditClick($event, node, parent, depth)"
            >
              <lucide-icon [img]="PencilIconSvg" [size]="14" aria-hidden="true" />
            </button>
          }
        </div>
        @if (isExpanded(node) && node.children.length > 0) {
          <div
            class="comp-tree__nest mt-0 space-y-3 border-solid border-l-[5px] pt-2 pr-2.5 pb-2.5 pl-4"
            [class.comp-tree__nest--dark]="theme.isDark()"
            [style.background]="nestSurface(depth)"
            [style.border-left-color]="kindBorder(node)"
            [style.box-shadow]="nestShadow(depth)"
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
  /** TZ-ORDERS-337: per-row catalog pencil. Order hosts keep true; BOM may hide. */
  readonly showEdit = input(true);
  readonly expandedChange = output<CompositionTreeExpandEvent>();
  readonly selectedChange = output<CompositionTreeSelectEvent>();
  readonly editClick = output<CompositionTreeEditEvent>();

  protected readonly ImageIconSvg = ImageIcon;
  protected readonly PencilIconSvg = Pencil;

  private readonly expanded = signal(new Set<string>());
  private lastRootId: string | null = null;
  private readonly appearance = inject(CatalogAppearanceService);
  protected readonly theme = inject(ThemeService);

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
   * TZ-CATALOG-335: dark uses larger L steps + slight rule chroma (not kind-wash).
   */
  protected nestSurface(depth: number): string {
    const step = Math.min(Math.max(depth, 0), 3);
    if (this.theme.isDark()) {
      // A+B: stronger depth ladder + mild rule chroma so levels aren't gray mush
      const inkPct = [12, 22, 34, 46] as const;
      const rulePct = [10, 16, 22, 28] as const;
      const from = inkPct[step]!;
      const to = from + 10;
      const rule = rulePct[step]!;
      return `linear-gradient(165deg, color-mix(in oklch, var(--color-ink) ${from}%, var(--color-paper)) 0%, color-mix(in oklch, var(--color-rule) ${rule}%, var(--color-paper)) 48%, color-mix(in oklch, var(--color-ink) ${to}%, var(--color-paper)) 100%)`;
    }
    // Soft ink→paper mixes; step 0 must still read as a tinted tray
    const inkPct = [4, 8, 13, 18] as const;
    const from = inkPct[step]!;
    const to = from + 4;
    return `linear-gradient(165deg, color-mix(in oklch, var(--color-ink) ${from}%, var(--color-paper)) 0%, color-mix(in oklch, var(--color-rule) ${Math.min(from + 6, 22)}%, var(--color-paper)) 55%, color-mix(in oklch, var(--color-ink) ${to}%, var(--color-paper)) 100%)`;
  }

  /** TZ-CATALOG-335 (C): subtle inset edge between nest levels on dark only. */
  protected nestShadow(depth: number): string | null {
    if (!this.theme.isDark()) return null;
    const a = 0.14 + Math.min(depth, 3) * 0.05;
    return `inset 0 0 0 1px color-mix(in oklch, var(--color-ink) ${Math.round(a * 100)}%, transparent)`;
  }

  protected onRowMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onEditClick(
    event: MouseEvent,
    node: CompositionTreeNode,
    parent: CompositionTreeNode | null,
    depth: number,
  ): void {
    event.preventDefault();
    event.stopPropagation();
    this.editClick.emit({ node, parent, depth });
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
