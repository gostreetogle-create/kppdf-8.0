# WAVE — NX Production Gantt L0 (port)

Status: **READY for Freebuff continuous** · 2026-09-04  
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
- [x] **G5** Write estimate/plannedDate — `tasks/_ready/nx-gantt/TZ-NX-GANTT-G5-WRITE-PATH.md`
- [x] **G6** Workers view — `tasks/_ready/nx-gantt/TZ-NX-GANTT-G6-WORKERS-VIEW.md`
- [ ] **G7** Smoke + docs Integrity — `tasks/_ready/nx-gantt/TZ-NX-GANTT-G7-SMOKE-DOCS.md`

## Closeout

- [ ] Все G0–G7 [x]; `_active/` пуст  
- [ ] `nx build kppdf-web` PASS на HEAD  
- [ ] `_NOW.md` + `QUEUE-LIVE.md` обновлены  
- [ ] Push

## Hard rules

- Один TZ → claim → code → gates → archive → commit/push → **сразу** следующий [ ].  
- LAST gate каждой TZ с кодом: `cd frontend-nx && pnpm exec nx build kppdf-web`  
- Не трогать Doc Studio / S37. Не L1–L6. Не legacy `frontend/` rewrite (только читать как эталон).  
- Conflict: два агента на `apps/kppdf-web` — STOP если чужой active на тех же keys.
