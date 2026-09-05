# TZ-NX-WAREHOUSE-W2-BALANCES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Verification

- acceptance criteria: PASS — StorageItem balances list (material/product, warehouse, quantity, reserved, minimum, zone); warehouse + inclusive low-stock (`quantity <= minQuantity`) filters; `?materialId=` deep-link prefilter with catalog-resolved label; put-on-stock (with material selector when unfiltered) and signed adjust dialogs against the existing `POST /materials/:materialId/storage-items` / `POST /storage-items/:id/adjust` API shapes; negative adjustment reduces displayed quantity with immediate row merge.
- focused tests: PASS — `storage-items.page.spec.ts`, `storage-dialogs.spec.ts`, `pi-storage-items.service.spec.ts` (3 suites / 11 tests).
- typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- lint: PASS on W2-owned paths (0 errors/warnings).
- architecture: PASS — `pnpm architecture:check` (root, 1445 files) and `pnpm architecture:check:nx` (387 source files, 0 violations).
- final build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web`; `storage-items-page` chunk built; only the pre-existing unrelated Studio NG8102 / Gantt style-budget warnings.
- broad-suite disclosure: full `nx test kppdf-web` run shows exactly one unrelated failing suite, `app-shell.component.spec.ts` (2/15 tests, header quick-nav chip count 6→7 — layout/nav scope, not `storage-items`/warehouse). Recorded as N/A for W2, not fixed — out of scope, no UI refactor performed.

## Delivered

- `storage-items.page.ts` — live balances table replacing the W1 placeholder, with warehouse/material/low-stock filters and `?materialId=` deep-link support.
- `storage-put-on-stock-dialog.component.ts` / `storage-adjust-dialog.component.ts` — put-on-stock (material selector when unfiltered, preselected when deep-linked) and signed adjustment forms.
- `pi-storage-items.service.ts` + `storage-item.types.ts` (`frontend-nx/libs/data-access/src/lib/warehouse/`) — typed HTTP client for the existing StorageItem API surface.
- `docs/pages/storage-items.page.md` updated with the NX W2 implementation, API, state, and verification notes.

## Scope disclosure

- Backend app logic, `/supply`, inventory dashboard, shipping, Gantt, legacy `frontend/`, and W1 routes/nav were not touched.
- No reservation writes or transfer creation were added — balances only; W3 owns stock-movement create UI.
- `StorageItem` remains the sole quantity SoT; no `Material.stockQty` write or duplicate ledger path was introduced.

## Commit

- see git log
