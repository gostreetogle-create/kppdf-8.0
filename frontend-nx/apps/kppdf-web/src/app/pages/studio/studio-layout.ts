import type { StudioBlock, StudioBlockLayout } from '@kppdf/data-access';

/** Magnetic snap threshold in px — matches legacy builder SNAP_THRESHOLD. */
export const STUDIO_SNAP_THRESHOLD_PX = 8;

/** Layout fractions are 0–1 (backend canonical), not 0–100%. */

const DEFAULT_LAYOUT = {
  page: 1,
  x: 0,
  y: 0,
  width: 0.3,
  height: 0.12,
  zIndex: 1,
  rotation: 0,
} as const;

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function normalizeStudioBlockLayout(
  layout: Partial<StudioBlockLayout> | null | undefined,
  maxPage = 1,
): StudioBlockLayout {
  const pageMax = Math.max(1, Math.floor(finite(maxPage, 1)));
  const page = Math.min(pageMax, Math.max(1, Math.floor(finite(layout?.page, DEFAULT_LAYOUT.page))));
  const width = Math.min(1, Math.max(0.001, finite(layout?.width, DEFAULT_LAYOUT.width)));
  const x = Math.min(1 - width, Math.max(0, finite(layout?.x, DEFAULT_LAYOUT.x)));
  const rawHeight =
    layout?.height === undefined
      ? undefined
      : Math.min(1, Math.max(0.001, finite(layout.height, DEFAULT_LAYOUT.height)));
  const y =
    rawHeight === undefined
      ? Math.min(1, Math.max(0, finite(layout?.y, DEFAULT_LAYOUT.y)))
      : Math.min(1 - rawHeight, Math.max(0, finite(layout?.y, DEFAULT_LAYOUT.y)));

  return {
    page,
    x,
    y,
    width,
    ...(rawHeight === undefined ? {} : { height: rawHeight }),
    zIndex: Math.max(0, Math.floor(finite(layout?.zIndex, DEFAULT_LAYOUT.zIndex))),
    rotation: finite(layout?.rotation, DEFAULT_LAYOUT.rotation),
  };
}

/** Migrate legacy mistaken 0–100% values saved before fraction fix. */
export function coerceStudioBlockLayout(layout: StudioBlockLayout): StudioBlockLayout {
  if (layout.width > 1 || layout.x > 1 || layout.y > 1 || (layout.height ?? 0) > 1) {
    return normalizeStudioBlockLayout({
      ...layout,
      x: layout.x / 100,
      y: layout.y / 100,
      width: layout.width / 100,
      height: layout.height !== undefined ? layout.height / 100 : undefined,
    });
  }
  return normalizeStudioBlockLayout(layout);
}

export function clampStudioLayoutPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): { readonly x: number; readonly y: number } {
  const maxX = Math.max(0, 1 - width);
  const maxY = Math.max(0, 1 - height);
  return {
    x: Math.max(0, Math.min(maxX, x)),
    y: Math.max(0, Math.min(maxY, y)),
  };
}

export function snapStudioLayoutToPageEdges(
  x: number,
  y: number,
  width: number,
  height: number,
  sheetWidthPx: number,
  sheetHeightPx: number,
  thresholdPx = STUDIO_SNAP_THRESHOLD_PX,
): { readonly x: number; readonly y: number } {
  const pw = Math.max(1, sheetWidthPx);
  const ph = Math.max(1, sheetHeightPx);
  const tx = thresholdPx / pw;
  const ty = thresholdPx / ph;

  let nx = x;
  let ny = y;

  if (Math.abs(x) <= tx) nx = 0;
  else if (Math.abs(1 - (x + width)) <= tx) nx = 1 - width;

  if (Math.abs(y) <= ty) ny = 0;
  else if (Math.abs(1 - (y + height)) <= ty) ny = 1 - height;

  return clampStudioLayoutPosition(nx, ny, width, height);
}

export function studioCenteredTextLayout(
  width: number,
  height: number,
  zIndex: number,
  page = 1,
): StudioBlockLayout {
  return normalizeStudioBlockLayout({
    page,
    x: Math.max(0, 0.5 - width / 2),
    y: Math.max(0, 0.5 - height / 2),
    width,
    height,
    zIndex,
    rotation: 0,
  });
}

export function studioCenteredImageLayout(zIndex: number, page = 1): StudioBlockLayout {
  return studioCenteredTextLayout(0.4, 0.28, zIndex, page);
}

const STUDIO_IMAGE_TARGET_WIDTH = 0.6;
const PORTRAIT_SHEET_ASPECT = 210 / 297;

/** Layout height/width ratio preserving image visual aspect on the sheet. */
export function studioImageLayoutAspectRatio(
  block: StudioBlock,
  sheetAspect = PORTRAIT_SHEET_ASPECT,
): number {
  const nw = block.settings?.['naturalWidth'];
  const nh = block.settings?.['naturalHeight'];
  if (typeof nw === 'number' && typeof nh === 'number' && nw > 0 && nh > 0) {
    return (sheetAspect * nh) / nw;
  }
  const layout = block.layout;
  if (layout && layout.width > 0) {
    const h = layout.height ?? 0.28;
    return h / layout.width;
  }
  return 0.28 / 0.4;
}

export function studioImageLayoutFromNaturalSize(
  naturalW: number,
  naturalH: number,
  zIndex: number,
  page = 1,
  sheetAspect = PORTRAIT_SHEET_ASPECT,
): StudioBlockLayout {
  const naturalAspect = naturalW / Math.max(1, naturalH);
  let width = STUDIO_IMAGE_TARGET_WIDTH;
  let height = (width * sheetAspect) / naturalAspect;
  if (height > 1) {
    height = 1;
    width = (height * naturalAspect) / sheetAspect;
  }
  if (width > 1) {
    width = 1;
    height = (width * sheetAspect) / naturalAspect;
  }
  return studioCenteredTextLayout(width, height, zIndex, page);
}

/** Proportional corner resize: width follows mouse delta, height derived from aspect. */
export function studioProportionalImageResize(
  startLayout: StudioBlockLayout,
  deltaWidthFraction: number,
  aspectRatio: number,
): { readonly width: number; readonly height: number } {
  let width = Math.max(0.06, Math.min(1 - startLayout.x, startLayout.width + deltaWidthFraction));
  let height = width * aspectRatio;
  if (startLayout.y + height > 1) {
    height = Math.max(0.04, 1 - startLayout.y);
    width = Math.min(1 - startLayout.x, height / aspectRatio);
    height = width * aspectRatio;
  }
  height = Math.max(0.04, Math.min(1 - startLayout.y, height));
  width = Math.max(0.06, Math.min(1 - startLayout.x, width));
  return { width, height };
}

export async function studioReadImageNaturalSize(
  file: File,
): Promise<{ readonly width: number; readonly height: number }> {
  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось прочитать размер изображения'));
    };
    img.src = url;
  });
}

export function studioCenteredTableLayout(zIndex: number, page = 1): StudioBlockLayout {
  return normalizeStudioBlockLayout({
    page,
    x: 0.08,
    y: 0.2,
    width: 0.84,
    height: 0.25,
    zIndex,
    rotation: 0,
  });
}

/** Top-to-bottom list order → zIndex (top = front). */
export function zIndexFromLayerOrder(blockIdsTopToBottom: readonly string[]): Map<string, number> {
  const n = blockIdsTopToBottom.length;
  const map = new Map<string, number>();
  blockIdsTopToBottom.forEach((id, index) => {
    map.set(id, Math.max(0, n - 1 - index));
  });
  return map;
}
