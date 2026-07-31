import {
  clampPositionedGeometry,
  clientToDocumentPoint,
  createDefaultPositionedGeometry,
  documentToClientPoint,
  getPageDimensions,
  readPositionedGeometry,
  renderedScale,
} from './builder-geometry';

describe('builder geometry contract', () => {
  it('returns canonical dimensions for portrait and landscape pages', () => {
    expect(getPageDimensions('A4', 'portrait')).toEqual({ width: 794, height: 1123 });
    expect(getPageDimensions('A4', 'landscape')).toEqual({ width: 1123, height: 794 });
    expect(getPageDimensions('Letter', 'portrait')).toEqual({ width: 816, height: 1056 });
    expect(getPageDimensions('Letter', 'landscape')).toEqual({ width: 1056, height: 816 });
  });

  it('converts document coordinates through scale and round-trips without drift', () => {
    const viewport = { left: 120, top: 80, scale: 0.75 };
    const documentPoint = { x: 248, y: 391 };
    const clientPoint = documentToClientPoint(documentPoint, viewport);

    expect(clientToDocumentPoint(clientPoint.x, clientPoint.y, viewport)).toEqual(documentPoint);
    expect(renderedScale(595.5, 'A4', 'portrait')).toBeCloseTo(0.75);
  });

  it('supports explicit scroll offsets for callers that use a document origin', () => {
    const viewport = { left: 100, top: 50, scale: 1, scrollLeft: 40, scrollTop: 25 };
    const point = clientToDocumentPoint(160, 125, viewport);

    expect(point).toEqual({ x: 100, y: 100 });
    expect(documentToClientPoint(point, viewport)).toEqual({ x: 160, y: 125 });
  });

  it('clamps position and size to page bounds, padding, and minimums', () => {
    expect(
      clampPositionedGeometry(
        { x: -50, y: -10, width: 1, height: 5000 },
        { width: 400, height: 300 },
        16,
      ),
    ).toEqual({ x: 16, y: 16, width: 20, height: 268 });

    expect(
      clampPositionedGeometry(
        { x: 390, y: 290, width: 60, height: 40 },
        { width: 400, height: 300 },
        0,
      ),
    ).toEqual({ x: 340, y: 260, width: 60, height: 40 });
  });

  it('creates a valid default positioned geometry', () => {
    const page = getPageDimensions('A5', 'landscape');
    const geometry = createDefaultPositionedGeometry(page);

    expect(geometry.width).toBeGreaterThanOrEqual(20);
    expect(geometry.height).toBeGreaterThanOrEqual(20);
    expect(geometry.x + geometry.width).toBeLessThanOrEqual(page.width - 24);
    expect(geometry.y + geometry.height).toBeLessThanOrEqual(page.height - 24);
  });

  it('only reads a positioned geometry with a complete finite contract', () => {
    expect(
      readPositionedGeometry({
        layoutMode: 'positioned',
        geometry: { x: 10, y: 20, width: 100, height: 50 },
      }),
    ).toEqual({ x: 10, y: 20, width: 100, height: 50 });
    expect(
      readPositionedGeometry({ layoutMode: 'flow', geometry: { x: 1, y: 2, width: 3, height: 4 } }),
    ).toBeNull();
    expect(
      readPositionedGeometry({ layoutMode: 'positioned', geometry: { x: 1, y: 2 } }),
    ).toBeNull();
    expect(
      readPositionedGeometry({
        layoutMode: 'positioned',
        geometry: { x: NaN, y: 2, width: 3, height: 4 },
      }),
    ).toBeNull();
  });
});
