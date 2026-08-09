# TZ-SALES-331 — Create КП price/VAT/footer

> Status: **READY FOR REVIEW**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md`
> Marker: active until visual PASS and closeout

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T15:03:14Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-331; sync tasks first`

## Conflict disclosure

- TZ-SALES-330 is DONE and its active marker is removed.
- Foreign DOC-343 dirty `document-template.service.ts` orientation WIP was preserved separately and excluded from this scope.
- No Product PATCH, discount column, per-line VAT/discount, quotation persistence, snapshot, 317 shell rewrite, 320/322, or deploy.

## Implementation

- Markup computes request-only effective prices from immutable draft/catalog base prices, rounded to kopecks and clamped to −100…1000.
- Inspector exposes whole-deal VAT with default 20% and copy-on-write price hint.
- Build DTO accepts `dealTotals`; backend computes line total and renders a right-aligned `Итого` / `в т.ч. НДС` footer only for the designated live line-items table.
- VAT 0 hides only the VAT row; admin table preview remains footer-free without deal context.
- 330 `tableLayout` and frozen shell remain intact.

## Gates

- Backend tsc PASS; document-build e2e 10/10 PASS.
- Frontend tsc PASS; proposal-create Jest 12/12 PASS; diff-check PASS; FE Prettier PASS.

## Review handoff

- READY FOR REVIEW — visual: on `/proposals/create`, verify 10% markup changes A4 «Цена»/«Сумма», VAT 20% shows footer right-aligned, VAT 0 hides VAT row, and no discount column appears.
