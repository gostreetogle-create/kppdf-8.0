# TZ-SALES-335 — DONE

- closed_at: `2026-08-09T19:35:00Z`
- status: **DONE**
- scope: Create-instance KP line-item columns, quantity editing, and existing photo-column rendering only
- feature_sha: `d6bd43b9`
- closeout_sha: `pending closeout commit`
- lock: `.mimocode/locks/TZ-SALES-335-kp-line-items-columns-photo.lock`

## Outcome

Create КП now applies canonical «Кол-во», «Цена» and «Сумма» columns to the selected live line-items table as a request-only instance layout. The product rail exposes quantity editing; changing quantity rebuilds the A4 preview and recalculates the displayed sum. Product thumbnails flow through `photoUrl` and render only when an existing table column is a photo/«Рисунок» key. Shared TableTemplate data is never patched, and no photo column is invented.

## Acceptance evidence

- Frontend TypeScript: **PASS**.
- Backend TypeScript: **PASS**.
- Focused proposal/Create Jest: **23/23 PASS**.
- Table-template Jest: **2/2 PASS** — safe image cell and unsafe URL rejection.
- Prettier, ESLint and diff-check: **PASS**.
- Browser self-verify on canonical main: selected template and product, changed quantity `1 → 3`; A4 displayed «Кол-во» 3, «Цена» 7 000,00 ₽ and «Сумма» 21 000,00 ₽; build payload included the product thumbnail URL. Table rail showed the actual live-table columns and made no template PATCH request.
- Existing photo/«Рисунок» behavior is covered by backend focused Jest; the selected live table had no photo key, so no column was fabricated.

## Scope disclosure

Only KP Create line-item preview/layout, quantity input, and safe photo-cell rendering were included. Foreign `system-role.guard*`, `roles-admin*`, DOC-343/344 WIP and frozen A4 overlay shell 317 / print-PDF 320 were not staged. Deploy was not run.
