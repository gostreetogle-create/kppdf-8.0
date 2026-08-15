# TZ-ORDERS-336 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-ORDERS-336.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T20:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ; Team Room `claim` unknown task)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (audit 2026-08-15 order-edit; convert ensureDefault)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-ORDERS-336.md` на месте (removed after archive)

Mode: **TZ-exec**. Primary signal: Save posts productId; empty CP gets default Site; freeze payload/UI.

## Acceptance

- [x] Create order: pick product → Save → POST succeeds (toast + close)
- [x] Edit: add second line + pick product → Save PATCH with both productIds
- [x] Counterparty without sites → default site appears selected
- [x] Order in_production: can save plannedDate/priority; cannot change items UI
- [x] FE tsc + order-form-dialog jest PASS
- [x] page.md + archive + push

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (+ thin existing Site API)
- [x] FIC §A–E: §A page.md + PAGE-TZ-INDEX; §C thin `POST /sites/ensure-default` on existing module; §B/D/E N/A
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (section status unchanged)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (+ thin BE site.controller/dto as TZ allowed)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `frontend` `pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- `backend` `pnpm exec tsc -p tsconfig.build.json --noEmit`: PASS
- `frontend` jest order-form-dialog.component.spec: PASS — 9 tests
- `backend` jest site.service.spec: PASS — 4 tests
- eslint owned FE+BE files: PASS

Primary signal: met (productId POST/PATCH, ensure-default Site, freeze payload)
Secondary: PASS

## Executor report

- P0: `onProductPick` now sets `productId`; invalid submit RU «Выберите изделие в каждой позиции».
- Empty sites → `POST /api/sites/ensure-default` wrapping `ensureDefaultForCounterparty`.
- Freeze: plan statuses PATCH only plannedDate/priority; hard statuses read-only.
- Dates: header `type="date"`; new line ship date = header || today.
- Conflict disclosure: none parallel in `_active`. Thin BE not in original conflict keys; TZ allowed it.
- Deploy: not run.

## Review handoff

- [x] TZ does not require Cursor Verdict before archive (executor closeout)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T20:40:00Z
