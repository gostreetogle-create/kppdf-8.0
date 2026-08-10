# TZ-UX-DIALOG-307 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-DIALOG-307.md` (removed at closeout)
> Commit/push: wave-authorized

## Claim slot

- agent_id: Buffy/freebuff-259639d6
- claimed_at: 2026-08-10T17:56:01.3657604Z
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable — `Unknown task; sync tasks first`

## Preflight

- [x] Worktree and branch verified; logical canonical workspace recorded.
- [x] `_active-map.md` and `tasks/_active/` checked; no competing claim.
- [x] TZ and dialog cookbook read; TZ-UX-DIALOG-306 archived/pushed.
- [x] Claim marker and checklist created before code changes.

## Acceptance

- [x] Shared cross-platform helper recognizes Ctrl+Enter / Cmd+Enter and leaves Escape untouched.
- [x] Product, Module, Material, Color reference, and QuickCreate create dialogs wire save-and-continue.
- [x] Create success resets defaults and focuses the first required field; create ordinary submit still closes.
- [x] Edit hotkey saves without closing; ordinary edit save behavior remains unchanged.
- [x] Footer hint `Ctrl+Enter — сохранить и создать ещё` is visible in the catalog create dialogs.
- [x] `docs/pages/ui-add-and-continue.md` and `docs/DIALOG-COOKBOOK.md` updated.

## Integrity

- [x] Page documentation updated; no route change required.
- [x] Conflict keys respected; foreign WIP excluded.
- [x] Forbidden `deploy.ps1`, MCP, Excel, `desktop/**`, and `mcp-runtime/**` paths untouched.
- [x] Change type: shared frontend UX helper + catalog dialog wiring/tests/docs.

## Gates (fact)

- `frontend pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.
- Focused Jest — PASS, 6 suites / 92 tests.
- Changed-file ESLint — PASS.
- Changed-file Prettier — PASS.
- `frontend pnpm run build:dev` — PASS.
- `git diff --check` — PASS; only repository CRLF normalization warnings.

## Executor report

- Added one shared shortcut predicate and focus helper.
- Added document-level Ctrl/Cmd+Enter handling to Product, Module, Material, Color reference, and QuickCreate forms.
- Create save-and-continue resets form state, uploaded-photo session state, and focuses the first required input; edit save-and-continue stays open.
- Preserved ordinary Save/Create close behavior and Escape/backdrop handling.
- Added the RU footer hint and canonical docs; added helper unit coverage for Ctrl/Cmd+Enter, plain Enter, Escape, and focus.
- Conflict disclosure: only TZ-UX-DIALOG-307 files and shared catalog dialog targets were changed; no backend, MCP, Excel, desktop, or production/deploy paths included.

## Closeout

- [x] archive + lock + progress + remove active marker
- [x] Status DONE
- closed_at: 2026-08-10T18:03:51.7524650Z
