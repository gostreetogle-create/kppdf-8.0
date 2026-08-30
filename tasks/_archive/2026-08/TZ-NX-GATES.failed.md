# TZ-NX-GATES — FAILED

ARCHIVE_MARKER
outcome: FAILED
closed_at: 2026-08-29
closed_by: freebuff-nx-gates

## Results

- `node scripts/architecture-check.mjs`: FAIL — 3 pre-existing legacy frontend violations; NX paths were added to the scan and did not produce additional violations.
- `node scripts/check-ui-tokens.mjs`: FAIL — 86 raw color occurrences across legacy UI, migrated UI, and global UI CSS. The migrated Paper & Ink tree contains existing raw colors, so this requires a separate token-remediation decision rather than silently baselining.
- Legacy `frontend/**` behavior was not changed.

## Partial progress

- Added `frontend-nx/libs/**` and `frontend-nx/apps/**` roots to architecture scanning.
- Added `frontend-nx/libs/ui/paper-and-ink/src/**` to token scanning.
- Added root scripts `ui:tokens` and `architecture:check:nx`.

## Blockers / next steps

- Decide whether the architecture baseline should be refreshed to account for the existing three legacy violations.
- Remediate or explicitly document raw colors in the migrated UI before a PASS token gate.
- No DONE archive or lock created.
