# TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2 checklist

> Status: DONE
> Marker: `tasks/_active/TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2.md` (removed on archive)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-03T16:50:00Z
- workspace: D:\kppdf-8.0
- branch: `main`
- team_room_claim: unavailable

## Preflight

- [x] `pnpm lint` (frontend) baseline: `eslint src/` → 35 errors / 17 `no-implements-oninit-in-pages` warnings (matches TZ ИСХОДНОЕ)
- [x] Slice-1 (Q4b, `fb1fced5`) file list checked — none of the 10 files below overlap it
- [x] OnInit/AfterViewInit warnings left untouched (out of scope per TZ)

## Files (10, all `kppdf-frontend-architecture/no-raw-ui-values`, none from Q4b/slice-1)

1. `frontend/src/app/pages/admin/device-invite-dialog.component.ts` — 2 errors (raw px spacing)
2. `frontend/src/app/pages/admin/device-role-dialog.component.ts` — 1 error (raw px spacing)
3. `frontend/src/app/pages/admin/owner-device-invite-dialog.component.ts` — 2 errors (raw px spacing)
4. `frontend/src/app/pages/admin/reset-password-dialog.component.ts` — 2 errors (raw px spacing)
5. `frontend/src/app/pages/admin/role-form-dialog.component.ts` — 10 errors (raw px spacing)
6. `frontend/src/app/pages/admin/user-form-dialog.component.ts` — 2 errors (raw px spacing)
7. `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-ai-draft.component.ts` — 3 errors (raw hex color fallback)
8. `frontend/src/app/pages/dashboard/dashboard.page.ts` — 1 error (raw hex color fallback)
9. `frontend/src/app/shared/ui/pi-table-tree.component.ts` — 2 errors (raw hex color fallback)
10. `frontend/src/app/shared/ui/rich-text/pi-rich-text-editor.component.ts` — 10 errors (raw px spacing)

Total: 35/35 errors — full batch, not just top-N.

## Fix pattern

- Raw px in `padding`/`margin` → `frontend/src/styles.css` `--space-N` scale
  (1=4px, 2=8px, 3=12px, 4=16px), non-scale values expressed as `calc(var(--space-N) ± var(--space-1) / k)`
  — same idiom already used by Q4b/slice-1 (`builder-tool-pane.component.ts`,
  `table-template-dialog.component.ts`).
- Raw hex in `color`/`background` → these were all `var(--token, #hexFallback)`;
  the CSS custom property is always defined in `styles.css`, so the hex
  fallback is dead code — dropped it (`var(--color-muted-foreground, #6b7280)`
  → `var(--color-muted-foreground)`), matching the Q4b/slice-1 precedent in
  `proposal-create-inspector.component.ts`.
- No new hex/px introduced; no visual value changed (token values match the
  literals they replace).

## Gates (факт)

- `cd frontend && eslint src/` → **0 errors**, 17 warnings (unchanged `no-implements-oninit-in-pages`, out of scope) — down from 35 errors.
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS, no output.
- `npx jest --testPathPattern="reset-password-dialog|role-form-dialog|user-form-dialog|dashboard\.page|pi-table-tree"` → 6 suites / 70 tests PASS.
- `npx eslint` on all 10 changed files individually → 0 problems.

## Remaining (out of scope — PARK for slice-3)

- Full `pnpm lint` also runs `pnpm run lint:ui-tokens` (`scripts/check-ui-tokens.mjs`), a **separate** check over *external* `.component.css` files (not inline `styles:`/`no-raw-ui-values`). It fails independently with 35 violations in 3 files (`proposal-workspace-demo.page.css`, `block-renderer.component.css`, `proposal-workspace-shell.component.css`). Confirmed via `git stash` that this is pre-existing at `HEAD` (305eec58), unrelated to this slice, and was simply masked before because `eslint src/ && pnpm run lint:ui-tokens` short-circuited on the eslint failure. Out of the ≤15-file / no-raw-ui-values scope of this TZ — PARK for slice-3.
- 17 `no-implements-oninit-in-pages` warnings — explicitly out of scope per TZ.

## Executor report

35/35 `no-raw-ui-values` ESLint errors fixed across 10 files (full remaining batch,
none touching Q4b/slice-1 or `frontend-nx/**`). `eslint src/` now 0 errors.
tsc clean. Focused specs green. `check-ui-tokens.mjs` external-CSS debt
(pre-existing, separate check) documented above for slice-3, not touched.

## Closeout

- [x] archive + `_active` cleared
- Status = DONE
- closed_at: 2026-09-03
