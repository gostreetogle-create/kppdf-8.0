# TZ-PRODUCTS-310 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (executed in the host-managed Freebuff worktree)

## Scope

Removed the static `ProductFormDialogComponent` import from `ProductBomPanelComponent`. Nested product editing now loads the form dynamically after the product lookup, so the edit dialog no longer evaluates the ProductFormDialog ↔ ProductBomPanel static cycle that caused an undefined `ɵcmp`.

## Acceptance evidence

- `ProductFormDialogComponent` still embeds `ProductBomPanel` in edit mode and the existing `data-test="product-bom-panel"` regression remains green.
- New BOM-panel regression verifies nested product edit resolves the dynamic component and opens the dialog.
- Static grep confirms no `ProductFormDialogComponent` import remains in `product-bom-panel.component.ts`.
- Angular development build emits successfully and produces lazy chunks.

## Gates

- acceptance criteria: PASS by focused regression/build/static graph check
- frontend typecheck: PASS (`tsc -p tsconfig.app.json --noEmit`)
- focused tests: PASS (2 suites, 33/33)
- frontend development build: PASS
- ESLint: PASS for changed TypeScript files
- `git diff --check`: PASS
- madge: documented limitation — reports the intentional dynamic import as a graph edge and one unrelated pre-existing template-block cycle; no static mutual import remains
- Prettier: documented repository CRLF/pre-existing baseline difference; no product behavior issue
- live browser smoke: NOT RUN; backend/data were unavailable in the isolated session
- deploy: NO (`deploy.ps1` not run)

## Files

- `frontend/src/app/pages/products/product-bom-panel.component.ts`
- `frontend/src/app/pages/products/product-bom-panel.component.spec.ts`
- `docs/pages/products.page.md`
- `docs/agent-checklists/TZ-PRODUCTS-310.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-PRODUCTS-310-product-bom-circular-cmp.lock`
