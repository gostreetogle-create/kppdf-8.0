import { blockKey, type TemplateBlock } from '../../../shared/template-block/template-block.types';

/**
 * TZ-DOC-331 — peers for a positioned drag.
 *
 * Preference order:
 * 1. Persisted flat group (`groupId`) → every layout member with that id
 *    from the full canvas list (independent of current selection).
 * 2. Else multi-selection (`selectedGroup`) when it includes the dragged
 *    block and has 2+ layout members.
 * 3. Else the dragged block alone.
 */
export function resolvePositionedDragPeers(
  dragged: TemplateBlock,
  allBlocks: readonly TemplateBlock[],
  selectedGroup: readonly TemplateBlock[],
): TemplateBlock[] {
  const gid = dragged.groupId;
  if (gid) {
    const members = allBlocks.filter((b) => b.groupId === gid && !!b.layout);
    if (members.length > 0) return members;
  }

  const draggedKey = blockKey(dragged);
  const selectedLayouts = selectedGroup.filter((b) => !!b.layout);
  if (selectedLayouts.length > 1 && selectedLayouts.some((b) => blockKey(b) === draggedKey)) {
    return selectedLayouts;
  }

  return dragged.layout ? [dragged] : [];
}
