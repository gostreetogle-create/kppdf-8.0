import type { StudioBlock } from '@kppdf/data-access';

export function studioImageUrl(block: StudioBlock): string | null {
  const url = block.settings?.['imageUrl'];
  return typeof url === 'string' && url.trim() ? url : null;
}

export function studioLayerTypeLabel(block: StudioBlock): string {
  switch (block.type) {
    case 'image':
      return 'Изображение';
    case 'table':
      return 'Таблица';
    case 'text':
      return 'Текст';
    default:
      return block.type;
  }
}

/** Canvas shows only the active layer on the current page (Photoshop-like isolation). */
export function studioCanvasBlocks(
  blocks: readonly StudioBlock[],
  activeLayerId: string | null,
  currentPage: number,
): readonly StudioBlock[] {
  if (!activeLayerId) return [];
  return blocks.filter(
    (b) =>
      b._id === activeLayerId &&
      b.layout &&
      b.layout.page === currentPage &&
      b.isActive !== false,
  );
}
