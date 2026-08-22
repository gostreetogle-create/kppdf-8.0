# TZ-OPS-320: Убрать spent TZ/PROMPT из корня tasks/

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

## Outcome

Перенесены четыре stale TZ в `tasks/_archive/2026-08/specs-dup-root/`:
- TZ-CORE-302-soft-delete-coverage-gap.md
- TZ-OPS-317-git-line-endings-normalize.md
- TZ-OPS-318-automated-backup-rotation.md
- TZ-OPS-319-local-pre-push-gate.md

Перенесены семь spent PROMPT в `tasks/_archive/2026-08/prompts-spent/`:
- PROMPT-FREEBUFF-MASTER-QUEUE.md
- PROMPT-FREEBUFF-DESKTOP-WAVE1.md
- PROMPT-FREEBUFF-UI-FIXES-WAVE1.md
- PROMPT-FREEBUFF-AUDIT-FOLLOWUP.md
- PROMPT-FREEBUFF-PO-BACKLOG-WAVE1.md
- PROMPT-FREEBUFF-KP-PAGE-MODE-CONTINUOUS.md
- PROMPT-FREEBUFF-OPS-318-319-PARALLEL.md

`PROMPT-FREEBUFF-WAVE-2026-08-22.md`, `PROMPT-RESUME-ANY.md`, README и TASKS-DRAIN не затронуты.

## Verification

- acceptance criteria: PASS
- root stale-file check: PASS
- archive path check: PASS
- deploy: NOT RUN
- typecheck: N/A (docs-only)
- tests: N/A (docs-only)
- lint: N/A (docs-only)
- checklist: ADDED
- progress.md: N/A (TZ scope ограничен archive hygiene и `_NOW.md`)
- status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
- review diff: PASS

## Executor report

Чужой dirty WIP в checkout не включался. Product-код, `.github/` и deploy не изменялись.
