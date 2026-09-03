# TZ-NX-KP-FAMILY-S46-VARIANT-STUDIO checklist

> Status: **DONE** (archived `2026-09-03`)
> Marker: created at claim, removed at archive

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T19:10:00Z
- workspace: `D:\kppdf-8.0`
- branch: `main`
- baseline_sha: `6b77407f` (S45 pushed; build PASS exit 0 at S45 close)
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight Check Output

- **Context read:** `tasks/TZ-NX-KP-FAMILY-S46-VARIANT-STUDIO.md`, S45/S44 records, `docs/pages/proposals.page.md`, `proposals-list.page.ts` (openInStudio S20/S37 helper), `libs/data-access/src/lib/sales/quotation.types.ts` (`QuotationFamilyMemberSummary`, `QuotationFamilyResponse`).
- **Key Constraints:** TZ-exec on `frontend-nx` only; no attach/sync dialog changes; no studio-editor internals; `nx build kppdf-web` last; sequential vs other FE NX TZ.
- **Planned Deliverable:** «В студии» CTA per variant row in the family panel → shared `openQuotationInStudio(id, studioDocumentId?)` navigation (prefer linked studio doc; else `/studio?quotationId=<variantId>`); specs.
- **Validation Path:** FIC §A N/A (existing routes); scoped jest specs; `nx build kppdf-web` last.

## Acceptance

- [x] Variant row in family panel opens studio with the variant id (not master)
- [x] Prefer existing linked studio document (`/studio/:docId`); else `/studio?quotationId=`
- [x] Specs PASS (visibility + both navigation branches); `nx build kppdf-web` PASS last

## Gates (facts)

- Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0 at S45 close, `6b77407f`)
- Scoped jest `proposals-list.page.spec`: **22/22 PASS** (incl. 3 new S46 tests)
- Scoped eslint `apps/kppdf-web/src/app/pages/proposals/`: **0 problems** (exit 0)
- `pnpm exec nx build kppdf-web` (last): **PASS (exit 0)**

## Integrity slot (до archive)

- [x] Тип изменения: page (existing `/proposals` + `/studio` routes)
- [x] FIC §A–E: N/A
- [x] page.md / PAGE-TZ-INDEX: S46 bullet + row
- [x] Чужой WIP не в коммите; conflict keys = page.ts + spec + records
- [x] Канон: DOCS-INTEGRITY + TZ-NX-BUILD-INTEGRITY

## Executor report

Delivered on `frontend-nx` only:
- `proposals-list.page.ts`: variant rows inside the family panel now carry «В студии» (`proposal-member-open-studio`) → `openVariantInStudio(member)` → shared private `openQuotationInStudio(quotationId, studioDocumentId?)`: prefers an existing studio document (by `linkedQuotationId`/`context.quotationId`) and navigates `/studio/:docId`, otherwise `/studio?quotationId=<variantId>`. Row-level `openInStudio` refactored to the same helper — behavior unchanged.
- Specs: 3 S46 tests (visibility on variant rows; fallback nav with the variant id, not master; linked-doc nav when a studio document already exists). Studio-doc list provided at setup time since the page loads it on init.
- Docs: `docs/pages/proposals.page.md` NX S46 bullet; PAGE-TZ-INDEX `/proposals` row updated.

## Closeout

- [x] archive + wave [x] + `_NOW`/QUEUE sync + remove `_active`
- Status = DONE
- closed_at: 2026-09-03
