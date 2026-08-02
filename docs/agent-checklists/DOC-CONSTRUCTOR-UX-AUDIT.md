# Doc-constructor UX audit — 2026-08-02 (Cursor)

Read-only audit → executable TZs. PO browser review can start after these
land or in parallel on pages that already work.

## Findings → TZ

| # | Smell | TZ |
|---|--------|-----|
| 1 | Два реестра шаблонов (nav Конструктор + Шаблоны) | [TZ-DOC-324](../../tasks/TZ-DOC-324-builder-templates-ia.md) |
| 2 | Left palette мёртва; insert только top dropdowns; docs врут | [TZ-DOC-325](../../tasks/TZ-DOC-325-builder-insert-palette.md) |
| 3 | Legacy `category` на фронте / hints после DOC-323 | [TZ-DOC-326](../../tasks/TZ-DOC-326-textblock-categoryid-ui.md) |

## Order

DOC-324 → DOC-325 → DOC-326 (shared `builder.page.ts`).  
Align open DOC-317 (filter on palette) / SUPERSEDE DOC-318 (topbar filter).

## Out of scope this audit

- Visual polish / Paper & Ink tweaks without IA change (PO browser later)
- Generated documents archive page (looks single-purpose OK)
- Backend PDF generation quality
