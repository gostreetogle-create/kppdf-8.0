# TZ-SALES-327 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-327.md` (must exist until archive)
> Commit/push: scoped only after review/closeout

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T11:58:37Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry does not contain TZ-SALES-327

## Preflight

- [x] Get-Location + git rev-parse checked; canonical repository is `D:\kppdf-8.0`, execution worktree is linked to it.
- [x] `git pull --ff-only origin main` attempted; worktree had diverged only because canonical 323 commits were cherry-picked there, then rebase onto current `origin/main` skipped those already-applied commits cleanly.
- [x] Read `_active-map.md` + active markers; no foreign claim overlaps PiShowcaseCard keys.
- [x] Read product vitrine audit, TZ-327, Spec §0, and relevant card/photo sources.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-SALES-327.md` created before product-code edits.
- [x] DOC-344 builder keys and 323/326/328 proposal keys remain untouched.

## Conflict keys

- `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts`
- `frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts`
- `docs/pages/products.page.md`
- `docs/audits/2026-08-09-kp-create-product-vitrine.md`

## Acceptance

- [x] md cards are stretchable equal-height grid tiles with deterministic title/description clamps.
- [x] md media stays 16:9 with explicit cover behavior; empty media keeps placeholder geometry.
- [x] md actions remain at the card bottom; sm/lg behavior does not regress.
- [x] Existing photoListUrl is documented/reused; no new photo pipeline or card system.
- [x] No out-of-scope proposal rail, 326/328, snapshot/print, Builder/DOC-344, or deploy changes.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test --testPathPattern=pi-showcase-card --runInBand` — PASS, 11/11 (Angular emits the existing jsdom `i-lucide` unknown-element console warning; suite is green).
- Direct `pnpm exec jest --config jest.config.js --runInBand src/app/shared/ui/card/pi-showcase-card.component.spec.ts` — PASS, 11/11.
- Visual card review — optional for 327; no blocker recorded.

## Executor report (auto)

- implementation: md cards now document the showcase contract; flex stretch/equal-height, 2-line title/description clamps, fixed 16:9 cover media, and empty placeholder geometry are explicit and tested.
- tests/gates: frontend tsc PASS; focused card suite PASS 11/11.
- conflict disclosure: only listed PiShowcaseCard/docs keys; proposal page and DOC-344 untouched
- known limits: Create КП integration is 328; wide flyout/dismiss is 326
- commit: canonical `cd3c265f` landed on `D:\\kppdf-8.0` `main` and pushed to `origin/main`.
- full SHA: `cd3c265f`

## Review handoff

- [x] READY FOR REVIEW recorded in active map / Team Room.
- [x] Archive after focused PASS; visual optional for 327.

## Closeout

- [x] archive created with ARCHIVE_MARKER; lock created; active marker removed.
- [x] Status = DONE
- closed_at: 2026-08-09; canonical landing `cd3c265f` pushed
