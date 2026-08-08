# TZ-GIT-301 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-GIT-301.done.md`
> Commit/push: **YES** (merge + push main; deploy NO)

## Claim slot

- agent_id: agent-3e757640b7 (Cursor executor · TZ-GIT-301)
- claimed_at: 2026-08-08T09:28:41Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI: Unknown task TZ-GIT-301; local claim via `_active` + this slot)

## Preflight

- [x] workspace `D:\kppdf-8.0`
- [x] no foreign CLAIM on conflict keys
- [x] TZ / GEMINI / AGENTS read
- [x] Claim slot filled before merge

## Acceptance

- [x] FORM-302..305 commits ancestors of origin/main
- [x] tsc + jest PASS (quick-create / form-section via material dialog / photo)
- [x] backlog stubs FORM-302..305 removed
- [x] push; deploy нет

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0
- `pnpm test -- --testPathPattern="quick-create-dialog.component.spec|photo-dropzone.component.spec|material-form-dialog.component.spec"` → 3 suites / 55 tests PASS
- Conflicts: `_active-map.md`, `progress.md` only — resolved
- NAV-302: `b3f6948b` still ancestor; app-layout people→clients / work-types→production intact

## Executor report

- Merged `origin/freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c` (`7bc88e17…e485f521`)
- Stashed unrelated WIP as `wip-before-TZ-GIT-301`
- Restored missing FORM-304/305 locks to match archives
- Deploy: not run

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T09:35:00Z
