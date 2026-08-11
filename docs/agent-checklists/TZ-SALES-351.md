# TZ-SALES-351 checklist — KP vitrine edge shame

> Status: **DONE**
> Spec: `tasks/_backlog/kp-vitrine/TZ-SALES-351-kp-vitrine-edge-shame.md`
> Wave: WAVE-KP-SHAME-POLISH

## Claim slot

- agent_id: buffy-sales351
- claimed_at: 2026-08-11T16:48:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room registry does not know backlog TZ; status/claim attempted)

## Preflight

- [x] Canonical workspace `D:\kppdf-8.0`, branch `main`; TZ-350 remote SHA verified
- [x] `_active-map.md` and `tasks/_active/` checked; no competing claim on TZ-351 keys
- [x] TZ/wave/dependencies read; TZ-350 archive/lock exists
- [x] Claim slot filled; Status = DONE
- [x] `tasks/_active/TZ-SALES-351.md` created before code

## Acceptance

- [x] Empty chip-kind and search-empty states are Russian and explain the next action
- [x] Qty below 1 is emitted as 1; valid fractional material qty is preserved; inputs expose `min=1`, `step=any`
- [x] «В КП» is derived from current `draftLines`; replacing lines removes the stale badge
- [x] FE tsc PASS; rail Jest 12/12 PASS; changed-file Prettier/ESLint PASS; diff-check PASS
- [x] `docs/pages/proposals-create.page.md` updated with the 351 edge contract

## Integrity slot

- [x] Type: page / frontend UX polish
- [x] FIC and SECTION-READINESS: N/A — existing `/proposals/create` route and capability unchanged
- [x] Page documentation updated; PAGE-TZ-INDEX unchanged because existing proposal-create entry already covers the wave
- [x] Foreign WIP excluded; shell 317, PiShowcaseCard, backend, and FullEditor untouched
- [x] DOM self-check PASS through the focused Angular rail fixture

## Gates / evidence

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts --runInBand --no-coverage` → 12/12 PASS
- [x] Changed TypeScript Prettier → PASS
- [x] Changed TypeScript ESLint → PASS
- [x] `git diff --check` → PASS

## Executor report

- Changed only the product rail, its focused spec, the parent quantity normalization line, and proposal-create page documentation plus task evidence.
- Team Room status/claim attempted; registry rejected unknown backlog TZ-351.
- No backend, new feature, shell rewrite, deploy, wipe, or unrelated WIP changes.

## Closeout

- [x] `tasks/_archive/2026-08/TZ-SALES-351.done.md` created with ARCHIVE_MARKER
- [x] `.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock` created
- [x] Active marker removed after archive
- [x] Progress, root STATUS, and active-map checkpoint updated
- [x] Commit/push recorded in closeout
- closed_at: 2026-08-11T16:58:00Z
