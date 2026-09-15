import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { CompositionTreeNode } from '@kppdf/data-access';
import { kindShort } from './composition-tree.contract';

export type CompositionTreeSelectEvent = {
  node: CompositionTreeNode;
  parent: CompositionTreeNode | null;
  depth: number;
};

/**
 * Composition tree — canon: docs/pages/ui-composition-tree.md (simplified NX port).
 * App-level only; does not import HTTP services.
 */
@Component({
  selector: 'pi-composition-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="space-y-0.5" role="tree" [attr.aria-label]="ariaLabel()" data-test="composition-tree">
      @if (root(); as rootNode) {
        <ng-container
          *ngTemplateOutlet="nodeTpl; context: { $implicit: rootNode, depth: 0, parent: null }"
        />
      } @else {
        <p class="py-8 text-center text-sm text-muted-foreground" data-test="composition-tree-empty">
          Состав пуст
        </p>
      }
    </div>

    <ng-template #nodeTpl let-node let-depth="depth" let-parent="parent">
      <div
        class="rounded-sm transition-colors"
        [class.overflow-hidden]="isExpanded(node) && node.children.length > 0"
        [class.mb-3]="isExpanded(node) && node.children.length > 0"
        [attr.data-test]="'composition-tree-node-' + node._id"
        [attr.data-kind]="node.kind"
        role="treeitem"
        [attr.aria-level]="depth + 1"
        [attr.aria-expanded]="node.kind !== 'material' && node.children.length > 0 ? isExpanded(node) : null"
        [attr.aria-selected]="selectedId() === node._id"
      >
        <div
          class="flex items-center gap-1 px-1.5 py-1 min-h-11 cursor-pointer select-none pi-focus-ring border-b"
          [style.border-bottom-color]="'color-mix(in oklch, var(--color-rule) 45%, transparent)'"
          [style.padding-left.rem]="depth * 1.1 + 0.5"
          [class.ring-1]="selectedId() === node._id"
          [class.ring-sunrise-warm/40]="selectedId() === node._id"
          tabindex="0"
          role="button"
          (mousedown)="onRowMouseDown($event)"
          (click)="onRowClick(node, parent, depth)"
          (keydown.enter)="onRowClick(node, parent, depth)"
          (keydown.space)="onRowKeydown($event, node, parent, depth)"
          data-test="composition-tree-row"
        >
          @if (node.kind !== 'material' && node.children.length > 0) {
            <span
              class="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-sm text-base font-semibold leading-none"
              [class.bg-gold]="isExpanded(node)"
              [class.text-ink]="isExpanded(node)"
              [class.text-muted-foreground]="!isExpanded(node)"
              aria-hidden="true"
              data-test="composition-tree-toggle"
            >
              <span class="inline-block transition-transform" [class.rotate-90]="isExpanded(node)">›</span>
            </span>
          } @else {
            <span class="w-7 shrink-0" aria-hidden="true"></span>
          }

          <span class="shrink-0 eyebrow leading-none px-1.5 py-0.5 rounded-sm hairline font-medium">{{
            kindShort(node.kind)
          }}</span>

          <span
            class="min-w-0 flex-1 text-sm leading-snug line-clamp-2 break-words"
            [title]="node.name"
            >{{ node.name }}</span
          >

          @if (depth > 0) {
            <span class="shrink-0 text-xs text-muted-foreground tabular-nums" data-test="composition-tree-qty"
              >×{{ node.quantity }}{{ node.unit ? ' ' + node.unit : '' }}</span
            >
          }
        </div>

        @if (isExpanded(node) && node.children.length > 0) {
          <div
            class="space-y-3"
            [style.border-left]="'5px solid color-mix(in oklch, var(--color-ink) 18%, transparent)'"
            [style.margin-left.rem]="depth * 0.35 + 0.25"
            role="group"
            data-test="composition-tree-nest"
          >
            @for (child of node.children; track child._id) {
              <ng-container
                *ngTemplateOutlet="nodeTpl; context: { $implicit: child, depth: depth + 1, parent: node }"
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
  readonly selectedId = input<string | null>(null);
  readonly ariaLabel = input('Дерево состава');

  readonly selectedChange = output<CompositionTreeSelectEvent>();

  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly kindShort = kindShort;

  protected isExpanded(node: CompositionTreeNode): boolean {
    return this.expandedIds().has(node._id);
  }

  protected onRowMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onRowClick(
    node: CompositionTreeNode,
    parent: CompositionTreeNode | null,
    depth: number,
  ): void {
    const hasChildren = node.kind !== 'material' && node.children.length > 0;
    const expanded = this.isExpanded(node);
    const selected = this.selectedId() === node._id;

    if (hasChildren) {
      if (selected && expanded) {
        this.setExpanded(node._id, false);
      } else {
        this.setExpanded(node._id, true);
      }
    }

    this.selectedChange.emit({ node, parent, depth });
  }

  protected onRowKeydown(
    event: Event,
    node: CompositionTreeNode,
    parent: CompositionTreeNode | null,
    depth: number,
  ): void {
    event.preventDefault();
    this.onRowClick(node, parent, depth);
  }

  private setExpanded(id: string, open: boolean): void {
    const next = new Set(this.expandedIds());
    if (open) next.add(id);
    else next.delete(id);
    this.expandedIds.set(next);
  }
}
