export type StudioOrientation = 'portrait' | 'landscape';

export interface StudioSheetRect {
  readonly width: number;
  readonly height: number;
}

const PORTRAIT_A4_RATIO = 210 / 297;
const LANDSCAPE_A4_RATIO = 297 / 210;

const SHEET_SAFE_PADDING = 8;

export function studioSheetRect(
  stageWidth: number,
  stageHeight: number,
  orientation: StudioOrientation,
): StudioSheetRect {
  const availWidth = Math.max(0, stageWidth - SHEET_SAFE_PADDING);
  const availHeight = Math.max(0, stageHeight - SHEET_SAFE_PADDING);
  const targetRatio = orientation === 'landscape' ? LANDSCAPE_A4_RATIO : PORTRAIT_A4_RATIO;
  // Fit by the side that hits the stage border first, preserving the A4 ratio.
  // Legacy bug DOCPLAT-01 used fixed 1260x730 (1.726); here width/height always stay ~1.414 / ~0.707.
  let width = availWidth;
  let height = width / targetRatio;
  if (height > availHeight) {
    height = availHeight;
    width = height * targetRatio;
  }
  return { width, height };
}
