/**
 * Page ACL helpers (TZ-ACCESS / product-vision-lite):
 * menu + chips hide sections the role cannot open — no accidental /forbidden.
 */

export interface PageAclChip {
  pageKey?: string;
  /** Show if the user has at least one of these page keys (TOC groups). */
  anyPageKeys?: readonly string[];
}

/**
 * Keep chips/links the user is allowed to open.
 * - No `pages` array (legacy session) → show everything.
 * - Chip without pageKey/anyPageKeys → show (same-page filters, etc.).
 */
export function filterByPageAcl<T extends PageAclChip>(
  items: readonly T[],
  pages: readonly string[] | null | undefined,
): T[] {
  if (!Array.isArray(pages)) return [...items];
  return items.filter((item) => {
    if (item.anyPageKeys && item.anyPageKeys.length > 0) {
      return item.anyPageKeys.some((k) => pages.includes(k));
    }
    if (item.pageKey) return pages.includes(item.pageKey);
    return true;
  });
}
