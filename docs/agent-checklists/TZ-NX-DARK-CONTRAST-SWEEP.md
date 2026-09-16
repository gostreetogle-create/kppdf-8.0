# TZ-NX-DARK-CONTRAST-SWEEP checklist

> Status: **DONE**

## Claim / preflight

- agent_id: freebuff
- claimed_at: 2026-09-16T04:55:00Z
- closed_at: 2026-09-16T04:57:00Z
- Read: `PROMPT-CONTINUOUS-GANTT-DARK.md`, `WAVE-MAP.md`, both supplied audits, `docs/DARK-THEME.md`, `docs/paper-and-ink.md`, `docs/PO-CANON.md`.
- Baseline before TZ: `nx build kppdf-web` PASS.
- Scope: dark contrast consumers only; no light redesign, React/Pro port, print CSS, A4 paper change, WT hue algorithm change, or deploy.

## Preflight Check Output

- Context paths: `frontend-nx/apps/kppdf-web/src/app/layout/**`, `frontend-nx/apps/kppdf-web/src/app/pages/studio/**`, `frontend-nx/libs/features/src/lib/production/**`, `frontend-nx/libs/features/src/lib/doc-studio/**`.
- Key constraints: solid gold uses `text-on-gold`; soft/ink active states stay readable; dark primary ink is approximately `#C9D1D9`; A4 stays paper and desk is dark.
- Deliverable: eliminate the studio editor's light host void and preserve audited shell/Gantt contrast contracts; write contrast audit.

## Changes

- Shell active navigation already uses `bg-sunrise-warm text-on-gold`; no change needed.
- Kit active navigation already uses the same on-gold contract; no change needed.
- Gantt chips use ink/paper rather than a gold fill; existing Gantt dark wash and cascade overrides remain tokenized.
- Changed `.studio-canvas-host` from hard-coded `#fff` to `var(--studio-desk, var(--color-paper-2))`. The workspace shell's A4 sheet remains `--color-paper-raised`; preview/table paper remains intentionally white.
- Added `docs/audits/2026-09-15-dark-contrast-sweep.md`.

## Gates

- `nx test paper-and-ink --skip-nx-cache` — PASS, 35 suites / 363 tests.
- `nx test features --testPathPattern="gantt-bars|app-shell|pi-group" --skip-nx-cache` — PASS, 53 suites / 466 tests (pattern was passed through Nx/Jest and matched the relevant suites; broader feature suites also passed).
- `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `nx lint paper-and-ink` — PASS, 0 errors / 41 baseline warnings.
- `git diff --check` — PASS.
- `nx build kppdf-web` — PASS, exit 0; final gate. Existing Angular nullish-coalescing and bundle/component budget warnings remain.

## Integrity / closeout

- [x] No foreign files staged.
- [x] Archive and lock written.
- [x] Active marker removed after gates.
- [x] `_NOW.md` updated to completed wave.
