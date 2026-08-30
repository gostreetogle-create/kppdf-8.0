import type {
  CompositionLine,
  CompositionLineType,
  CompositionTreeNode,
} from '@kppdf/data-access';

/** Map tree node to composition line type (tree `_id` is entity refId, not lineId). */
export function lineTypeForNode(node: CompositionTreeNode): CompositionLineType {
  if (node.lineType) return node.lineType;
  if (node.kind === 'product') return 'product';
  if (node.kind === 'module') return 'module';
  return 'material';
}

export function findCompositionLine(
  lines: CompositionLine[],
  node: CompositionTreeNode,
): CompositionLine | undefined {
  const wantType = lineTypeForNode(node);
  return lines.find((line) => line.refId === node._id && line.lineType === wantType);
}

/** Derived «Комплекс»: product-line anywhere in the loaded tree. */
export function treeHasProductChild(node: CompositionTreeNode | null | undefined): boolean {
  if (!node) return false;
  for (const child of node.children) {
    if (child.lineType === 'product' || child.kind === 'product') return true;
    if (treeHasProductChild(child)) return true;
  }
  return false;
}
