# TZ-SALES-328 — Create КП shop-витрина изделий

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T13:51:37Z
closed_by: Buffy / agent-6c3d05b80e

## Result

- Create КП product rail uses the existing `PiShowcaseCard md` contract with photos/placeholders and equal-height cards.
- Search, category filter, and API-backed `page`/`limit: 12` pagination are wired to the product list.
- `Добавить` emits the in-memory draft line and keeps the products flyout open.
- `Редактировать` reuses `ProductFormDialogComponent`; `Создать изделие` reuses `QuickCreateDialogComponent`; successful saves reload the current page.
- Final visual variant is md cards in exactly three columns in the 58rem products flyout, with narrower fallbacks preserving layout and no A4 compression.
- The 326 outside-dismiss behavior and fixed A4 rails|center geometry remain unchanged.

## Verification

- Implementation commits: `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md × 3 + 58rem final visual).
- Frontend tsc: PASS.
- Focused rail Jest: **4/4 PASS**.
- Proposal-create Jest: **11/11 PASS**.
- `git diff --check`: PASS.
- Cursor/PO visual PASS: final md + 3-column + 58rem variant accepted.
- Scope guard: product code only from the 328 scope; DOC-343/document-template.service.ts, OPS WIP, 325 bind, 322/320, and deploy excluded.
