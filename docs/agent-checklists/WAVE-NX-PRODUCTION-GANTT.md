# WAVE — NX Production Gantt L0 (port)

Status: **DONE** · 2026-09-05 (live smoke PASS, `docs/audits/2026-09-05-gantt-nx-smoke.md`) · 2026-09-04  
Master: `tasks/PROMPT-FREEBUFF-NX-GANTT-MASTER.md`  
START: `tasks/PROMPT-FREEBUFF-NX-GANTT-START.md`  
RESUME: `tasks/PROMPT-FREEBUFF-NX-GANTT-RESUME.md`

## Goal L0

NX `/production` = привычный план-Гант с legacy (дерево, ▸, каскад, масштаб, «По рабочим») + фикс пан/drag.  
Визуал не переизобретать. Табель %/часов в день — **нет**. L1+ (проектирование→Гант, уведомления, авто-назначение) — **не** в этой волне.

## PO clarifications (2026-09-04)

- **Контроль только менеджер** (admin|manager). Рабочие систему для Ганта не ведут.  
- «Гейт» = фильтр «попадает на Гант только когда можно» (проектирование) — **L2 later**, в L0 как на legacy (активные заказы).  
- «Один статус» = готовность модуля/изделия пишется в данные заказа, Гант только показывает — **L4 later**.

## Chain (отмечай [x] после archive+push)

- [x] **G0** Audit port matrix — `tasks/_archive/2026-09/TZ-NX-GANTT-G0-PORT-AUDIT.done.md`
- [x] **G1** Route + shell — `tasks/_archive/2026-09/TZ-NX-GANTT-G1-SHELL-ROUTE.done.md`
- [x] **G2** Read facade + bar model — `tasks/_archive/2026-09/TZ-NX-GANTT-G2-READ-MODEL.done.md`
- [x] **G3** Tree + cascade UI — архив `tasks/_archive/2026-09/TZ-NX-GANTT-G3-TREE-CASCADE.done.md`
- [x] **G4** Zoom/pan/today fixes — архив `tasks/_archive/2026-09/TZ-NX-GANTT-G4-PAN-ZOOM-FIX.done.md`
- [x] **G5** Write estimate/plannedDate — архив `tasks/_archive/2026-09/TZ-NX-GANTT-G5-WRITE-PATH.done.md`
- [x] **G6** Workers view — архив `tasks/_archive/2026-09/TZ-NX-GANTT-G6-WORKERS-VIEW.done.md`
- [x] **G7** Smoke + docs Integrity — архив `tasks/_archive/2026-09/TZ-NX-GANTT-G7-SMOKE-DOCS.done.md` · smoke: `docs/audits/2026-09-05-gantt-nx-smoke.md`

## Closeout

- [x] Все G0–G7 [x]; `_active/` пуст  
- [x] `nx build kppdf-web` PASS на HEAD  
- [x] `_NOW.md` + `QUEUE-LIVE.md` обновлены  
- [x] Push ✅ (closeout-коммит G7)

## Acceptance summary (2026-09-05)

- Живой smoke на `:4201` admin: nav → `/production`, каскад 4 уровня, drag plannedDate +3д (PATCH 200, scroll 0→0, range не «залип»), workers toggle туда-обратно, Сегодня/Fit/Месяц/День — PASS; консоль чистая.
- Jest: 68/69 suites, 435 tests green; единственный fail — pre-existing `registries.catalog.spec` (чужой `59bcf499`, вне волны).
- Page doc → NX SoT (`NX PORT DONE`), PAGE-TZ-INDEX строка обновлена.

## Hard rules

- Один TZ → claim → code → gates → archive → commit/push → **сразу** следующий [ ].  
- LAST gate каждой TZ с кодом: `cd frontend-nx && pnpm exec nx build kppdf-web`  
- Не трогать Doc Studio / S37. Не L1–L6. Не legacy `frontend/` rewrite (только читать как эталон).  
- Conflict: два агента на `apps/kppdf-web` — STOP если чужой active на тех же keys.
