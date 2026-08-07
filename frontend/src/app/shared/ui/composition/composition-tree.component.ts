import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CompositionTreeNode } from '../../services/pi-product-modules.service';

export type CompositionTreeExpandEvent = { node: CompositionTreeNode; expanded: boolean };

@Component({
  selector: 'app-composition-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="space-y-1" role="tree" [attr.aria-label]="ariaLabel()" data-test="composition-tree">
      @if (root(); as rootNode) {
        <ng-container
          *ngTemplateOutlet="nodeTemplate; context: { $implicit: rootNode, depth: 0, path: '' }"
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

    <ng-template #nodeTemplate let-node let-depth="depth" let-path="path">
      <div
        class="rounded-sm transition-colors border-l-2"
        [class.border-sunrise-warm]="node.kind === 'product'"
        [class.bg-sunrise-warm/5]="node.kind === 'product'"
        [class.border-ink]="node.kind === 'module'"
        [class.bg-paper-2]="node.kind === 'module'"
        [class.border-ink/30]="node.kind === 'material'"
        [class.bg-paper]="node.kind === 'material'"
        [class.bg-sunrise-warm/10]="depth > 5"
        [attr.data-test]="'composition-tree-node-' + node._id"
        role="treeitem"
        [attr.aria-level]="depth + 1"
        [attr.aria-expanded]="node.kind !== 'material' ? isExpanded(node) : null"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 min-h-10 hairline rounded-sm"
          [style.padding-left.rem]="depth * 1.25 + 0.75"
        >
          @if (node.kind !== 'material') {
            <button
              type="button"
              class="w-6 h-6 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-ink pi-focus-ring"
              [attr.aria-label]="isExpanded(node) ? 'Свернуть состав' : 'Развернуть состав'"
              (click)="toggle(node)"
              data-test="composition-tree-toggle"
            >
              <span
                class="inline-block transition-transform"
                [class.rotate-90]="isExpanded(node)"
                aria-hidden="true"
                >›</span
              >
            </button>
          } @else {
            <span class="w-6" aria-hidden="true"></span>
          }
          <span
            class="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm hairline"
            [class.text-sunrise-warm]="node.kind === 'product'"
            [class.text-ink]="node.kind === 'module'"
            [class.text-muted-foreground]="node.kind === 'material'"
            >{{ kindShort(node) }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="font-medium">{{ node.name }}</span>
            <span class="ml-2 text-xs text-muted-foreground">{{ kindLabel(node) }}</span>
            @if (node.quantity !== 1) {
              <span class="ml-2 text-xs font-mono"
                >× {{ node.quantity }}{{ node.unit ? ' ' + node.unit : '' }}</span
              >
            }
          </span>
          @if (depth > 5) {
            <span class="text-xs text-sunrise-warm" role="note">Глубокий уровень</span>
          }
        </div>
        @if (isExpanded(node) && node.children.length > 0) {
          <div class="space-y-1 pb-1 pl-1" role="group">
            @for (child of node.children; track child._id + ':' + $index) {
              <ng-container
                *ngTemplateOutlet="
                  nodeTemplate;
                  context: { $implicit: child, depth: depth + 1, path: path + '/' + node._id }
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
  readonly expandedChange = output<CompositionTreeExpandEvent>();

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

  protected toggle(node: CompositionTreeNode): void {
    const next = new Set(this.expanded());
    const expanded = !next.has(node._id);
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

  protected kindLabel(node: CompositionTreeNode): string {
    if (node.kind === 'product') return 'Изделие';
    if (node.kind === 'module') return 'Модуль';
    return node.materialKind
      ? `Материал · ${this.materialKindLabel(node.materialKind)}`
      : 'Материал';
  }

  private materialKindLabel(kind: NonNullable<CompositionTreeNode['materialKind']>): string {
    const labels: Record<string, string> = {
      raw: 'сырьё',
      part: 'деталь',
      fastener: 'метиз',
      purchased: 'покупное',
      other: 'другое',
    };
    return labels[kind] ?? kind;
  }
}
