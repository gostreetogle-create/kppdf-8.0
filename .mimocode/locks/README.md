# `.mimocode/locks/` — orchestrator lock-file directory

**Bootstrapped:** 2026-08-01 (TZ-256.A close-out).

This directory tracks DONE-task lock files for the orchestrator. Each lock file names a committed task and protects its referenced files from accidental modification without explicit re-authorisation.

## Schema (per lock file)

Each file in this directory MUST contain (in plain-text key-value form) the following keys, with no required order and YAML/Markdown/TOML formatting acceptable:

| Key             | Type   | Required | Description                                                                  |
|-----------------|--------|----------|------------------------------------------------------------------------------|
| `TASK`          | string | YES      | TZ ID in format `TZ-NNN` or `TZ-NNN.A`.                                      |
| `OWNER`         | string | YES      | Agent or human name responsible for closing.                                 |
| `CLOSED_AT`     | ISO-8601 date | YES | Date of closure (e.g. `2026-08-01`).                                       |
| `COMMIT`        | git SHA (7+) | YES | Commit hash implementing the task on main (or worktree).               |
| `PROTECTED_FILES` | list | YES      | One path per line, files whose semantics the lock guards.                    |
| `SUCCESSOR`     | TZ-ID or `none` | NO | Successor task (if `Successor:` in STATUS.md row).                        |
| `NOTES`         | free text | NO   | Caveats, drift markers, future recon notes.                                  |

Unknown keys MUST be ignored by orchestrator parsers (forward-compatible).

## Filename convention

`<TASK>-<short-slug>.lock` where:
- `<TASK>` is `TZ-NNN` or `TZ-NNN.A` (with literal `.`).
- `<short-slug>` is kebab-case summary (≤32 chars).
- Example: `TZ-256.A-shieldcheck-placeholder.lock`.

Verified by `bash ./OrchestratorKit/verify-status.sh` for FILE-EXISTENCE of `<TASK>.lock` for every row in STATUS.md `## ✅ DONE` table.

## Atomicity

Lock files are atomic single-purpose files (no embedded scripts, no executable permissions). Adding a lock file is normal `git add` track; deletion requires explicit successor note in commit body.

## Out-of-scope contents

- No source code (use `backend/` + `frontend/`).
- No archives (use `tasks/_archive/YYYY-MM/`).
- No handoff tasks (use `tasks/TZ-NNN.LETTER.md`).
- No commits or pushes from this directory.

## Cross-references

- STATUS.md → DONE rows should match a `<TASK>.lock` filename in this directory.
- `tasks/_archive/YYYY-MM/<TASK>.done.md` archives should reference the matching lock file (or note when no lock was created).
- Any TZ task with `lock_file: CREATED` in its archive marker must have a corresponding file here.
