# TZ-NX-GANTT-G14-BAR-ASSIGNEE checklist

> Status: **CLAIMED / IN PROGRESS** (scope: backend-only, G14-BE)
> Marker: `tasks/_active/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md`
> Commit/push: `docs/GIT-POLICY.md` (continuous executor on main)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-05T06:31:16Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Scope split (PO prompt 2026-09-05)

- **G14-BE (this pass):** `backend/src/modules/order/order.schema.ts`, `dto/*` (new patch dto),
  `order.service.ts`, `order.controller.ts`, `order.service.spec.ts` (+ controller spec if needed).
- **G13 + G14-FE:** deferred — `production/**` currently held by Freebuff
  (`docs/agent-checklists/WAVE-NX-GANTT-ASSIGN.md`). Re-check `git status` /
  `tasks/_active/` before claiming FE conflict keys.

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-NX-GANTT-G10-PHOTO-THUMBS.md`, другие conflict keys, не пересекается
- [x] TZ / канон / deps прочитаны (audit `2026-09-05-gantt-worker-assignment-audit.md`, `WAVE-NX-GANTT-ASSIGN.md`, `order.schema.ts`/`order.service.ts` estimateDayOverrides pattern as mirror)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md` на месте

## Acceptance (BE slice)

- [ ] `Order.estimateWorkerOverrides[]` schema field: `{ orderItemIndex, moduleId, workTypeId, workerIds: ObjectId[] }`
- [ ] `PATCH /orders/:id/estimate-worker` — upsert/clear by composite key, org-scope `assertOrgAccess` BEFORE save
- [ ] Empty/absent override → no auto-fill from skills (FE will render "Не назначен")
- [ ] Tests: upsert, update existing, clear (empty array), unknown line index, cross-org reject (no save), matching-org allow
- [ ] Gates BE PASS (tsc/test/lint)

## Integrity slot (до READY / archive)

- [ ] Тип изменения: module (backend field + endpoint), FE deferred
- [ ] FIC — N/A this pass (backend-only slice, no page.md UI change yet; FE TZ will carry FIC)
- [ ] page.md — N/A this pass (no UI route touched in G14-BE)
- [ ] Чужой WIP не в коммите; conflict keys соблюдены (только backend/src/modules/order/*)
- [ ] Coupling map — N/A (не трогал общее поле/статус вне Order)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — TBD
- `cd backend && pnpm test` — TBD
- `cd backend && pnpm lint` — TBD

## Executor report

- TBD after implementation.

## Review handoff

- [ ] READY FOR REVIEW — n/a for BE-only continuous slice (no wave inbox requirement); PO report on completion.

## Closeout (после PASS)

- [ ] G14-BE: mark `[x]` in `WAVE-NX-GANTT-ASSIGN.md`; commit + push on main
- [ ] Full G14 (incl. FE) archives only after G14-FE done — this checklist stays IN PROGRESS until then
