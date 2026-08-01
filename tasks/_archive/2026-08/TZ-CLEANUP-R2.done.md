# TZ-CLEANUP-R2 — Canonical repository cleanup and synchronization

**Task ID:** TZ-CLEANUP-R2
**Title:** Очистка проекта: лишние файлы, папки, drift в документации (Round 2)
**Source task:** `tasks/TZ-CLEANUP-R2.md`
**Archived:** 2026-08-01
**Executor:** autonomous-codebuff-agent (Buffy)
**Objective:** Leave one canonical `main` checkout, remove confirmed non-project artifacts, repair documentation drift, preserve useful history, and verify the repository without falsely closing unrelated engineering failures.

## Scope and decisions

- Canonical project root: `D:\kppdf-8.0`
- Canonical branch: `main`
- Registered Git worktrees: one (`D:\kppdf-8.0`)
- Package manager: pnpm; root `package-lock.json` remains ignored and untracked.
- `.freebuff/` remains local Freebuff runtime state and is ignored; it is not project source and was not deleted while the host session was active.
- Non-ancestor WIP branches and stashes were preserved as local recovery history; they are not registered worktrees and do not affect the canonical checkout.
- No production deployment, database mutation, credential change, or destructive operation against the active application was performed.

## Acceptance criteria

| Criterion | Result | Evidence |
|---|---|---|
| AC1 WindowsTheme removed | PASS | `test ! -e WindowsTheme/MinimalFlat` exit 0; no directory remains. |
| AC2 vendored MCP removed from source tree | PASS | `test ! -e vendor/codebase-memory-mcp` exit 0; `git ls-files vendor/` empty. |
| AC3 root sample PDF removed and ignored | PASS | `test ! -e 'Пимер.pdf'` exit 0; `.gitignore` contains `Пимер.pdf`; historical `docs/reference/example-document.pdf` remains. |
| AC4 draft task notes removed | PASS | `test ! -e tasks/p.txt && test ! -e tasks/p2.txt` exit 0. |
| AC5 project passport moved | PASS | `test -f docs/project-passport.md && test ! -e tasks/PROJECT-PASSPORT.md` exit 0. |
| AC6 generated artifacts not tracked | PASS | `git ls-files` contains no `dist/`, `.angular/`, or `.tsbuildinfo` entries. |
| AC7 npm lockfile conflict prevented | PASS | `git ls-files package-lock.json` empty; `.gitignore` explicitly contains `package-lock.json`; pnpm remains canonical. |
| AC8 cleanup ignore rules present | PASS | `.gitignore` contains `WindowsTheme/`, `vendor/`, `.freebuff/`, and `Пимер.pdf` (4 matches). |
| AC9 README auth duplication removed | PASS | `grep -c 'Auth: JWT (access+refresh), bcrypt' README.md` returned 1. |
| AC10 README current security references | PASS | README status explicitly names TZ-247, TZ-248, TZ-255, TZ-256, TZ-257, and TZ-258; `grep -oE 'TZ-24[5-8]|TZ-257|TZ-258' README.md | wc -l` returned 6. |
| AC11 architecture UI path corrected | PASS | `grep -F 'shared/ui-kit' ARCHITECTURE.md` returned no matches; canonical path is `frontend/src/app/shared/ui/`. |
| AC12 progress contains cleanup audit | PASS | `grep -F 'TZ-CLEANUP-R2' progress.md` exit 0; completion entry appended below. |
| AC13 status verifier | PASS | `bash OrchestratorKit/verify-status.sh` exit 0 after archive; Team Room task discovery is now dynamic. |
| AC14 backend typecheck | PASS | `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` exit 0. |
| AC15 frontend typecheck | PASS | `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` exit 0. |

## Code and documentation changes

- Removed confirmed non-project `WindowsTheme/`, `vendor/codebase-memory-mcp/`, `.mcp.json`, and root `Пимер.pdf`.
- Moved `tasks/PROJECT-PASSPORT.md` to `docs/project-passport.md`.
- Added explicit ignore rules for local `.freebuff/` and removed artifacts.
- Removed the launcher’s obsolete MCP auto-start/reference.
- Corrected README status, command documentation, canonical UI path, and security backlog references.
- Corrected `ARCHITECTURE.md` UI-kit references to the actual Paper & Ink `shared/ui/` implementation.
- Updated the persistent completion checklist and consolidation verification note.
- Updated `OrchestratorKit/team-room/cli.test.mjs`: task discovery is validated dynamically and no longer requires a specific cleanup task to remain active after archival.

## Verification commands and results

| Check | Command | Result |
|---|---|---|
| Backend typecheck | `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` | PASS, exit 0 |
| Frontend typecheck | `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` | PASS, exit 0 |
| Backend build | `pnpm --dir backend run build` | PASS, exit 0 |
| Frontend build | `pnpm --dir frontend run build` | PASS, exit 0; existing Angular budget warnings |
| Frontend lint | `pnpm --dir frontend run lint` | PASS, exit 0; 19 pre-existing warnings, 0 errors |
| Backend lint | `pnpm --dir backend exec eslint '{src,test}/**/*.ts'` | FAIL baseline, exit 1; 48 pre-existing errors and 51 warnings |
| Backend Jest | `pnpm --dir backend exec jest --runInBand --silent` | FAIL baseline, 23/24 suites and 218/220 tests pass; 2 BOM resolver expectation failures |
| Frontend Jest | `pnpm --dir frontend exec jest --config jest.config.js --runInBand --silent` | FAIL baseline, 55/58 suites and 521/536 tests pass; 15 failures in storage-items, capability guard, and wildcard permission specs |
| Team Room tests | `node --test OrchestratorKit/team-room/*.test.mjs` | PASS, 23 tests, exit 0; rerun after the empty-task/temp-fixture test correction |
| Launcher syntax | `node --check start.mjs` | PASS, exit 0 |
| Status verifier | `bash OrchestratorKit/verify-status.sh` | PASS, exit 0; 0 warnings after active task archival |
| Whitespace | `git diff --check` | PASS, exit 0 |
| Browser/runtime QA | Existing frontend on :4200 only; backend :3000 unavailable during audit | SKIPPED; no live authenticated API mutation or browser claim made |

## Known limitations and successor work

This cleanup task intentionally does not reclassify unrelated code/test debt as fixed:

- Backend BOM resolver tests: 2 failures remain.
- Frontend storage-items request expectations: 7 failures remain.
- Frontend capability guard export/spec mismatch: 7 failures remain.
- Frontend wildcard permission expectation: 1 failure remains.
- Backend lint baseline: 48 errors and 51 warnings.
- Frontend lint baseline: 19 warnings.
- Live authenticated document-template creation/reorder/idempotency replay was not rerun in this session because backend `:3000` was not running; the prior stack-overflow report remains a successor smoke-test item.
- `.freebuff/` local runtime state is intentionally retained for the active Freebuff host and is not part of the Git project.

**Successor tasks required:** TRUE for the listed test/lint/runtime follow-ups; FALSE for this cleanup task itself.

## Review

Independent review found no verified Critical or Important issue in the cleanup scope after the final Team Room rerun. The dynamic Team Room test change was checked against `taskFiles()` and preserves validation of source paths, unique IDs, titles, and conflict metadata. Historical WIP branches/stashes were preserved rather than destructively removed.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-01
closed_by: autonomous-codebuff-agent
source_task: tasks/TZ-CLEANUP-R2.md
protected_files: backend/src/**; frontend/src/**; tasks/_archive/2026-07/**; OrchestratorKit/_archive/**; .freebuff/**
affected_areas: repository-hygiene; documentation; Team Room task discovery
acceptance_status: ALL_PASS
verification: REQUIRED_CHECKS_PASS_WITH_DOCUMENTED_PREEXISTING_TEST_AND_LINT_BASELINE
review: APPROVED_NO_CRITICAL_OR_IMPORTANT_ISSUES
lock_file: NOT_CREATED
successor_required: TRUE
