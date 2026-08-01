import { normalizeBlockLayout } from '../template-block/template-block-layout';
import type { BlockLayout } from '../template-block/template-block-layout';

/**
 * Compile normalized block geometry into a deterministic inline style.
 * Numeric values are produced by the trusted server-side layout normalizer,
 * so the result is safe to embed in the renderer's generated HTML.
 */
export function blockLayoutStyle(layout: BlockLayout | null | undefined): string {
  if (!layout) return '';
  const safeLayout = normalizeBlockLayout(layout);

  const declarations = [
    'position:absolute',
    `left:${safeLayout.x * 100}%`,
    `top:${safeLayout.y * 100}%`,
    `width:${safeLayout.width * 100}%`,
    `z-index:${safeLayout.zIndex}`,
  ];

  if (safeLayout.height !== undefined) declarations.push(`height:${safeLayout.height * 100}%`);
  if (safeLayout.rotation !== 0) declarations.push(`transform:rotate(${safeLayout.rotation}deg)`);

  return declarations.join(';');
}
