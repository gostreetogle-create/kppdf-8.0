import type {
  CompositionLineType,
  CompositionParentKind,
  CompositionTreeNode,
  MaterialKind,
} from '@kppdf/data-access';

/** Allowed composition line types per parent entity (backend rules). */
export function allowedLineTypes(parent: CompositionParentKind): CompositionLineType[] {
  if (parent === 'material') return ['material'];
  if (parent === 'module') return ['module', 'material'];
  return ['module', 'material', 'product'];
}

export function isLineTypeAllowed(parent: CompositionParentKind, lineType: CompositionLineType): boolean {
  return allowedLineTypes(parent).includes(lineType);
}

/** Product parent cannot attach raw Material directly; Деталь composition is raw-only. */
export function isMaterialKindAllowedForParent(
  parent: CompositionParentKind,
  materialKind?: MaterialKind | null,
): boolean {
  if (parent === 'material') return materialKind === 'raw';
  if (parent === 'module') return true;
  return materialKind !== 'raw';
}

export function kindShort(kind: 'product' | 'module' | 'material'): string {
  switch (kind) {
    case 'product':
      return 'ИЗД';
    case 'module':
      return 'МОД';
    default:
      return 'МАТ';
  }
}

export { treeHasProductChild } from './composition-line-resolve';

/** Whether composition lines can be added into the selected tree node (legacy BOM parity). */
export function canAddIntoNode(
  rootKind: CompositionParentKind,
  node: CompositionTreeNode,
): boolean {
  // Деталь composition is flat (raw materials only) — nothing to drill into.
  if (rootKind === 'material') return false;
  if (node.kind === 'material') return false;
  if (rootKind === 'module') return node.kind === 'module';
  return node.kind === 'product' || node.kind === 'module';
}

export function lineTypeLabel(lineType: CompositionLineType): string {
  switch (lineType) {
    case 'product':
      return 'Изделие';
    case 'module':
      return 'Модуль';
    default:
      return 'Материал / Деталь';
  }
}
