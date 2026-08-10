# TZ-DICT-317 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DICT-317.md`
> Commit/push: **YES** per continuous wave prompt

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `Buffy/freebuff-259639d6-2fe2-49fd-bb50-6b4af549f3c3`
- claimed_at: `2026-08-10T16:36:21.5265057Z`
- workspace: `D:\kppdf-8.0` (host-managed isolated worktree noted in marker)
- team_room_claim: unavailable (Team Room joined; root task not recognized by sync)

## Preflight

- [x] Get-Location + git rev-parse performed; host resolved to Freebuff isolated worktree, logical project workspace is `D:\kppdf-8.0`.
- [x] Read `_active-map.md` and `tasks/_active/`; no competing active claim was present.
- [x] TZ, wave, audit, GEMINI, executor skill, and AI agent guide read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-DICT-317.md` created.

## Acceptance

- [x] Admin and manager are accepted by the unit POST/PATCH/DELETE role metadata; the page preserves the existing add flow and surfaces API errors.
- [x] Pencil opens `UnitFormDialogComponent`; PATCH sends label/symbol/category and closes with the updated unit, after which the list reloads.
- [x] The inert «Не применимо» edit action is gone; the pencil has a real RU label and test selector.
- [x] System-unit delete remains disabled/guarded while label/symbol/category editing remains available.
- [x] POST/PATCH/DELETE unit mutations accept admin and manager roles; ordinary reads retain user access.
- [x] Frontend/backend typechecks and focused tests pass.
- [x] Executor report, archive marker, lock, checkpoint, commit, and push completed.

## Integrity slot (до READY / archive)

- [x] Тип изменения: page + permission/API policy.
- [x] FIC §A–E reviewed; N/A — no route/module/MCP wiring changed.
- [x] `docs/pages/measurements-group.page.md` updated with CRUD behavior.
- [x] SECTION-READINESS N/A — existing page/group section only.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest measurements-group.page.spec.ts --runInBand` — PASS (6/6)
- [x] `cd backend && pnpm exec jest src/modules/unit/unit.controller.spec.ts --runInBand` — PASS (2/2)
- [x] `cd frontend && pnpm run build:dev` — PASS
- [x] `git diff --check` — PASS
- [x] changed-file ESLint — PASS (frontend + backend controller)
- [ ] Prettier — backend has no Prettier binary; frontend CRLF baseline reports differences; commit hook formats staged TS.

## Executor report (auto)

- status: DONE
- changed: `measurements-group.page.ts`, `measurements-group.page.spec.ts`, `units.service.ts`, `unit.controller.ts`, focused backend spec, `measurements-group.page.md`
- conflict disclosure: no competing `_active` keys at claim time; only declared unit/measurements/controller/docs keys plus the focused controller spec were touched.
- evidence: page and dialog regressions pass; RBAC metadata regression confirms admin+manager mutations and user reads.
- known limits: drag-reorder is out of scope; dense inline-add layout remains; live browser/data smoke was not available in this isolated session.

## Review handoff

- [x] READY FOR REVIEW evidence recorded in this checklist; continuous wave closeout follows automated gates.
- [x] Archive permitted by the continuous wave prompt after the documented automated gates.

## Closeout (после PASS)

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-10T16:43:00Z`
