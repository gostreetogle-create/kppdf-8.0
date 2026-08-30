/** Default list page size for Paper & Ink paginated lists (PO: UX-314 / audit 2026-08-16). */
export const PI_DEFAULT_PAGE_SIZE = 10;

/** Allowed page-size options for `<app-pi-pagination>` select. */
export const PI_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type PiPageSizeOption = (typeof PI_PAGE_SIZE_OPTIONS)[number];
