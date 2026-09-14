import type { StudioBlock } from '@kppdf/data-access';
import { migratePlainTokensToNodes } from '@kppdf/ui/rich-text';

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

/**
 * Client-only settings that live in FE memory between writes and must survive
 * an API block replace. The backend never returns them (S28 hydrate does not
 * persist `liveRows`; `imageUrl` may be a local blob until upload completes),
 * so a naive `blocks.set(apiResponse)` would silently wipe them.
 */
export const STUDIO_EPHEMERAL_SETTING_KEYS = ['liveRows', 'imageUrl'] as const;

/**
 * TZ-NX-DOCSTUDIO-S46 — merge a server-returned block with the local one:
 * server fields win (layout, content, persisted settings), but ephemeral
 * client-only settings (`liveRows`, local `imageUrl`) are carried over from
 * the local block so a layout save / block replace can't erase hydrated rows.
 */
export function studioPreserveClientBlockSettings(
  local: StudioBlock | undefined,
  remote: StudioBlock,
): StudioBlock {
  if (!local) return remote;
  const localSettings = local.settings ?? {};
  const remoteSettings = remote.settings ?? {};
  const restored: Record<string, unknown> = {};
  for (const key of STUDIO_EPHEMERAL_SETTING_KEYS) {
    const value = localSettings[key];
    if (value !== undefined && remoteSettings[key] === undefined) {
      restored[key] = value;
    }
  }
  if (Object.keys(restored).length === 0) return remote;
  return { ...remote, settings: { ...remoteSettings, ...restored } };
}

const STUDIO_TOKEN_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function escapeStudioTokenHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — dotted-path lookup into a flat
 * substitution bag, mirroring backend `DocumentRenderService.renderHtml`'s
 * inner `substitute()` walk (same `key.path` semantics, same array-index
 * support) so a token that resolves in Preview/PDF resolves the same way
 * here. Returns `null` for an unresolved path — distinct from `''`, a
 * legitimately resolved blank value.
 */
export function resolveStudioTokenValue(bag: Record<string, unknown>, path: string): string | null {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc)) {
      const idx = Number.parseInt(key, 10);
      return Number.isFinite(idx) ? acc[idx] : undefined;
    }
    if (typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, bag);
  return value == null ? null : String(value);
}

/**
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP / TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON —
 * «Значения» display mode: replaces each `{{token}}` with its resolved value
 * as plain ink, no chip styling («как будет на бланке», per the TZ's own
 * wording — not a second write-path, `block.content` itself is never
 * touched). An unresolved token gets the `substitution-token--unresolved`
 * modifier (muted/dashed, see `studio-blocks-canvas.component.ts`'s CSS) —
 * deliberately NOT the plain `.substitution-token` chip «Токены» mode uses,
 * so switching to «Значения» with no client/issuer picked still reads as a
 * different mode, not a dead toggle (TEXT-PROPS-CANON's fix for the audit's
 * "визуально no-op" finding).
 */
export function renderStudioTokensAsValues(html: string, bag: Record<string, unknown>): string {
  if (!html || !html.includes('{{')) return html;
  return html.replace(STUDIO_TOKEN_RE, (match, path: string) => {
    const value = resolveStudioTokenValue(bag, path);
    if (value == null) {
      return `<span data-substitution-token="" data-token="${match}" class="substitution-token substitution-token--unresolved" title="${match}" contenteditable="false">${match}</span>`;
    }
    return escapeStudioTokenHtml(value);
  });
}

/**
 * TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP — canvas text HTML for the active token
 * display mode: «tokens» chips every `{{…}}` occurrence
 * (`migratePlainTokensToNodes`, already used by the RTE dialog — the canvas
 * itself never called it before this TZ, hence plain black `{{…}}` text);
 * «values» substitutes from `bag` instead (see `renderStudioTokensAsValues`).
 */
export function studioTextDisplayHtml(
  raw: string,
  mode: 'tokens' | 'values',
  bag: Record<string, unknown>,
): string {
  return mode === 'values' ? renderStudioTokensAsValues(raw, bag) : migratePlainTokensToNodes(raw);
}

