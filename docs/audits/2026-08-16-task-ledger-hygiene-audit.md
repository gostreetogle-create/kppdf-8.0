# Task ledger hygiene audit — 2026-08-16

## Executive verdict

The repository has **0 active task claims**. The root `tasks/` execution specs are not unfinished work: all 23 root TZ specs have matching DONE archives in `tasks/_archive/2026-08/`. They are stale duplicate source specs and are being moved to `specs-dup-root/`, not re-executed.

A score of 100 below means **the task has completion evidence and an archive**, not that the whole product is fact-production complete. Estimate-only boundaries, deploy gates, and known limitations remain respected.

## Root task ledger

| Root spec | Evidence | Score | Hygiene action |
|---|---|---:|---|
| TZ-AUTH-305 | matching DONE archive + ops evidence | 100 | move duplicate spec |
| TZ-AUTH-308 | matching DONE archive + gates | 100 | move duplicate spec |
| TZ-PRODUCTION-309 | matching DONE archive + BE/FE gates | 100 | move duplicate spec |
| TZ-PRODUCTION-311…320 | matching DONE archives + production gates | 100 each | move duplicate specs |
| TZ-PRODUCTION-STUDIO-A…D | matching DONE archives + wave closeout | 100 each | move duplicate specs |
| TZ-SWEEP-401 | archive/lock/checklist + pushed commits | 100 | move untracked duplicate spec |
| TZ-UX-322…325 | matching DONE archives + app-shell gates | 100 each | move duplicate specs |
| TZ-UX-PHOTO-301 | matching DONE archive + photo gates | 100 | move duplicate spec |

**Result:** 23/23 root execution specs have archive evidence; 0 root specs remain as live execution work after hygiene move.

## Backlog ledger

| Queue | Score | Verdict |
|---|---:|---|
| WAVE-PRODUCTION-COCKPIT-HARDEN | 100 | all 324–328 archived; move wave/prompt to history |
| WAVE-PRODUCTION-COCKPIT-POLISH | 100 | 329–330 archived; move wave to history |
| WAVE-PRODUCTION-GANTT-RESIZE | 100 | 309/311–313 archived; move wave to history |
| WAVE-PRODUCTION-GANTT-TREE | 100 | 314–320 archived; move wave to history |
| WAVE-PRODUCTION-GANTT-CASCADE | 100 | 321–323 archived; move wave to history |
| WAVE-PRODUCTION-STUDIO-CHROME | 100 | A–D archived; move wave/prompt to history |
| WAVE-UX-CHROME-GANTT-TOOLS | 100 | 322–323 archived; source status is stale READY, move to history |
| WAVE-COMPOSE-CREATE-PHOTO | 100 | 340/342/341/343 archived; move untracked wave/prompt to history |
| WAVE-AUTH-DEVICE-ACCESS | 60 | 306/303/304/305 done; 307/cutover cleanup remains gated by deploy/smoke and explicit PO deploy |
| WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE | 0 | intentional future backlog; successor specs are drafts |
| TZ-FRONTEND-304 | 0 | open refactor; must claim and characterize before code |
| TZ-SALES-377 and PARK items | N/A | parked/backlog; do not archive as DONE |

## Non-task hygiene findings

- `_active/` is empty — PASS.
- `data/paspots/`, `data/products/`, `docs/PO-DIARY.md`, and architect-owned dashboard/audit support docs remain untouched WIP; they are not task completion evidence.
- `PAGE-TZ-INDEX.md` references `docs/pages/dashboard.page.md`, which is currently an untracked architect-owned support doc. It must be landed by its owner or explicitly marked deferred; this audit does not stage it.
- No deploy, wipe, data migration, or production operation was performed.

## Archive policy applied

- DONE root specs → `tasks/_archive/2026-08/specs-dup-root/`.
- DONE wave specs → `tasks/_archive/2026-08/waves-done/`.
- Spent prompts → `tasks/_archive/2026-08/prompts-spent/`.
- Open backlog remains in `_backlog/`; parked work remains in `_park/`.
- No archive is created for unverified or blocked work.

## Next action

**STOP after hygiene closeout.** The next product stream requires an explicit queue choice: AUTH-307/cutover is gated by deploy+browser smoke; TZ-FRONTEND-304 is a separate characterization refactor; page-tools migration is a future successor wave. Deploy remains prohibited without the explicit PO verb «деплой».
