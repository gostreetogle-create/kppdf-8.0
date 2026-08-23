# TZD-66 — Desktop pairing dialog showed v0.0.0 — env not forwarded to remote .env

**Date:** 2026-08-23
**Executor:** claude
**Outcome:** DONE (deploy-script fix; live redeploy still required — see Successor)

## Objective

PO screenshot: «Подключить десктоп» dialog showed «СКАЧАТЬ DESKTOP V0.0.0» /
«Актуальная сборка · мин. v0.0.0» in production, despite `desktop/package.json`
already at `0.5.6` and installer artifacts (v0.5.6 exe/zip) already published
locally in `frontend/downloads/` and `frontend/browser/downloads/`.

## Root cause

`GET /api/desktop/compat` (`backend/src/modules/desktop/desktop-compat.service.ts`)
reads `process.env.DESKTOP_MIN_VERSION` / `DESKTOP_RECOMMENDED_VERSION` /
`DESKTOP_DOWNLOAD_URL` / `APP_VERSION`, fail-open defaulting each to `'0.0.0'`
/ default path / `'unknown'` when unset. `deploy/synology/deploy.py`'s
`make_env_file()` — which generates the **only** `.env` uploaded to the
remote docker-compose stack — never wrote any of these four keys, no matter
what the local (gitignored) `deploy/synology/config.env` had set. So the
production backend's env was always missing them, regardless of config.env
content or drift. The local `config.env` did have stale values (`0.5.4`)
from a prior release, which masked the real bug until this session traced it
end-to-end (config.env → `resolve_settings` → `make_env_file` → uploaded
`.env`) and found the last link was simply never wired up.

## Fix

1. `desktop/scripts` unchanged (`publish-installer.mjs` was already correct —
   reads semver from `desktop/package.json`, asserts `tauri.conf.json` match,
   refuses to relabel a stale exe).
2. `deploy/synology/deploy.py`:
   - New `read_desktop_semver(project_root)` helper (extracted from
     `publish_desktop_installer`'s inline logic).
   - `publish_desktop_installer()` now **returns** the semver it actually
     published this run (`None` if it fell back to unversioned-only, or
     refused a stale exe).
   - `build_frontend()` returns that value.
   - `resolve_settings()` reads `DESKTOP_MIN_VERSION` / `DESKTOP_RECOMMENDED_VERSION`
     / `APP_VERSION` from `config.env` as **explicit overrides** (previously
     not read into settings at all).
   - `make_env_file(settings, desktop_semver=None)`: explicit config.env
     override wins; otherwise auto-derives `DESKTOP_MIN_VERSION` /
     `DESKTOP_RECOMMENDED_VERSION` / `DESKTOP_DOWNLOAD_URL` /
     `APP_VERSION` from `desktop_semver` and **writes them into the uploaded
     `.env`** — the actual missing step. Warns if neither override nor
     resolved semver exist.
   - `main()`: threads `desktop_semver` from `build_frontend()` (or, on
     `--skip-build`, from a best-effort `read_desktop_semver()` fallback)
     through to `make_env_file()`.
3. `deploy/synology/config.env.example`: documents the new auto-derive
   behavior; DESKTOP_* lines are now "pin an explicit override" examples,
   not "set this after every release" instructions.
4. `deploy/synology/config.env` (local, gitignored): commented out the stale
   `0.5.4` DESKTOP_* values so the next deploy self-corrects from the real
   `desktop/package.json` semver (`0.5.6`) instead of a manually-edited value
   drifting again.
5. `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`:
   updated warm-deploy checklist — step 4 (manual config.env edit) is no
   longer required for a normal release; added item 9 documenting this fix.

## Source task

Ad-hoc PO report (screenshot) in this session — no pre-existing TZ file;
claimed directly as `tasks/_active/TZD-66.md`.

## Conflict keys

- `deploy/synology/deploy.py`
- `deploy/synology/config.env.example`
- `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`

## Affected files

- `deploy/synology/deploy.py`
- `deploy/synology/config.env.example`
- `deploy/synology/config.env` (gitignored, local only)
- `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Remote `.env` receives DESKTOP_MIN/RECOMMENDED_VERSION/DOWNLOAD_URL/APP_VERSION | PASS | `make_env_file` now appends these lines when known |
| 2 | Auto-derives from actual published semver, no manual config.env upkeep | PASS | `make_env_file(settings, desktop_semver)` verified via manual script run — see Commands |
| 3 | Explicit config.env override still wins when operator wants to pin | PASS | verified in manual script run |
| 4 | No breakage of existing config.env-driven FE meta injection (`inject_desktop_download_url`) | PASS | untouched, still reads `settings["desktop_download_url"]` |
| 5 | `python -m py_compile deploy/synology/deploy.py` exits 0 | PASS | ran, exit 0 |

## Commands and exit codes

- `python -m py_compile deploy/synology/deploy.py` → exit 0
- Manual isolated test of `make_env_file()` with three scenarios (auto-derive,
  explicit override, fully-unknown-with-warn) — all produced expected output
  (see session transcript; no automated test harness exists for `deploy.py`).

## Known limitations

- This fix changes what the **next** deploy will upload. It does **not**
  retroactively fix the currently-running production backend — that still
  has no `DESKTOP_MIN_VERSION`/etc. in its live `.env` until someone runs
  `deploy/synology/deploy.ps1` (or `deploy.py`) again. Per project contract
  ("Deploy only on explicit PO"), this session did not trigger that deploy.
- `APP_VERSION` is now defaulted to the desktop semver when unset, which
  conflates "server build id" with "desktop installer version" — acceptable
  for now since no separate backend version SoT exists, but worth revisiting
  if `serverBuildId` needs to diverge from the desktop version later.
- No automated test coverage for `deploy.py` (none existed before this
  change either — verified manually via `py_compile` + isolated function
  calls, not a full deploy dry-run).

## Successor tasks

- **PO action required:** run a warm deploy (`deploy/synology/deploy.ps1` or
  `deploy.py`) to actually push this fix to the live Synology server —
  only then will the pairing dialog stop showing `v0.0.0` in production.

## Archive marker

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: claude
source_task: ad-hoc (tasks/_active/TZD-66.md)
protected_files:
  - deploy/synology/deploy.py
  - deploy/synology/config.env.example
affected_areas:
  - deploy/synology/
  - docs/audits/
acceptance_status: ALL_PASS
verification: MANUAL_SCRIPT_RUN_NO_AUTOMATED_TESTS
review: NOT_REQUESTED
lock_file: NOT_CREATED
successor_required: TRUE
```
