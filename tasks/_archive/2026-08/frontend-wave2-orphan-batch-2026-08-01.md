# FRONTEND WAVE 2 — ORPHANED Batch (TZ-154 + TZ-176 + TZ-177) — 2026-08-01

ARCHIVE_MARKER
outcome: ORPHANED_BATCH
closed_at: 2026-08-01
closed_by: autonomous-frontend-finalizer (Phase 0, frontend wave 2)
parent_category: FRONTEND, АРХИТЕКТУРА И КАЧЕСТВО КОДА
scope_resolution: 3 of 3 ORPHANED + SUPERSEDED
lock_file_skipped: TRUE

---

## 1. Batch outcome summary

| TZ | Outcome | Reason | Successor |
|----|---------|--------|-----------|
| **TZ-154** (legacy HttpClient → httpResource, 6 pages) | ORPHANED + SUPERSEDED | TZ-232 Wave C-D page migration + TZ-232.I ESLint rule | None required |
| **TZ-176** (console.warn + as any) | ORPHANED + SUPERSEDED-PARTIAL | `as any` → TZ-232.I. `console.*` → 10 instances, 1 production (ErrorHandler) | TZ-176.1 — Logger/Telemetry provider selection |
| **TZ-177** (builder.page.ts god-file) | ORPHANED + SUPERSEDED + ACTIVE-WORKTREE-CONFLICT | feat/builder-magnetic-grid + TZ-235 partial refactor + TZ-232.J master plan | Continue TZ-232.J per master schedule |

## 2. Phase 0 diagnostic — основание для ORPHANED

Per user instruction:
> "Не выполняй задачи, которые существуют только как старые строки в STATUS.md без исходного ТЗ или проверяемых acceptance criteria."

`find tasks -maxdepth 1 -type f -name 'TZ-154*' -o -name 'TZ-176*' -o -name 'TZ-177*'` → NONE.

Only references found (no source task):
- `STATUS.md` line 394 → TZ-154 row in audit Quality Batch table.
- `STATUS.md` line 544 → TZ-176 row in same table.
- `STATUS.md` line 551 → TZ-177 row + dependency on TZ-170.
- `STATUS.md` line 670 + 671 → duplicate references in TZ batch.
- `tasks/TZ-232.md` line 774 → ABSORBING comments: "TZ-176, TZ-177, TZ-178 (Signal effects migration в pages): SUPERSED → этот batch мигрирует на entity-list сразу signal-based + service-factory. Wave C-D-E-F absorb these."
- `progress.md` line 1881-1882 → historical mentions: "TZ-176 — pi-table OnInit migration (HIGH, 1 core)" + "TZ-177/178 — 8 page OnInit migrations (HIGH, 2 batches)". These are PROGRESS entries from PRIOR session — pre-Changelog of OnInit migration that completed in TZ-232 Wave.

## 3. Что НЕ изменено этим session (no writes to existing files)

Per Phase 0 protocol "Не трогай: файлы из его активной задачи; незакоммиченные изменения другого агента":
- `frontend/src/app/pages/doc-constructor/builder/*` — owned by feat/builder-magnetic-grid worktree.
- Backend-код (TZ-110..127 batch — covered by other agent).
- Uncommitted changes by other agents (`.mimocode/.cron-lock` delete, etc.).

## 4. Active files added by this session

- `tasks/_archive/2026-08/TZ-154.orphaned.md` (this archive pair).
- `tasks/_archive/2026-08/TZ-176.orphaned.md`
- `tasks/_archive/2026-08/TZ-177.orphaned.md`
- `tasks/_archive/2026-08/frontend-wave2-orphan-batch-2026-08-01.md` (this file).
- Appends to: `STATUS.md`, `OrchestratorKit/STATUS.md`, `progress.md` (2026-08-01 dated entries).

No lock files created (ORPHANED outcome → lock_file_skipped: TRUE per TZF-00 §5).

## 5. Verification gates run by this session

| Command | Exit | Notes |
|---------|------|-------|
| `git status --short` (Phase 0.0) | 0 | discovery baseline |
| `find tasks -maxdepth 1 -type f` | 0 | no real TZ-154/176/177 .md files |
| `find tasks/_archive -type f` | 0 | no prior TZ-154/176/177 archive |
| `git worktree list --porcelain` (Phase 0.1) | 0 | feat/builder-magnetic-grid detected as conflict target |
| `grep 'TZ-154\\|TZ-176\\|TZ-177' -g *.md` | n=11 | only STATUS + progress + TZ-232.md mentions |
| `grep 'console\\.' frontend/src/app/**/*.ts` | n=10 | see TZ-176 archive §3 table |
| `grep 'inject(HttpClient)\\|this\\.http\\.' frontend/src/app/**/*.page.ts,*.component.ts` | n=0 | legacy HttpClient usage fully evicted |
| `pnpm exec tsc -p tsconfig.app.json --noEmit` (baseline) | 0 | inherited PASS from prior TZ-232.I session |
| `bash OrchestratorKit/verify-status.sh` | 0 | 82 PRE-EXISTING discrepancies (out of scope for this batch) |

## 6. Known limitations (carried forward)

1. **Pre-existing 82 verify-status discrepancies** — not introduced by this session; documented elsewhere (TZ-119.1 + TZ-110..127 + structural repo inconsistencies).
2. **feat/builder-magnetic-grid merge pending** — when user merges that worktree, builder.page.ts LOC + atomic parts count will shift. TZ-232.J picks up residual work then.
3. **TZ-176.1 successor decision** — requires PO input: Sentry vs in-house Logger vs ErrorBanner-only. Deferred until PO clarification.
4. **No browser-based QA this session** — ORPHANED archives don't strictly require browser verification per Phase 0 protocol.

## 7. Pre-existing для awareness (NOT caused by this session)

- 5 jest suites failing (entity-service, capabilities, capability-route.guard, forbidden, storage-items) — repo-wide infra.
- 5 lint errors (templates.page.ts BookOpen/Columns/orgId/docTypeId + entity-service.spec.ts 'injector') — repo-wide infra.
- 82 verify-status.sh discrepancies — pre-existing structural mismatch.

All documented in TZ-232.I archive §7 (predecessor of this batch on same worktree).
