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

/** All visible blocks on the current page, bottom → top by zIndex. */
export function studioCanvasBlocks(
  blocks: readonly StudioBlock[],
  _activeLayerId: string | null,
  currentPage: number,
): readonly StudioBlock[] {
  return blocks
    .filter(
      (b) => b.layout && b.layout.page === currentPage && b.isActive !== false,
    )
    .sort((a, b) => (a.layout!.zIndex ?? 0) - (b.layout!.zIndex ?? 0));
}

export function studioBlockIsEditable(block: StudioBlock, activeLayerId: string | null): boolean {
  return Boolean(activeLayerId && block._id === activeLayerId && !block.locked);
}

/** Image layer marked as sheet background (settings.overlay). */
export function studioBlockIsPassportBackground(block: StudioBlock): boolean {
  if (block.type !== 'image') return false;
  return block.settings?.['overlay'] === true;
}

export function studioCanvasForegroundBlocks(
  blocks: readonly StudioBlock[],
  activeLayerId: string | null,
  currentPage: number,
): readonly StudioBlock[] {
  return studioCanvasBlocks(blocks, activeLayerId, currentPage).filter(
    (b) => !studioBlockIsPassportBackground(b),
  );
}

export function studioCanvasBackgroundBlocks(
  blocks: readonly StudioBlock[],
  activeLayerId: string | null,
  currentPage: number,
): readonly StudioBlock[] {
  return studioCanvasBlocks(blocks, activeLayerId, currentPage).filter((b) =>
    studioBlockIsPassportBackground(b),
  );
}

/** Merge settings for PATCH — keep persisted imageUrl, drop ephemeral blob:/data: URLs. */
export function studioImageSettingsForUpdate(
  settings: Record<string, unknown> | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...(settings ?? {}), ...patch };
  const url = merged['imageUrl'];
  if (typeof url === 'string' && !url.startsWith('/uploads/')) {
    const { imageUrl: _drop, ...rest } = merged;
    return rest;
  }
  return merged;
}

/** Preserve local imageUrl when API returns partial settings. */
export function studioMergeBlockSettings(
  local: Record<string, unknown> | undefined,
  remote: Record<string, unknown> | undefined,
  patch: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...(local ?? {}), ...(remote ?? {}), ...patch };
}

