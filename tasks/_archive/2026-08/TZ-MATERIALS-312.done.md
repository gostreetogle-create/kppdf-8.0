# TZ-MATERIALS-312 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10T16:52:42.9338327Z
closed_by: Buffy / continuous executor
workspace: `D:\\kppdf-8.0` (executed in the host-managed Freebuff worktree)

## Scope

Material supplier selection now explicitly handles empty, error, and loading states. Suppliers remain organizations queried with `type: 'supplier'`; inactive organizations are not offered. The empty state gives a Russian hint and a link to `/organizations`, errors render below the field, and loading disables the overflow select with a short hint.

The «Габариты» section is wrapped in `w-full lg:w-1/2 max-w-xl`, keeping mobile full width while limiting desktop width to approximately half of the dialog. Dimension payload semantics and `isImmutable` behavior were not changed.

## Acceptance evidence

- Empty supplier list: visible `Нет поставщиков — создайте организацию с типом Поставщик` and `/organizations` link.
- Supplier failure: extracted error is rendered under «Поставщик» and suppresses the empty hint.
- Supplier loading: `PiOverflowSelect` receives `[disabled]="suppliersLoading()"`; the field shows `Загрузка поставщиков…`.
- Desktop/mobile dimensions layout: `w-full lg:w-1/2 max-w-xl`; focused regression test covers both responsive classes.
- Focused material form suite: 43/43 PASS, including legacy dimensions and `isImmutable` payload coverage.

## Gates

- frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- focused Jest: PASS (`material-form-dialog.component.spec.ts`, 43/43)
- ESLint: PASS on changed frontend files
- `git diff --check`: PASS
- Prettier: repository working-tree CRLF mismatch remains; baseline content via `git show | prettier --check` passes.
- backend changes: none
- live browser smoke: NOT RUN; backend/data were unavailable in the isolated session
- deploy: NO (`deploy.ps1` not run)

## Files

- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.spec.ts`
- `docs/pages/materials.page.md`
- `docs/agent-checklists/TZ-MATERIALS-312.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-MATERIALS-312-supplier-empty-dims-half.lock`
