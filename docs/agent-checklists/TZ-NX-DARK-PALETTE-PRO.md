# TZ-NX-DARK-PALETTE-PRO checklist

> Status: **DONE**
> Marker: archived from `tasks/_active/TZ-NX-DARK-PALETTE-PRO.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T04:46:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] Branch `main`; prior Gantt commits through `dd44ff3b`; no competing active task.
- [x] Palette TZ, dark-theme audit, current global CSS, dark docs, Paper & Ink rationale, and PO typography canon read.
- [x] Baseline inherited: `nx build kppdf-web` PASS.
- [x] Claim slot filled before code.

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-15-dark-theme-pro-zip.md`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`, `docs/DARK-THEME.md`, `docs/paper-and-ink.md`, `docs/PO-CANON.md`
- **Key Constraints:** existing override names only; locked HEX ladder; `#C9D1D9` primary / `#8B949E` secondary / `#6E7681` muted; regular UI weight; light unchanged; no React/Pro names or zip port.
- **Planned Deliverable:** replace dark override ladder; add on-gold/overlay/studio aliases; document source/typography; run Paper & Ink and app gates.
- **Validation Path:** Paper & Ink tests/lint, app typecheck, focused diff check, final app build.

## Acceptance

- [x] Dark surfaces map to `#0C0E14`, `#141722`, `#1B1F2E`, `#242A3E`, `#2D344B` through project overrides.
- [x] Amber maps to `#F59E0B`, hover `#D97706`, soft alpha; on-gold is `#0F1117`; borders are neutral white alpha.
- [x] Dark typography uses the audited cool-gray ladder; light theme declarations were not changed.
- [x] Overlay, focus, warning, and studio-desk aliases are wired without Pro variable names.

## Integrity slot

- [x] Type: other/global UI token change.
- [x] `docs/DARK-THEME.md` and `docs/paper-and-ink.md` updated.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no route, permission, section-status, or shared-domain field change.
- [x] Foreign WIP excluded; only owned CSS/docs/checklist/archive/lock staged.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Gates (fact)

- `cd frontend-nx && pnpm exec nx test ui-paper-and-ink --skip-nx-cache` — expected project name unavailable (exit 1, no project named `ui-paper-and-ink`).
- `cd frontend-nx && pnpm exec nx test paper-and-ink --skip-nx-cache` — PASS, 35 suites / 363 tests; jsdom emitted existing CDK layer parse console errors while suites passed.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `cd frontend-nx && pnpm exec nx lint paper-and-ink` — PASS, 0 errors / 41 baseline warnings.
- `git diff --check -- frontend-nx/libs/ui/paper-and-ink/src/styles/global.css docs/DARK-THEME.md docs/paper-and-ink.md` — PASS.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; final gate, existing Angular/budget warnings only.

## Executor report

Applied the audited Dark Theme Pro HEX ladder through existing Paper & Ink override tokens, added the soft cool Files Changed typography ladder and on-gold override, quiet neutral borders, amber hover/soft values, 75% overlay, and studio desk alias. Light theme and fixed Gantt/catalog hues were not changed; React reference assets were not copied.

## Closeout

- [x] Archive + lock + live state + active-marker removal completed.
- [x] Status DONE.
- closed_at: 2026-09-16T04:52:00Z
