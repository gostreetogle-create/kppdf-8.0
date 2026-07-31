export type BuilderPageSize = 'A3' | 'A4' | 'A5' | 'Letter';
export type BuilderOrientation = 'portrait' | 'landscape';

export interface PositionedGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedGeometryChange {
  block: import('../../../shared/template-block/template-block.types').TemplateBlock;
  geometry: PositionedGeometry;
}

export interface DocumentPoint {
  x: number;
  y: number;
}

export interface CanvasViewport {
  left: number;
  top: number;
  scale: number;
  scrollLeft?: number;
  scrollTop?: number;
}

export interface PageDimensions {
  width: number;
  height: number;
}

export const POSITIONED_MIN_WIDTH = 20;
export const POSITIONED_MIN_HEIGHT = 20;

/** Canonical CSS-pixel page sizes at 96dpi, before orientation is applied. */
const PAGE_DIMENSIONS: Record<BuilderPageSize, PageDimensions> = {
  A3: { width: 1123, height: 1587 },
  A4: { width: 794, height: 1123 },
  A5: { width: 559, height: 794 },
  Letter: { width: 816, height: 1056 },
};

export function getPageDimensions(
  pageSize: BuilderPageSize = 'A4',
  orientation: BuilderOrientation = 'portrait',
): PageDimensions {
  const base = PAGE_DIMENSIONS[pageSize] ?? PAGE_DIMENSIONS.A4;
  return orientation === 'landscape' ? { width: base.height, height: base.width } : { ...base };
}

export function readPositionedGeometry(
  settings: Record<string, unknown> | undefined,
): PositionedGeometry | null {
  if (settings?.['layoutMode'] !== 'positioned') return null;
  const value = settings['geometry'];
  if (!value || typeof value !== 'object') return null;
  const geometry = value as Record<string, unknown>;
  const values = ['x', 'y', 'width', 'height'].map((key) => geometry[key]);
  if (!values.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    return null;
  }
  return {
    x: values[0] as number,
    y: values[1] as number,
    width: values[2] as number,
    height: values[3] as number,
  };
}

export function createDefaultPositionedGeometry(
  page: PageDimensions = getPageDimensions(),
): PositionedGeometry {
  const padding = Math.min(24, Math.floor(Math.min(page.width, page.height) / 8));
  return clampPositionedGeometry(
    { x: padding, y: padding, width: Math.min(400, page.width - padding * 2), height: 120 },
    page,
    padding,
  );
}

export function clampPositionedGeometry(
  geometry: PositionedGeometry,
  page: PageDimensions,
  padding = 0,
  minWidth = POSITIONED_MIN_WIDTH,
  minHeight = POSITIONED_MIN_HEIGHT,
): PositionedGeometry {
  const safePadding = Math.max(0, Math.round(padding));
  const width = Math.min(
    Math.max(minWidth, Math.round(geometry.width)),
    Math.max(minWidth, page.width - safePadding * 2),
  );
  const height = Math.min(
    Math.max(minHeight, Math.round(geometry.height)),
    Math.max(minHeight, page.height - safePadding * 2),
  );
  const maxX = Math.max(safePadding, page.width - safePadding - width);
  const maxY = Math.max(safePadding, page.height - safePadding - height);

  return {
    x: Math.min(maxX, Math.max(safePadding, Math.round(geometry.x))),
    y: Math.min(maxY, Math.max(safePadding, Math.round(geometry.y))),
    width,
    height,
  };
}

export function clientToDocumentPoint(
  clientX: number,
  clientY: number,
  viewport: CanvasViewport,
): DocumentPoint {
  const scale = viewport.scale > 0 && Number.isFinite(viewport.scale) ? viewport.scale : 1;
  return {
    x: Math.round((clientX - viewport.left + (viewport.scrollLeft ?? 0)) / scale),
    y: Math.round((clientY - viewport.top + (viewport.scrollTop ?? 0)) / scale),
  };
}

export function documentToClientPoint(
  point: DocumentPoint,
  viewport: CanvasViewport,
): DocumentPoint {
  const scale = viewport.scale > 0 && Number.isFinite(viewport.scale) ? viewport.scale : 1;
  return {
    x: viewport.left + point.x * scale - (viewport.scrollLeft ?? 0),
    y: viewport.top + point.y * scale - (viewport.scrollTop ?? 0),
  };
}

export function renderedScale(
  renderedWidth: number,
  pageSize: BuilderPageSize = 'A4',
  orientation: BuilderOrientation = 'portrait',
): number {
  const documentWidth = getPageDimensions(pageSize, orientation).width;
  return renderedWidth > 0 ? renderedWidth / documentWidth : 1;
}
