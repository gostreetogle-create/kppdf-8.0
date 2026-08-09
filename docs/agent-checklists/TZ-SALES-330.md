# TZ-SALES-330 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-330.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md`
> Commit/push: **NO** until Cursor/PO visual PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:43:46Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] `origin/main` equals local `HEAD` at `62a54988`; pull skipped because canonical worktree has foreign dirty DOC-343 WIP, preserved in a stash.
- [x] `_active-map` + `tasks/_active/` checked; no active claim conflicts with 330 keys.
- [x] Canon, wave, TZ, and 325 behavior read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-330.md` present.

## Acceptance

- [x] `kpTableLayout` is copy-on-write and never PATCHes shared TableTemplate.
- [x] Panel «Таблица»: ↑/↓ and show/hide trigger rebuild.
- [x] Build respects tableLayout only for the designated live line-items table; `index` is 1-based.
- [x] Hint: «Меняет только это КП, не общий шаблон».
- [x] Backend/frontend gates PASS; visual PO PASS required before archive.
- [x] `docs/pages/proposals-create.page.md` updated.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] FIC: page doc and route scope reviewed; no new page.
- [x] FIC §A–E / docs integrity: page doc updated with the feature contract.
- [x] Foreign WIP excluded from commit.
- [x] Canon: `docs/audits/2026-08-09-kp-table-config-canon.md`.

## Gates (fact)

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `cd backend && pnpm test:e2e test/e2e/document-templates-build.e2e-spec.ts` — PASS, 10/10
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-create.page.spec.ts` — PASS, 12/12
- [x] `git diff --check` — PASS
- [x] Frontend Prettier on changed FE files — PASS

## Executor report (auto)

- Create КП now keeps a request-only `kpTableLayout` copy in session memory.
- Right inspector «Таблица» provides RU-labelled ↑/↓, show/hide, the copy-on-write hint, and a link to Documents presets.
- Build DTO accepts validated `tableLayout`; only the selected live line-items table consumes it.
- Backend renders the requested order/visibility and maps `index` to 1-based row numbers; snapshots and shared TableTemplate persistence are untouched.
- Implementation is ready for Cursor/PO visual review; visual archive gate remains open.
- Foreign DOC-343 WIP was preserved and excluded; no deploy.

## Review handoff

- [x] READY FOR REVIEW
- [ ] Do not archive until Cursor/PO visual PASS.

## Closeout (after PASS)

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: _
