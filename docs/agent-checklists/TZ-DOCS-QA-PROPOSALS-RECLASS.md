# TZ-DOCS-QA-PROPOSALS-RECLASS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DOCS-QA-PROPOSALS-RECLASS.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T07:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)

## Preflight
- [x] Prompt, pack, previous docs closeouts, proposals page/facade/service, and KP page doc read.
- [x] `_active/` checked; no conflicting claim.
- [x] No PDF/output implementation planned.

## Acceptance
- [x] Proposals list/list alias/create redirect classified V.
- [x] Checklist №1 has path:symbol evidence.
- [x] Checklist №2 has one precise generated-document/output gap.
- [x] Quotation V; generated-document B if orphan.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts`, `frontend-nx/libs/features/src/lib/proposals/proposals-list.facade.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`.
- Constraints: docs-only reclassification; no route or product changes.
- Validation: evidence review and docs consistency.

## Integrity slot
- [x] Type = docs-only.
- [x] FIC/page/domain/readiness/coupling changes = N/A.
- [x] Foreign WIP excluded.

## Gates
- Evidence review: PASS — proposals list/convert/studio bridge traced to `PiQuotationsService`.
- Route matrix: PASS — `/proposals*` three rows V.
- BE classification: PASS — `quotation` V, `generated-document` isolated B output gap.
- Product-code diff: PASS — no product code changed.
