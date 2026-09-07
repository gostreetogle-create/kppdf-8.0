# TZ-NX-SUPPLY-S6-CHROME checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-SUPPLY-S6-CHROME.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (7/7 — **WAVE DONE**)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T01:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `supply-requests.page.ts` (S3/S4 state) read; existing filters (search/status/paid) and order-label resolution reviewed
- [x] `/supply` (SupplyTask) page's existing `routerLink` order-chip pattern reused for consistency
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Фильтры работают; order link
- [x] nx build; archive

## Integrity slot (before READY / archive)

- [x] Type: page polish (existing route, no new permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/supply.page.md` — new §Chrome section + TZ reference row (WAVE DONE marker)
- [x] DOMAIN-MAP: N/A
- [x] No unrelated dirty WIP staged

## Build integrity

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — green (last gate)

## Gates (fact)

- PASS: `cd frontend-nx && nx test kppdf-web` (full) — 97 suites / 638 passed / 7 skipped / 0 failed
- PASS: `nx lint kppdf-web` changed files — 0 new issues
- PASS: `pnpm architecture:check` — 1465 files, baseline 17, 2 resolved
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- Added `neededBy` date-range filter (from/to) + a "Сбросить фильтры" toggle (shown only when a filter is active) to `supply-requests.page.ts`.
- Order column now renders a `routerLink` chip to `/orders/:id` when `orderId` resolves against the preloaded orders list (mirrors `/supply`'s existing pattern); falls back to `orderLabel` free text, then a short id, exactly as before.
- Split the empty state: "заявок вообще нет" (with the existing create CTA) vs "ничего не найдено по фильтрам" (with a reset action) — both RU, no jargon.
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/) — none staged.
- known limitation: none new.
- **This closes WAVE-NX-SUPPLY-OPS (7/7).**

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-08T01:30:00+03:00
