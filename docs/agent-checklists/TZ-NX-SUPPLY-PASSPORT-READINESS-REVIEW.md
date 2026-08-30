# TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md`
> Mode: **analysis-only** — no code/schema/API/`package.json` changed; nothing under
> `frontend/**`, `backend/**`, `frontend-nx/**` touched; no DB writes; no XLSX import.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T20:32:54Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `tasks/_active/` checked at claim time — held only `.gitkeep` +
      `TZ-NX-REGISTRY-READINESS-MARATHON.md` (a plan document, not a competing claim on the same
      conflict keys), no conflicting claim
- [x] Read `tasks/TZ-NX-REGISTRY-READINESS-MARATHON.md` in full; found and flagged a filename
      mismatch in its Inputs list (see archive "Correction to Marathon inputs")
- [x] Read both named prior archives in full (`TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`,
      `TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`) plus this same conversation's own prior
      `TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md`
- [x] Verified `data/Снабжение.xlsx` (317746 B) and `data/Pasports.xlsx` (30511047 B) present and
      unchanged in size since the prior read-only audit — **not re-opened, not imported**
- [x] Read every named backend schema in full: `supply-request.schema.ts`, `supply-task.schema.ts`,
      `material.schema.ts`, `organization.schema.ts`, `storage-item.schema.ts`,
      `product-passport.schema.ts`; grepped `product.schema.ts` for composition fields
- [x] Confirmed module completeness (schema+controller+service, not schema alone) for
      `product-passport` and `warehouse` via glob
- [x] Confirmed no duplicate/parallel entities exist: no `supplier*.schema.ts`, no second
      passport-product table; checked photo-storage precedent (`product-photo.schema.ts`,
      `photos/photo.schema.ts`)
- [x] Full glob of `frontend-nx/libs/data-access/src/lib/**` and
      `frontend-nx/apps/kppdf-web/.../registries/data/*.registry.ts` to determine exact NX presence
      per entity — no guessing from memory
- [x] Verified the Units DELETE backend fix status as a marathon-step-4 cross-check: read the
      uncommitted `unit.service.ts` diff and ran the new `unit.service.spec.ts` read-only
      (in-memory mock, no DB) — 3/3 PASS, but diff confirmed **uncommitted** (not "merged and
      verified on main" per the backlog task's own DEPENDS line)
- [x] Claim slot filled; `tasks/_active/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md` was on disk
      during the review

## Acceptance — 13 checklist items covered

- [x] 1. SupplyRequest — PARTIAL (backend PRESENT, NX MISSING)
- [x] 2. SupplyTask — BLOCKED on NX side (Order NX data-access also missing)
- [x] 3. Material — PRESENT (both layers)
- [x] 4. Organization/Supplier — PARTIAL (backend PRESENT, correctly non-duplicated; NX MISSING)
- [x] 5. StorageItem — PARTIAL/MISSING (backend PRESENT; NX MISSING + Warehouse NX also missing)
- [x] 6. ProductPassport — PARTIAL (backend PRESENT; NX has an unrelated computed preview only)
- [x] 7. Product/Module composition — PRESENT (core mechanism; P2 polish open, non-blocking)
- [x] 8. Invoice/delivery fields — MISSING (confirmed absent from schema; PO decision already recorded)
- [x] 9. Status/priority/category/unit mappings — PARTIAL (decisions recorded, not yet implemented)
- [x] 10. Passport Product matching — BLOCKED (the hard blocker, human review required)
- [x] 11. Embedded passport photos — MISSING (precedent pattern `ProductPhoto` identified)
- [x] 12. Personal-data risks — PARTIAL (flagged, dormant, no data reproduced in this report)
- [x] 13. Duplicate entities/fields — PRESENT (no duplication found, verified clean)
- [x] Bonus: Units DELETE backend fix status (marathon step 4) — verified PRESENT-but-uncommitted

Full matrix + recommended implementation order:
`tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md`.

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched (no NX UI shipped this session)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys:
      `tasks/_active/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md` (created, removed on closeout),
      `docs/agent-checklists/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md`,
      `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md` — nothing under
      `frontend/**`/`backend/**`/`frontend-nx/**`/`package.json` touched; `data/*.xlsx` untouched
      (size-checked, not opened); the uncommitted `backend/src/modules/unit/unit.service.ts` WIP
      diff and new `unit.service.spec.ts` belong to another (peer) session — read and executed
      read-only for evidence, not modified, not committed, not claimed by this task
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/lint run, no code/schema/API changed. One pre-existing spec file
  (`backend/src/modules/unit/unit.service.spec.ts`, not authored by this task) was run read-only
  as evidence: `pnpm exec jest unit.service.spec.ts` → **3/3 PASS**, in-memory mock model, no DB
  connection, no writes.
- `git status --short` after this work shows changes only under `tasks/_active/**` (removed on
  closeout), `docs/agent-checklists/**`, `tasks/_archive/2026-08/**` — no other files touched by
  this session.

## Auditor report

Produced a 13-item PRESENT/PARTIAL/BLOCKED/MISSING readiness matrix for supply/passport future
tables, per `tasks/TZ-NX-REGISTRY-READINESS-MARATHON.md` Lane B step 1. Headline findings not
previously written down explicitly: (a) every core supply/passport backend entity
(SupplyRequest/SupplyTask/Organization/StorageItem/ProductPassport) already has a complete backend
module — the readiness gap across the board is the **NX frontend surface**, not the backend data
model; (b) two of those five have an *additional* hidden prerequisite before their own NX registry
can even be scoped — SupplyTask needs Order NX data-access (which doesn't exist), StorageItem needs
Warehouse NX data-access (which also doesn't exist) — neither prerequisite was previously
documented; (c) the existing NX "passport" feature
(`frontend-nx/apps/kppdf-web/src/app/pages/passport/**`) is a computed preview from `Product` data
and has **zero** connection to the real `ProductPassport` collection, which could be mistaken for
"passport NX support already exists" without this review's clarification; (d) the Units DELETE
backend fix (marathon step 4) is further along than the last closeout suggested — implemented,
tested, 3/3 passing — but is **uncommitted peer WIP**, so `TZ-NX-REGISTRY-UNITS-DELETE-FE` should
stay blocked until it actually lands on main, not just because tests exist locally. Full matrix,
evidence paths, and a numbered recommended implementation order (parallel lanes vs. hard sequential
gates) are in the archive. **Outcome: PASS** — pure analysis, no code/schema/API/DB touched, no
XLSX imported, no personal data reproduced, no new entities/fields/endpoints invented.

## Closeout

- [x] Archive created: `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md`.
- [x] Active marker removed: `tasks/_active/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md` deleted.
- closed_at: 2026-08-29T20:32:54Z
