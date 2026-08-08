# TZ-CATALOG-DEDUP-304 — detail edit openers

**Status:** DONE
**Source:** `tasks/_backlog/TZ-CATALOG-DEDUP-304-detail-edit-opener.md`
**Dependency:** DEDUP-301 is present on synchronized main (`c29ce4bb` ancestor).

## Claim slot

- agent_id: `agent-acfffc1331`
- claimed_at: `2026-08-08T10:35:00Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — registry reports unknown task; checklist is source of truth

## Conflict keys

- `frontend/src/app/pages/products/product-detail.page.ts`
- `frontend/src/app/pages/materials/material-detail.page.ts`
- `docs/audits/2026-08-08-data-entry-dedupe-audit.md`
- `docs/agent-checklists/TZ-CATALOG-DEDUP-304.md`

## Plan

- Add a thin «Редактировать» action to product detail using ProductFormDialog with current product data.
- Add the same action to material detail using MaterialFormDialog with current material data.
- Use the existing dialog close callback to reload each detail resource.
- Add only focused tests if the existing detail specs can cover the opener without broad refactoring; no new form/payload/composition changes.

## Verification

- tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`
- Jest: PASS — material-detail, 1 suite / 6 tests
- lint: PASS — scoped ESLint on product/material detail pages
- diff-check: PASS
- review: PASS — no critical issues
- archive/lock/progress/map: DONE
