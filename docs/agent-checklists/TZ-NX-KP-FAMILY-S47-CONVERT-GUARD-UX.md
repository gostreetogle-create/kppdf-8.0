# TZ-NX-KP-FAMILY-S47-CONVERT-GUARD-UX checklist

> Status: **DONE** (archived `2026-09-03`)
> Marker: created at claim, removed at archive

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T19:35:00Z
- workspace: `D:\kppdf-8.0`
- branch: `main`
- baseline_sha: `3c74ecd2` (S46 pushed; build PASS exit 0 at S46 close)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight Check Output

- **Context read:** `tasks/TZ-NX-KP-FAMILY-S47-CONVERT-GUARD-UX.md`, S37/S42 records, `proposals-list.page.ts` (convert CTA + `filtered()`), `proposals-list.page.spec.ts` (S37 convert describe), backend `quotation.service.ts`/controller (`assertConvertibleFamilyRole` — variant → 400).
- **Key Constraints:** TZ-exec on `frontend-nx` only; no backend convert / family role assert changes; no orders-create flow; `nx build kppdf-web` last.
- **Planned Deliverable:** Audit every convert CTA on the page (list + expand); guard «В заказ» for `familyRole === 'variant'` at template + method level; specs.
- **Validation Path:** FIC §A N/A; scoped jest specs; `nx build kppdf-web` last.

## Acceptance

- [x] No UI path converts a variant (list hides variants; convert guard added)
- [x] Accepted master row still converts
- [x] Specs PASS; `nx build kppdf-web` PASS last

## Gates (facts)

- Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0 at S46 close, `3c74ecd2`)
- Scoped jest `proposals-list.page.spec`: **25/25 PASS** (incl. 3 new S47 tests)
- Scoped eslint `apps/kppdf-web/src/app/pages/proposals/`: **0 problems** (exit 0)
- `pnpm exec nx build kppdf-web` (last): **PASS (exit 0)**

## Integrity slot (до archive)

- [x] Тип изменения: page (existing `/proposals` UX only)
- [x] FIC §A–E: N/A
- [x] page.md / PAGE-TZ-INDEX: S47 bullet + row
- [x] Чужой WIP не в коммите; conflict keys = page.ts + spec + records
- [x] Канон: DOCS-INTEGRITY + TZ-NX-BUILD-INTEGRITY

## Executor report

Delivered on `frontend-nx` only:
- Audit: only one convert CTA exists — the row-level `proposal-convert-order` (status `accepted`); the family expand panel has no convert CTA. Variant rows are already absent from the flat list (S42 `filtered()` excludes `familyRole === 'variant'`).
- `proposals-list.page.ts` defense in depth: template now renders «В заказ» only when `row.status === 'accepted' && (row.familyRole ?? 'solo') !== 'variant'`; `convertToOrder()` early-returns for variant rows before any API call.
- Specs: 3 S47 tests (convert button appears only on the accepted master row, never variant; direct `convertToOrder(variant)` does not POST/navigate; accepted master still converts → `/orders/:orderId`).
- Docs: `docs/pages/proposals.page.md` NX S47 bullet; PAGE-TZ-INDEX `/proposals` row updated.

## Closeout

- [x] archive + wave [x] + `_NOW`/QUEUE sync + remove `_active`
- Status = DONE
- closed_at: 2026-09-03
